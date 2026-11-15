import "server-only";
import { createPublicClient } from "../supabase/server";
import type { Client, RestaurantProfile } from "../types";
import { demo } from "./demo";

export type Restaurant = {
  id: string | null; // null = demo (no se guarda nada)
  client: Client;
};

/** Busca un local por su slug: la demo vive en el código, los clientes reales en Supabase. */
export async function getRestaurant(slug: string): Promise<Restaurant | null> {
  if (slug === demo.slug) return { id: null, client: demo };
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return null;

  const { data, error } = await createPublicClient().rpc("get_restaurant", { p_slug: slug }).maybeSingle<{
    id: string; slug: string; name: string; profile: RestaurantProfile;
  }>();
  if (error) {
    console.error("[restaurants] error leyendo", slug, error.message);
    return null;
  }
  if (!data) return null;
  return { id: data.id, client: { ...data.profile, slug: data.slug, name: data.name } };
}
