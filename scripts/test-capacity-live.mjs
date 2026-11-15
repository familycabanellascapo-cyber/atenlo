// Comprueba en Supabase real que el límite de aforo (0004) está activo.
// Crea un local de prueba con 1 mesa, intenta 2 reservas en el mismo turno y lo borra.
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.local");
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ojevuvmpsrwplflfidob.supabase.co";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_C9fj5EWA-ONls6yxvBNxCA_J_VmWO1K";
const admin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

const { data: r, error } = await admin.from("restaurants").insert({
  slug: `aforo-${Date.now()}`, name: "Prueba aforo (borrar)",
  profile: { reservations: { accepted: true, how: "" }, capacity: { tables: 1, seats: 4 } },
}).select("id").single();
if (error) throw error;
const book = (time) => anon.rpc("create_reservation", {
  p_restaurant: r.id, p_conversation: null, p_name: "Prueba", p_day: "2026-12-24", p_time: time,
  p_people: 2, p_contact: "600000000", p_notes: "", p_lang: "es",
});
try {
  const a = await book("21:00");
  const b = await book("21:30");
  console.log("1ª reserva:", a.error ? `✗ ${a.error.message}` : "✓ aceptada");
  console.log("2ª reserva (sin mesas):", b.error?.message.includes("completo") ? "✓ rechazada por aforo" : `✗ ${b.error?.message ?? "aceptada (0004 NO aplicado)"}`);
} finally {
  await admin.from("restaurants").delete().eq("id", r.id);
  console.log("local de prueba borrado");
}
