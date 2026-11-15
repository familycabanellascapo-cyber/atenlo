// Prueba de extremo a extremo contra Supabase real con un restaurante de prueba que se borra al final.
// Uso: node scripts/test-e2e.mjs   (con el servidor en marcha: npm run dev)
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.local");

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const slug = `prueba-${Date.now()}`;
let fails = 0;
const check = (n, ok, extra = "") => { console.log(`${ok ? "✓" : "✗"} ${n}${extra ? ` — ${extra}` : ""}`); if (!ok) fails++; };
const post = (path, body) => fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, json: await r.json() }));

const profile = { kind: "Bar de prueba", languages: ["es", "en", "de"], accent: "#0f766e",
  welcome: { es: "Hola, soy el bar de prueba", en: "Hi", de: "Hallo" },
  contact: { address: "Calle Falsa 1, Palma", phone: "+34 600 000 000" },
  hours: [{ day: "Todos los días", time: "10:00–22:00" }],
  menu: [{ section: "Tapas", dishes: [{ name: "Patatas bravas", price: 6, allergens: [] }, { name: "Croquetas", price: 7, allergens: ["gluten", "lacteos"] }] }],
  facts: [{ topic: "Terraza", answer: "Sí, tenemos terraza.", keywords: ["terraza", "terrace", "terrasse"] }],
  reservations: { accepted: true, how: "Desde el chat" }, handoff: { name: "el equipo", channel: "teléfono +34 600 000 000" } };

const { data: rest, error } = await db.from("restaurants").insert({ slug, name: "Bar Prueba", profile, notify_email: null }).select("id").single();
check("crear restaurante de prueba", !error, error?.message);
if (error) process.exit(1);

try {
  const page = await fetch(`${BASE}/c/${slug}`);
  check("su página de chat carga", page.status === 200 && (await page.text()).includes("Bar Prueba"));

  const a = await post("/api/chat", { slug, lang: "es", messages: [{ role: "user", content: "¿Tenéis terraza?" }] });
  check("responde con su ficha", a.status === 200 && a.json.reply.includes("terraza"), a.json.reply);
  check("devuelve id de conversación", !!a.json.conversationId);

  const b = await post("/api/chat", { slug, lang: "es", conversationId: a.json.conversationId, messages: [
    { role: "user", content: "¿Tenéis terraza?" }, { role: "assistant", content: a.json.reply }, { role: "user", content: "¿Qué horario tenéis?" }] });
  check("misma conversación en la 2ª pregunta", b.json.conversationId === a.json.conversationId);

  const { data: msgs } = await db.from("messages").select("role, content").eq("restaurant_id", rest.id).order("id");
  check("se guardan los 4 mensajes", msgs?.length === 4, `${msgs?.length}`);
  const { data: convs } = await db.from("conversations").select("message_count").eq("restaurant_id", rest.id);
  check("1 conversación con 4 mensajes", convs?.length === 1 && convs[0].message_count === 4);

  const r = await post("/api/reservation", { slug, lang: "es", conversationId: a.json.conversationId, name: "Cliente Prueba", day: "2026-12-12", time: "21:30", people: 3, contact: "600111222" });
  check("petición de reserva aceptada", r.status === 200 && r.json.ok && !r.json.demo);
  const { data: res } = await db.from("reservations").select("name, people, status, conversation_id").eq("restaurant_id", rest.id);
  check("reserva guardada como pendiente y ligada a la conversación", res?.length === 1 && res[0].status === "pending" && res[0].conversation_id === a.json.conversationId);

  const other = await post("/api/chat", { slug: "demo", conversationId: a.json.conversationId, messages: [{ role: "user", content: "hola" }] });
  check("la demo no reutiliza conversaciones reales", other.json.conversationId === null);

  const anon = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?select=content`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY } });
  check("un anónimo NO puede leer los mensajes", anon.status === 401 || (await anon.json()).length === 0);

  await db.from("restaurants").update({ active: false }).eq("id", rest.id);
  const off = await post("/api/chat", { slug, messages: [{ role: "user", content: "hola" }] });
  check("restaurante desactivado deja de responder", off.status === 404);
} finally {
  const { error: delErr } = await db.from("restaurants").delete().eq("id", rest.id);
  const { count } = await db.from("messages").select("id", { count: "exact", head: true }).eq("restaurant_id", rest.id);
  check("datos de prueba borrados", !delErr && count === 0);
}
console.log(fails ? `\n${fails} fallos` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
