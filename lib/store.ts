import "server-only";
import { notifyReservation, type ReservationRequest } from "./notify";
import type { Restaurant } from "./clients";
import { createAdminClient } from "./supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Guarda la pregunta y la respuesta. Devuelve el id de la conversación (nuevo o el mismo). */
export async function saveExchange(
  r: Restaurant,
  conversationId: string | null,
  lang: string,
  question: string,
  answer: string,
): Promise<string | null> {
  if (!r.id) return null; // demo: no se guarda
  const db = createAdminClient();
  let convId: string | null = null;

  // Solo reutilizamos la conversación si de verdad pertenece a este restaurante.
  if (conversationId && UUID.test(conversationId)) {
    const { data } = await db
      .from("conversations")
      .select("id, message_count")
      .eq("id", conversationId)
      .eq("restaurant_id", r.id)
      .maybeSingle();
    if (data) {
      convId = data.id;
      await db
        .from("conversations")
        .update({ message_count: data.message_count + 2, last_message_at: new Date().toISOString(), lang })
        .eq("id", data.id);
    }
  }
  if (!convId) {
    const { data, error } = await db
      .from("conversations")
      .insert({ restaurant_id: r.id, lang, message_count: 2 })
      .select("id")
      .single();
    if (error) {
      console.error("[store] no se pudo crear la conversación:", error.message);
      return null;
    }
    convId = data.id;
  }

  const { error } = await db.from("messages").insert([
    { conversation_id: convId, restaurant_id: r.id, role: "user", content: question },
    { conversation_id: convId, restaurant_id: r.id, role: "assistant", content: answer },
  ]);
  if (error) console.error("[store] no se pudieron guardar los mensajes:", error.message);
  return convId;
}

/** Guarda una petición de reserva y avisa al restaurante. */
export async function createReservation(
  r: Restaurant,
  req: ReservationRequest,
  conversationId: string | null,
  lang: string,
): Promise<boolean> {
  if (!r.id) return true; // demo: se simula
  const db = createAdminClient();
  const conv = conversationId && UUID.test(conversationId) ? conversationId : null;
  const { error } = await db.from("reservations").insert({
    restaurant_id: r.id,
    conversation_id: conv,
    name: req.name,
    day: req.day,
    time: req.time,
    people: req.people,
    contact: req.contact,
    notes: req.notes || null,
    lang,
  });
  if (error) {
    // Si la conversación no es de este local, la FK puede fallar: reintenta sin ella.
    if (conv) return createReservation(r, req, null, lang);
    console.error("[store] no se pudo guardar la reserva:", error.message);
    return false;
  }
  await notifyReservation(r.notifyEmail, r.client.name, req);
  return true;
}
