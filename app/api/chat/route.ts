import { NextResponse } from "next/server";
import { aiAnswer, aiEnabled, extractReservation, type ChatMessage } from "@/lib/ai";
import { getClient } from "@/lib/clients";
import { fallbackAnswer } from "@/lib/fallback";

const MAX_MESSAGES = 20;
const MAX_CHARS = 600;

// Límite básico por IP para que nadie dispare el gasto de IA.
// (En memoria: suficiente para empezar; con muchos clientes, pasar a una BD/Redis.)
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return false;
  }
  h.count++;
  return h.count > 40;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Demasiados mensajes. Prueba en unos minutos." }, { status: 429 });
  }

  let body: { slug?: unknown; messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  const client = typeof body.slug === "string" ? getClient(body.slug) : undefined;
  if (!client) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Sin mensajes" }, { status: 400 });
  }
  const messages: ChatMessage[] = body.messages
    .filter(
      (m): m is ChatMessage =>
        !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  const last = messages.at(-1);
  if (!last || last.role !== "user" || !last.content.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  let reply: string;
  let mode: "ai" | "basic" = "basic";
  if (aiEnabled()) {
    try {
      reply = await aiAnswer(client, messages);
      mode = "ai";
    } catch (err) {
      console.error("[chat] fallo de IA, uso modo básico:", err);
      reply = fallbackAnswer(client, last.content);
    }
  } else {
    reply = fallbackAnswer(client, last.content);
  }

  const { text, reservation } = extractReservation(reply);
  if (reservation) {
    // TODO (fase 3): guardar en Supabase y avisar al local por email/WhatsApp.
    console.log(`[reserva] ${client.slug}:`, reservation);
  }

  return NextResponse.json({ reply: text, mode, reservation: Boolean(reservation) });
}
