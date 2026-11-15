-- ATENLO · 0002: la web ya no necesita la clave secreta.
-- Lo que antes hacía el servidor con la clave secreta, ahora lo hacen estas funciones
-- dentro de la base de datos, con sus propias comprobaciones.
-- Ejecutar en Supabase → SQL Editor (una sola vez, después de 0001).

-- ───────────── Invitaciones de dueños ─────────────
-- El admin apunta el email del dueño; cuando ese email entra por primera vez,
-- queda unido a su restaurante automáticamente.
create table public.restaurant_invites (
  email text not null,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (email, restaurant_id)
);
alter table public.restaurant_invites enable row level security;
revoke all on public.restaurant_invites from anon, authenticated;
grant select on public.restaurant_invites to authenticated;
create policy "admins ven invitaciones" on public.restaurant_invites
  for select to authenticated using (public.is_admin());

create function public.link_invites() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.restaurant_members (user_id, restaurant_id)
  select new.id, i.restaurant_id from public.restaurant_invites i
  where lower(i.email) = lower(new.email)
  on conflict do nothing;
  delete from public.restaurant_invites where lower(email) = lower(new.email);
  return new;
end $$;

create trigger on_auth_user_created_link_invites
  after insert on auth.users
  for each row execute function public.link_invites();

-- ───────────── Funciones públicas (las usa el chat) ─────────────

-- Datos públicos del local (sin email de avisos ni nada privado).
create function public.get_restaurant(p_slug text)
returns table (id uuid, slug text, name text, profile jsonb)
language sql stable security definer set search_path = ''
as $$
  select r.id, r.slug, r.name, r.profile from public.restaurants r
  where r.slug = p_slug and r.active
$$;

-- Guarda una pregunta y su respuesta. Devuelve el id de la conversación.
create function public.log_exchange(
  p_restaurant uuid, p_conversation uuid, p_lang text, p_question text, p_answer text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare conv uuid;
begin
  if not exists (select 1 from public.restaurants where id = p_restaurant and active) then
    raise exception 'restaurante no válido';
  end if;
  if length(coalesce(p_question, '')) not between 1 and 2000 or length(coalesce(p_answer, '')) not between 1 and 4000 then
    raise exception 'mensaje no válido';
  end if;

  -- Reutiliza la conversación solo si es de este local y no está desbordada.
  select c.id into conv from public.conversations c
  where c.id = p_conversation and c.restaurant_id = p_restaurant and c.message_count < 100;

  if conv is null then
    insert into public.conversations (restaurant_id, lang, message_count)
    values (p_restaurant, left(p_lang, 5), 2) returning id into conv;
  else
    update public.conversations
      set message_count = message_count + 2, last_message_at = now(), lang = left(p_lang, 5)
      where id = conv;
  end if;

  insert into public.messages (conversation_id, restaurant_id, role, content) values
    (conv, p_restaurant, 'user', p_question),
    (conv, p_restaurant, 'assistant', p_answer);
  return conv;
end $$;

-- Guarda una petición de reserva (pendiente).
create function public.create_reservation(
  p_restaurant uuid, p_conversation uuid, p_name text, p_day text, p_time text,
  p_people int, p_contact text, p_notes text, p_lang text
) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.restaurants
    where id = p_restaurant and active and coalesce((profile -> 'reservations' ->> 'accepted')::boolean, false)
  ) then
    raise exception 'este local no acepta reservas';
  end if;
  if length(coalesce(p_name, '')) not between 1 and 80
     or p_day !~ '^\d{4}-\d{2}-\d{2}$' or p_time !~ '^\d{2}:\d{2}$'
     or p_people not between 1 and 200
     or length(coalesce(p_contact, '')) not between 3 and 120
     or length(coalesce(p_notes, '')) > 300 then
    raise exception 'datos de reserva no válidos';
  end if;
  -- Freno anti-spam: máximo 30 peticiones por hora y local.
  if (select count(*) from public.reservations
      where restaurant_id = p_restaurant and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'demasiadas peticiones';
  end if;

  insert into public.reservations (restaurant_id, conversation_id, name, day, time, people, contact, notes, lang)
  values (
    p_restaurant,
    (select id from public.conversations where id = p_conversation and restaurant_id = p_restaurant),
    p_name, p_day, p_time, p_people, p_contact, nullif(p_notes, ''), left(p_lang, 5)
  );
  return true;
end $$;

-- ───────────── Funciones de administrador ─────────────

create function public.admin_create_restaurant(p_name text, p_slug text, p_profile jsonb, p_owner_email text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare rid uuid;
begin
  if not public.is_admin() then raise exception 'solo administradores'; end if;
  insert into public.restaurants (name, slug, profile, notify_email)
  values (p_name, p_slug, p_profile, nullif(p_owner_email, ''))
  returning id into rid;
  if coalesce(p_owner_email, '') <> '' then
    perform public.admin_invite(rid, p_owner_email);
  end if;
  return rid;
end $$;

create function public.admin_update_restaurant(p_id uuid, p_name text, p_profile jsonb, p_notify_email text, p_active boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'solo administradores'; end if;
  update public.restaurants
    set name = coalesce(nullif(p_name, ''), name), profile = p_profile,
        notify_email = nullif(p_notify_email, ''), active = p_active
    where id = p_id;
end $$;

-- Da acceso a un dueño. Devuelve 'linked' si ya tenía cuenta, 'invited' si queda pendiente.
create function public.admin_invite(p_restaurant uuid, p_email text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'solo administradores'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is not null then
    insert into public.restaurant_members (user_id, restaurant_id) values (uid, p_restaurant) on conflict do nothing;
    return 'linked';
  end if;
  insert into public.restaurant_invites (email, restaurant_id) values (lower(trim(p_email)), p_restaurant) on conflict do nothing;
  return 'invited';
end $$;

-- ───────────── Permisos de las funciones ─────────────
revoke all on function public.link_invites() from public;
revoke all on function public.get_restaurant(text) from public;
revoke all on function public.log_exchange(uuid, uuid, text, text, text) from public;
revoke all on function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text) from public;
revoke all on function public.admin_create_restaurant(text, text, jsonb, text) from public;
revoke all on function public.admin_update_restaurant(uuid, text, jsonb, text, boolean) from public;
revoke all on function public.admin_invite(uuid, text) from public;

grant execute on function public.get_restaurant(text) to anon, authenticated;
grant execute on function public.log_exchange(uuid, uuid, text, text, text) to anon, authenticated;
grant execute on function public.create_reservation(uuid, uuid, text, text, text, int, text, text, text) to anon, authenticated;
grant execute on function public.admin_create_restaurant(text, text, jsonb, text) to authenticated;
grant execute on function public.admin_update_restaurant(uuid, text, jsonb, text, boolean) to authenticated;
grant execute on function public.admin_invite(uuid, text) to authenticated;
