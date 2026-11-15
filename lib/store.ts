import "server-only";
import type { Restaurant } from "./clients";
import { createPublicClient } from "./supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const conv = (id: string | null) => (id && UUID.test(id) ? id : null);

export type ReservationRequest = {
  name: string;
  day: string;
  time: string;
  people: number;
  contact: string;
  notes?: string | null;
};

/** Guarda la pregunta y la respuesta. Devuelve el id de la conversación (nuevo o el mismo). */
export async function saveExchange(
  r: Restaurant,
  conversationId: string | null,
  lang: string,
  question: string,
  answer: string,
): Promise<string | null> {
  if (!r.id) return null; // demo: no se guarda
  const { data, error } = await createPublicClient().rpc("log_exchange", {
    p_restaurant: r.id,
    p_conversation: conv(conversationId),
    p_lang: lang,
    p_question: question,
    p_answer: answer,
  });
  if (error) {
    console.error("[store] no se pudo guardar la conversación:", error.message);
    return null;
  }
  return data as string;
}

/** Guarda una petición de reserva; el restaurante la ve al momento en su panel. */
export async function createReservation(
  r: Restaurant,
  req: ReservationRequest,
  conversationId: string | null,
  lang: string,
): Promise<{ result: "ok" | "full" | "invalid" | "error"; token?: string }> {
  if (!r.id) return { result: "ok" }; // demo: se simula
  const { data, error } = await createPublicClient().rpc("create_reservation", {
    p_restaurant: r.id,
    p_conversation: conv(conversationId),
    p_name: req.name,
    p_day: req.day,
    p_time: req.time,
    p_people: req.people,
    p_contact: req.contact,
    p_notes: req.notes ?? "",
    p_lang: lang,
  });
  if (error) {
    if (error.message.includes("completo")) return { result: "full" };
    if (error.message.includes("no válidos") || error.message.includes("fecha pasada")) return { result: "invalid" };
    console.error("[store] no se pudo guardar la reserva:", error.message);
    return { result: "error" };
  }
  return { result: "ok", token: typeof data === "string" ? data : undefined };
}
