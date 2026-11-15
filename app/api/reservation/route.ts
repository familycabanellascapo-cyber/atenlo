import { NextResponse } from "next/server";
import { getRestaurant } from "@/lib/clients";
import { clientIp, rateLimited } from "@/lib/ratelimit";
import { createReservation } from "@/lib/store";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Petición de reserva desde el formulario del chat (funciona con o sin IA).
export async function POST(req: Request) {
  if (rateLimited(`res:${clientIp(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Demasiadas peticiones. Llama al restaurante, por favor." }, { status: 429 });
  }

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  const restaurant = typeof b.slug === "string" ? await getRestaurant(b.slug) : null;
  if (!restaurant) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });
  if (!restaurant.client.reservations.accepted) {
    return NextResponse.json({ error: "Este local no acepta reservas" }, { status: 400 });
  }

  const name = str(b.name, 80);
  const day = str(b.day, 20);
  const time = str(b.time, 10);
  const contact = str(b.contact, 120);
  const notes = str(b.notes, 300);
  const people = Number(b.people);
  const lang = ["es", "en", "de"].includes(String(b.lang)) ? String(b.lang) : "es";

  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(time) || !contact || !Number.isInteger(people) || people < 1 || people > 200) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const result = await createReservation(
    restaurant,
    { name, day, time, people, contact, notes },
    typeof b.conversationId === "string" ? b.conversationId : null,
    lang,
  );
  if (result === "full") return NextResponse.json({ error: "full" }, { status: 409 });
  if (result === "invalid") return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  if (result === "error") return NextResponse.json({ error: "No se pudo enviar" }, { status: 500 });
  return NextResponse.json({ ok: true, demo: restaurant.id === null });
}
