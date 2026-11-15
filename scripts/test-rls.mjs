// Prueba las reglas de seguridad de la base de datos con un Postgres embebido.
// Uso: node scripts/test-rls.mjs
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const db = new PGlite();
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin; create role authenticated nologin;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
for (const f of ["0001_init.sql", "0002_no_secret_key.sql", "0003_leads.sql", "0004_capacity.sql"]) {
  await db.exec(readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), "utf8"));
}

const A = "00000000-0000-0000-0000-00000000000a", B = "00000000-0000-0000-0000-00000000000b", ADM = "00000000-0000-0000-0000-0000000000ad";
await db.exec(`
  insert into auth.users values ('${A}', 'juan@x.com'), ('${B}', 'pepe@x.com'), ('${ADM}', 'admin@x.com');
  insert into public.admins values ('${ADM}');
  insert into public.restaurants (id, slug, name, profile) values
    ('10000000-0000-0000-0000-000000000001', 'bar-juan', 'Bar Juan', '{"reservations": {"accepted": true}}'),
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


// ───── Funciones de 0002 ─────
const J = "10000000-0000-0000-0000-000000000001", P = "20000000-0000-0000-0000-000000000002";
await as("anon", null, async () => {
  const r = await db.query("select * from public.get_restaurant('bar-juan')");
  check("anónimo lee la ficha pública", r.rows.length === 1);
  check("la ficha pública NO incluye el email de avisos", !r.fields.some((f) => f.name === "notify_email"));
  const c1 = (await rows(`select public.log_exchange('${J}', null, 'es', 'hola', 'buenas') as id`))[0].id;
  check("anónimo guarda una conversación", !!c1);
  const c2 = (await rows(`select public.log_exchange('${J}', '${c1}', 'es', 'otra', 'vale') as id`))[0].id;
  check("la 2ª pregunta va a la misma conversación", c2 === c1);
  const c3 = (await rows(`select public.log_exchange('${P}', '${c1}', 'es', 'colar', 'no') as id`))[0].id;
  check("no se puede escribir en la conversación de otro local", c3 !== c1);
  check("reserva válida", (await rows(`select public.create_reservation('${J}', '${c1}', 'Ana', '2026-12-01', '21:00', 4, '600111222', '', 'es') as ok`))[0].ok === true);
  check("reserva con datos malos rechazada", await fails_(`select public.create_reservation('${J}', null, '', 'mañana', '21:00', 0, '', '', 'es')`));
  check("reserva en local que no acepta reservas rechazada", await fails_(`select public.create_reservation('${P}', null, 'Ana', '2026-12-01', '21:00', 2, '600111222', '', 'es')`));
  check("anónimo NO puede crear restaurantes", await fails_(`select public.admin_create_restaurant('X', 'x', '{}', '')`));
  check("anónimo sigue sin poder leer mensajes", await fails_("select * from public.messages"));
});
await as("authenticated", A, async () => {
  check("un dueño NO puede invitar", await fails_(`select public.admin_invite('${P}', 'yo@x.com')`));
  check("un dueño NO puede editar como admin", await fails_(`select public.admin_update_restaurant('${P}', 'X', '{}', '', true)`));
  check("Juan ve las 2 conversaciones nuevas de su local", (await rows("select * from public.conversations")).length === 2);
});
await as("authenticated", ADM, async () => {
  check("admin invita a un email sin cuenta", (await rows(`select public.admin_invite('${J}', 'Nuevo@X.com') as r`))[0].r === "invited");
  check("admin da acceso a alguien con cuenta", (await rows(`select public.admin_invite('${P}', 'juan@x.com') as r`))[0].r === "linked");
  const id = (await rows(`select public.admin_create_restaurant('Bar Nuevo', 'bar-nuevo', '{}', '') as id`))[0].id;
  check("admin crea restaurante", !!id);
  await db.query(`select public.admin_update_restaurant('${id}', 'Bar Nuevo 2', '{}', '', false)`);
});
await db.exec("insert into auth.users values ('00000000-0000-0000-0000-0000000000ee', 'nuevo@x.com')");
check("al registrarse, el invitado queda unido a su local",
  (await rows("select * from public.restaurant_members where user_id = '00000000-0000-0000-0000-0000000000ee'")).length === 1);
await as("anon", null, async () => {
  check("restaurante desactivado no se ve", (await rows("select * from public.get_restaurant('bar-nuevo')")).length === 0);
});

// ───── Solicitudes de contacto (0003) ─────
const lead = (name, phone, email = "") =>
  `select public.create_lead('${name}', 'Bar Sol', 'Bar', 'Palma', '${phone}', '${email}', 'Hola', 'test') as ok`;
await as("anon", null, async () => {
  check("anónimo envía una solicitud", (await rows(lead("Toni", "600 111 222", "toni@x.com")))[0].ok === true);
  check("solicitud sin teléfono válido rechazada", await fails_(lead("Toni", "12")));
  check("solicitud con email raro rechazada", await fails_(lead("Toni", "600111222", "no-es-email")));
  check("anónimo NO puede leer solicitudes", await fails_("select * from public.leads"));
});
await as("authenticated", A, async () => {
  check("un dueño NO ve las solicitudes", (await rows("select * from public.leads")).length === 0);
});
await as("authenticated", ADM, async () => {
  check("admin ve la solicitud", (await rows("select * from public.leads")).length === 1);
  await db.query("update public.leads set status = 'contacted', notes = 'Llamado el lunes'");
  check("admin no puede cambiar los datos que envió el cliente", await fails_("update public.leads set phone = '0'"));
});
check("admin marcó la solicitud como contactada", (await rows("select status from public.leads"))[0].status === "contacted");

// ───── Aforo (0004): 2 mesas y 8 plazas → 4 personas por mesa ─────
const C = "30000000-0000-0000-0000-000000000003";
await db.exec(`insert into public.restaurants (id, slug, name, profile) values
  ('${C}', 'bar-aforo', 'Bar Aforo', '{"reservations": {"accepted": true}, "capacity": {"tables": 2, "seats": 8}}')`);
const book = (people, time, day = "2026-12-20") =>
  `select public.create_reservation('${C}', null, 'Cliente', '${day}', '${time}', ${people}, '600111222', '', 'es') as ok`;
await as("anon", null, async () => {
  check("cena: 1ª reserva (4 pers.) entra", (await rows(book(4, "21:00")))[0].ok === true);
  check("cena: 2ª reserva (3 pers.) entra", (await rows(book(3, "21:30")))[0].ok === true);
  check("cena: 3ª reserva rechazada, no quedan mesas", await fails_(book(1, "22:00")));
  check("comida del mismo día sí tiene sitio", (await rows(book(2, "14:00")))[0].ok === true);
  check("grupo más grande que el aforo rechazado", await fails_(book(9, "13:00", "2026-12-21")));
  check("grupo de 6 ocupa 2 mesas y entra", (await rows(book(6, "13:00", "2026-12-21")))[0].ok === true);
  check("después del grupo de 6 ya no cabe nadie en esa comida", await fails_(book(1, "13:30", "2026-12-21")));
  check("fecha pasada rechazada", await fails_(book(2, "21:00", "2020-01-01")));
});
await db.exec(`update public.reservations set status = 'rejected' where restaurant_id = '${C}' and day = '2026-12-20' and time = '21:30'`);
await as("anon", null, async () => {
  check("al rechazar una, vuelve a quedar sitio", (await rows(book(2, "22:00")))[0].ok === true);
});
await db.exec(`update public.restaurants set profile = '{"reservations": {"accepted": true}}' where id = '${C}'`);
await as("anon", null, async () => {
  check("sin aforo configurado, no hay límite", (await rows(book(50, "21:00")))[0].ok === true);
});

console.log(fails ? `\n${fails} fallos` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
