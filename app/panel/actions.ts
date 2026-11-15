"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentRestaurant } from "@/lib/panel";
import { createUserClient } from "@/lib/supabase/server";
import type { RestaurantProfile } from "@/lib/types";

export async function signOut() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/panel/login");
}

export async function setReservationStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["pending", "confirmed", "rejected"].includes(status)) return;
  const supabase = await createUserClient();
  // Las reglas RLS impiden tocar reservas de otro restaurante.
  await supabase.from("reservations").update({ status }).eq("id", id);
  revalidatePath("/panel");
}

/** Líneas "Tema | respuesta" → pares. */
function parseLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      return i === -1 ? null : [l.slice(0, i).trim(), l.slice(i + 1).trim()] as const;
    })
    .filter((x): x is readonly [string, string] => !!x && !!x[0] && !!x[1])
    .slice(0, 40);
}

export async function updateInfo(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { supabase, restaurant } = await currentRestaurant(slug);
  if (!restaurant) redirect("/panel");

  const old = restaurant.profile;
  const hours = parseLines(String(formData.get("hours") ?? "")).map(([day, time]) => ({ day: day.slice(0, 60), time: time.slice(0, 120) }));
  const facts = parseLines(String(formData.get("facts") ?? "")).map(([topic, answer]) => {
    const prev = old.facts.find((f) => f.topic === topic);
    return {
      topic: topic.slice(0, 60),
      answer: answer.slice(0, 500),
      keywords: prev?.keywords,
      // Si cambia la respuesta, las traducciones antiguas ya no valen (la IA traduce sola).
      i18n: prev && prev.answer === answer ? prev.i18n : undefined,
    };
  });
  const hoursChanged = JSON.stringify(hours) !== JSON.stringify(old.hours);

  const profile: RestaurantProfile = {
    ...old,
    hours: hours.length ? hours : old.hours,
    hoursI18n: hoursChanged ? undefined : old.hoursI18n,
    facts,
  };
  const notify = String(formData.get("notify_email") ?? "").trim();

  const { error } = await supabase
    .from("restaurants")
    .update({ profile, notify_email: notify || null })
    .eq("id", restaurant.id);
  revalidatePath("/panel");
  redirect(`/panel?r=${slug}&tab=info&${error ? "error=1" : "ok=1"}`);
}
