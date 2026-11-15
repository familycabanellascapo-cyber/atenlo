-- ATENLO · esquema inicial
-- Ejecutar en Supabase → SQL Editor (una sola vez).
--
-- Privacidad:
--  · Los clientes del restaurante (anónimos) NO pueden leer nada: el chat
--    escribe desde el servidor con la clave de servicio.
--  · Cada dueño solo ve las filas de SU restaurante (reglas RLS).
--  · Los administradores de ATENLO (tabla admins) ven todo.

-- ───────────── Tablas ─────────────

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 60),
  name text not null,
  profile jsonb not null,            -- la ficha: horario, carta, alérgenos, info práctica…
  notify_email text,                 -- dónde llegan los avisos de reserva
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table public.restaurant_members (
  user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  primary key (user_id, restaurant_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  lang text,
  message_count int not null default 0,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index on public.conversations (restaurant_id, last_message_at desc);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.messages (conversation_id, id);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  name text not null,
  day text not null,
  time text not null,
  people int not null check (people between 1 and 200),
  contact text not null,
  notes text,
  lang text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz not null default now()
);
create index on public.reservations (restaurant_id, created_at desc);

-- ───────────── Funciones de permisos ─────────────

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create function public.is_member(rid uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_admin()
      or exists (select 1 from public.restaurant_members where user_id = auth.uid() and restaurant_id = rid)
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_member(uuid) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_member(uuid) to authenticated;

-- ───────────── Reglas de acceso (RLS) ─────────────

alter table public.restaurants enable row level security;
alter table public.admins enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reservations enable row level security;

-- Por defecto, nadie anónimo toca nada.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

-- Restaurantes: el dueño lee el suyo y solo puede cambiar la ficha y el email de avisos.
grant select on public.restaurants to authenticated;
grant update (profile, notify_email) on public.restaurants to authenticated;
create policy "miembros leen su restaurante" on public.restaurants
  for select to authenticated using (public.is_member(id));
create policy "miembros editan su restaurante" on public.restaurants
  for update to authenticated using (public.is_member(id)) with check (public.is_member(id));

-- Admins: cada uno puede comprobar si es admin.
grant select on public.admins to authenticated;
create policy "ver mi fila de admin" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Miembros: ves tus propias pertenencias.
grant select on public.restaurant_members to authenticated;
create policy "ver mis restaurantes" on public.restaurant_members
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Conversaciones y mensajes: solo lectura para el restaurante dueño.
grant select on public.conversations to authenticated;
create policy "miembros leen conversaciones" on public.conversations
  for select to authenticated using (public.is_member(restaurant_id));

grant select on public.messages to authenticated;
create policy "miembros leen mensajes" on public.messages
  for select to authenticated using (public.is_member(restaurant_id));

-- Reservas: el restaurante las lee y solo puede cambiar el estado.
grant select on public.reservations to authenticated;
grant update (status) on public.reservations to authenticated;
create policy "miembros leen reservas" on public.reservations
  for select to authenticated using (public.is_member(restaurant_id));
create policy "miembros cambian estado de reservas" on public.reservations
  for update to authenticated using (public.is_member(restaurant_id)) with check (public.is_member(restaurant_id));
