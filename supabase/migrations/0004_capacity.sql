-- ATENLO · 0004: control de aforo en las reservas.
-- El restaurante indica en su panel cuántas mesas se pueden reservar y su aforo máximo
-- (se guarda en profile.capacity = {"tables": 10, "seats": 40}).
-- Las peticiones pendientes y confirmadas de cada turno (comida < 17:00, cena ≥ 17:00)
-- no pueden pasar de esas cifras. Las rechazadas no cuentan.
-- Ejecutar en Supabase → SQL Editor (una sola vez, después de 0003).

create or replace function public.create_reservation(
  p_restaurant uuid, p_conversation uuid, p_name text, p_day text, p_time text,
  p_people int, p_contact text, p_notes text, p_lang text
) returns boolean
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
  -- Freno anti-spam: máximo 30 peticiones por hora y local.
  if (select count(*) from public.reservations
      where restaurant_id = p_restaurant and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'demasiadas peticiones';
  end if;

  -- ── Aforo ──
  max_tables := case when prof -> 'capacity' ->> 'tables' ~ '^\d+$' then (prof -> 'capacity' ->> 'tables')::int else 0 end;
  max_seats  := case when prof -> 'capacity' ->> 'seats'  ~ '^\d+$' then (prof -> 'capacity' ->> 'seats')::int  else 0 end;
  if max_tables > 0 or max_seats > 0 then
    -- Una petición a la vez por local y día, para que dos personas no cojan la última mesa.
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
  );
  return true;
end $$;

revoke all on function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text) from public;
grant execute on function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text) to anon, authenticated;
