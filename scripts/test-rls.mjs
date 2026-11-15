// Prueba las reglas de seguridad de la base de datos con un Postgres embebido.
// Uso: node scripts/test-rls.mjs
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin; create role authenticated nologin;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
await db.exec(readFileSync(new URL("../supabase/migrations/0001_init.sql", import.meta.url), "utf8"));

const A = "00000000-0000-0000-0000-00000000000a", B = "00000000-0000-0000-0000-00000000000b", ADM = "00000000-0000-0000-0000-0000000000ad";
await db.exec(`
  insert into auth.users values ('${A}'), ('${B}'), ('${ADM}');
  insert into public.admins values ('${ADM}');
  insert into public.restaurants (id, slug, name, profile) values
    ('10000000-0000-0000-0000-000000000001', 'bar-juan', 'Bar Juan', '{}'),
    ('20000000-0000-0000-0000-000000000002', 'bar-pepe', 'Bar Pepe', '{}');
  insert into public.restaurant_members values ('${A}', '10000000-0000-0000-0000-000000000001'), ('${B}', '20000000-0000-0000-0000-000000000002');
  insert into public.conversations (id, restaurant_id) values
    ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
    ('c2000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002');
  insert into public.messages (conversation_id, restaurant_id, role, content) values
    ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'user', 'hola juan'),
    ('c2000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'user', 'hola pepe');
  insert into public.reservations (restaurant_id, name, day, time, people, contact) values
    ('10000000-0000-0000-0000-000000000001', 'María', '2026-11-20', '21:00', 4, '600'),
    ('20000000-0000-0000-0000-000000000002', 'Pedro', '2026-11-21', '14:00', 2, '611');
`);

let fails = 0;
const check = (name, ok) => { console.log(`${ok ? "✓" : "✗"} ${name}`); if (!ok) fails++; };
async function as(role, uid, fn) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  try { return await fn(); } finally { await db.exec("reset role;"); }
}
const rows = async (sql) => (await db.query(sql)).rows;
const fails_ = async (sql) => { try { await db.query(sql); return false; } catch { return true; } };

await as("anon", null, async () => {
  check("anónimo no ve restaurantes", await fails_("select * from public.restaurants"));
  check("anónimo no ve mensajes", await fails_("select * from public.messages"));
  check("anónimo no ve reservas", await fails_("select * from public.reservations"));
});

await as("authenticated", A, async () => {
  const r = await rows("select slug from public.restaurants");
  check("Juan solo ve su restaurante", r.length === 1 && r[0].slug === "bar-juan");
  const m = await rows("select content from public.messages");
  check("Juan solo ve sus mensajes", m.length === 1 && m[0].content === "hola juan");
  const c = await rows("select id from public.conversations");
  check("Juan solo ve sus conversaciones", c.length === 1);
  const res = await rows("select name from public.reservations");
  check("Juan solo ve sus reservas", res.length === 1 && res[0].name === "María");
  await db.query("update public.reservations set status = 'confirmed'");
  check("Juan no puede cambiar el nombre de una reserva", await fails_("update public.reservations set name = 'X'"));
  check("Juan no puede cambiar su slug", await fails_("update public.restaurants set slug = 'otro'"));
  check("Juan no puede borrar reservas", await fails_("delete from public.reservations"));
  check("Juan no puede escribir mensajes", await fails_("insert into public.messages (conversation_id, restaurant_id, role, content) values ('c1000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','user','x')"));
  await db.query(`update public.restaurants set notify_email = 'juan@x.com'`);
  check("Juan no ve que sea admin", (await rows("select * from public.admins")).length === 0);
});

const st = await rows("select r.slug, v.status from public.reservations v join public.restaurants r on r.id = v.restaurant_id order by r.slug");
check("Juan confirmó la suya y no tocó la de Pepe", st[0].status === "confirmed" && st[1].status === "pending");
const ne = await rows("select slug, notify_email from public.restaurants order by slug");
check("Juan cambió su email de avisos y no el de Pepe", ne[0].notify_email === "juan@x.com" && ne[1].notify_email === null);

await as("authenticated", B, async () => {
  const m = await rows("select content from public.messages");
  check("Pepe solo ve sus mensajes", m.length === 1 && m[0].content === "hola pepe");
});

await as("authenticated", ADM, async () => {
  check("Admin ve todos los restaurantes", (await rows("select * from public.restaurants")).length === 2);
  check("Admin ve todas las reservas", (await rows("select * from public.reservations")).length === 2);
});

console.log(fails ? `\n${fails} fallos` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
