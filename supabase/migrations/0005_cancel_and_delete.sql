-- ATENLO · 0005: el cliente puede cancelar su reserva y el admin puede eliminar un local.
-- Ejecutar en Supabase → SQL Editor (una sola vez, después de 0004).

-- ───────────── Cancelación por el cliente ─────────────
-- Cada reserva tiene un código secreto. Con él (en el enlace que recibe el cliente)
-- puede ver su reserva y cancelarla. Sin el código no se puede ver nada.
alter table public.reservations add column cancel_token uuid not null default gen_random_uuid();
create unique index reservations_cancel_token_idx on public.reservations (cancel_token);

alter table public.reservations drop constraint reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in ('pending', 'confirmed', 'rejected', 'cancelled'));

-- El código no lo ven ni los dueños ni nadie desde la API: solo se devuelve al crear la reserva.
revoke select on public.reservations from authenticated;
grant select (id, restaurant_id, conversation_id, name, day, time, people, contact, notes, lang, status, created_at)
  on public.reservations to authenticated;

-- create_reservation ahora devuelve el código de la reserva (antes devolvía true/false).
drop function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text);

create function public.create_reservation(
  p_restaurant uuid, p_conversation uuid, p_name text, p_day text, p_time text,
  p_people int, p_contact text, p_notes text, p_lang text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  prof jsonb;
  max_tables int;
  max_seats int;
  per_table numeric;
  need int;
  used_tables int;
  used_seats int;
  dinner boolean;
  token uuid;
begin
  select r.profile into prof from public.restaurants r
  where r.id = p_restaurant and r.active
    and coalesce((r.profile -> 'reservations' ->> 'accepted')::boolean, false);
  if prof is null then
    raise exception 'este local no acepta reservas';
  end if;
  if length(coalesce(p_name, '')) not between 1 and 80
     or p_day !~ '^\d{4}-\d{2}-\d{2}$' or p_time !~ '^\d{2}:\d{2}$'
     or p_people not between 1 and 200
     or length(coalesce(p_contact, '')) not between 3 and 120
     or length(coalesce(p_notes, '')) > 300 then
    raise exception 'datos de reserva no válidos';
  end if;
  if p_day::date < (now() at time zone 'Europe/Madrid')::date then
    raise exception 'fecha pasada';
  end if;
  if (select count(*) from public.reservations
      where restaurant_id = p_restaurant and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'demasiadas peticiones';
  end if;

  max_tables := case when prof -> 'capacity' ->> 'tables' ~ '^\d+$' then (prof -> 'capacity' ->> 'tables')::int else 0 end;
  max_seats  := case when prof -> 'capacity' ->> 'seats'  ~ '^\d+$' then (prof -> 'capacity' ->> 'seats')::int  else 0 end;
  if max_tables > 0 or max_seats > 0 then
    perform pg_advisory_xact_lock(hashtext(p_restaurant::text || p_day));
    per_table := case when max_tables > 0 and max_seats > 0 then greatest(max_seats::numeric / max_tables, 1) else 4 end;
    need := greatest(1, ceil(p_people / per_table))::int;
    dinner := p_time >= '17:00';
    select coalesce(sum(greatest(1, ceil(people / per_table))), 0)::int, coalesce(sum(people), 0)::int
      into used_tables, used_seats
      from public.reservations
      where restaurant_id = p_restaurant and day = p_day and status in ('pending', 'confirmed')
        and (time >= '17:00') = dinner;
    if (max_tables > 0 and used_tables + need > max_tables)
       or (max_seats > 0 and used_seats + p_people > max_seats) then
      raise exception 'completo';
    end if;
  end if;

  insert into public.reservations (restaurant_id, conversation_id, name, day, time, people, contact, notes, lang)
  values (
    p_restaurant,
    (select id from public.conversations where id = p_conversation and restaurant_id = p_restaurant),
    p_name, p_day, p_time, p_people, p_contact, nullif(p_notes, ''), left(p_lang, 5)
  )
  returning cancel_token into token;
  return token;
end $$;

-- Ver una reserva con su código (para la página de cancelar).
create function public.get_reservation_by_token(p_token uuid)
returns table (name text, booking_day text, booking_time text, people int, status text, lang text,
               restaurant_name text, restaurant_slug text, restaurant_phone text, accent text)
language sql stable security definer set search_path = ''
as $$
  select v.name, v.day, v.time, v.people, v.status, v.lang,
         r.name, r.slug, r.profile -> 'contact' ->> 'phone', r.profile ->> 'accent'
  from public.reservations v join public.restaurants r on r.id = v.restaurant_id
  where v.cancel_token = p_token
$$;

-- Cancelar con el código. Solo reservas pendientes o confirmadas y de hoy en adelante.
create function public.cancel_reservation(p_token uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  update public.reservations set status = 'cancelled'
  where cancel_token = p_token
    and status in ('pending', 'confirmed')
    and day::date >= (now() at time zone 'Europe/Madrid')::date;
  return found;
end $$;

-- ───────────── Eliminar un local (solo admins) ─────────────
-- Borra el local y TODO lo suyo: conversaciones, mensajes, reservas y accesos.
-- Las cuentas de los dueños no se borran (solo pierden el acceso).
create function public.admin_delete_restaurant(p_id uuid, p_confirm_name text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'solo administradores'; end if;
  delete from public.restaurants where id = p_id and name = p_confirm_name;
  if not found then raise exception 'el nombre no coincide'; end if;
  return true;
end $$;

revoke all on function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text) from public;
revoke all on function public.get_reservation_by_token(uuid) from public;
revoke all on function public.cancel_reservation(uuid) from public;
revoke all on function public.admin_delete_restaurant(uuid, text) from public;
grant execute on function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text) to anon, authenticated;
grant execute on function public.get_reservation_by_token(uuid) to anon, authenticated;
grant execute on function public.cancel_reservation(uuid) to anon, authenticated;
grant execute on function public.admin_delete_restaurant(uuid, text) to authenticated;
revoke execute on function public.admin_delete_restaurant(uuid, text) from anon;
