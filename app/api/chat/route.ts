import { NextResponse } from "next/server";
import { aiAnswer, aiEnabled, type ChatMessage } from "@/lib/ai";
import { getRestaurant } from "@/lib/clients";
import { detectLang, fallbackAnswer, wantsMenu } from "@/lib/fallback";
import { clientIp, rateLimited } from "@/lib/ratelimit";
import { saveExchange } from "@/lib/store";

const MAX_MESSAGES = 20;
const MAX_CHARS = 600;

export async function POST(req: Request) {
  if (rateLimited(`chat:${clientIp(req)}`, 40, 10 * 60_000)) {
    return NextResponse.json({ error: "Demasiados mensajes. Prueba en unos minutos." }, { status: 429 });
  }

  let body: { slug?: unknown; messages?: unknown; conversationId?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }

  const restaurant = typeof body.slug === "string" ? await getRestaurant(body.slug) : null;
  if (!restaurant) return NextResponse.json({ error: "Local no encontrado" }, { status: 404 });
  const client = restaurant.client;

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
  const lang = typeof body.lang === "string" && ["es", "en", "de"].includes(body.lang) ? body.lang : detectLang(last.content);
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

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

  const convId = await saveExchange(restaurant, conversationId, lang, last.content, reply);
  return NextResponse.json({ reply, mode, conversationId: convId, showMenu: wantsMenu(last.content) });
}
