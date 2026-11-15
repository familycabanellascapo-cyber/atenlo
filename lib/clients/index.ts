import "server-only";
import { createAdminClient, supabaseConfigured } from "../supabase/server";
import type { Client, RestaurantProfile } from "../types";
import { demo } from "./demo";

export type Restaurant = {
  id: string | null; // null = demo (no se guarda nada)
  client: Client;
  notifyEmail: string | null;
};

/** Busca un local por su slug: la demo vive en el código, los clientes reales en Supabase. */
export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  if (slug === demo.slug) return { id: null, client: demo, notifyEmail: null };
  if (!supabaseConfigured()) return null;

  const { data, error } = await createAdminClient()
    .from("restaurants")
    .select("id, slug, name, profile, notify_email")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.error("[restaurants] error leyendo", slug, error.message);
    return null;
  }
  if (!data) return null;
  return {
    id: data.id,
    client: { ...(data.profile as RestaurantProfile), slug: data.slug, name: data.name },
    notifyEmail: data.notify_email,
  };
}
