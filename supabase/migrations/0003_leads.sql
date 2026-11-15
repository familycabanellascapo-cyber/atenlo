-- ATENLO · 0003: solicitudes de contacto / demo desde la web.
-- Ejecutar en Supabase → SQL Editor (una sola vez, después de 0002).

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business text not null,          -- nombre del local
  business_type text,              -- bar, restaurante, cafetería…
  town text,                       -- municipio / zona
  phone text not null,
  email text,
  message text,
  source text,                     -- qué botón pulsó
  status text not null default 'new' check (status in ('new', 'contacted', 'client', 'discarded')),
  notes text,                      -- tus notas internas
  created_at timestamptz not null default now()
);
create index on public.leads (created_at desc);

alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;

-- Solo los administradores ven y gestionan las solicitudes.
grant select on public.leads to authenticated;
grant update (status, notes) on public.leads to authenticated;
create policy "admins ven solicitudes" on public.leads
  for select to authenticated using (public.is_admin());
create policy "admins gestionan solicitudes" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Cualquiera puede ENVIAR una solicitud (no leerlas), con comprobaciones.
create function public.create_lead(
  p_name text, p_business text, p_business_type text, p_town text,
  p_phone text, p_email text, p_message text, p_source text
) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if length(trim(coalesce(p_name, ''))) not between 2 and 80
     or length(trim(coalesce(p_business, ''))) not between 2 and 100
     or length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) not between 9 and 15
     or length(coalesce(p_email, '')) > 120
     or (coalesce(p_email, '') <> '' and p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
     or length(coalesce(p_message, '')) > 1000
     or length(coalesce(p_business_type, '')) > 40
     or length(coalesce(p_town, '')) > 60 then
    raise exception 'datos no válidos';
  end if;
  -- Freno anti-spam global: máximo 60 solicitudes por hora.
  if (select count(*) from public.leads where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'demasiadas solicitudes';
  end if;
  insert into public.leads (name, business, business_type, town, phone, email, message, source)
  values (trim(p_name), trim(p_business), nullif(trim(p_business_type), ''), nullif(trim(p_town), ''),
          trim(p_phone), nullif(lower(trim(p_email)), ''), nullif(trim(p_message), ''), left(p_source, 40));
  return true;
end $$;

revoke all on function public.create_lead(text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_lead(text, text, text, text, text, text, text, text) to anon, authenticated;

-- De paso: las funciones de administrador ya comprobaban el permiso por dentro,
-- pero además quitamos que los anónimos puedan siquiera llamarlas.
revoke execute on function public.admin_create_restaurant(text, text, jsonb, text) from anon;
revoke execute on function public.admin_update_restaurant(uuid, text, jsonb, text, boolean) from anon;
revoke execute on function public.admin_invite(uuid, text) from anon;
