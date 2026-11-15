import "server-only";
import { redirect } from "next/navigation";
import { createUserClient } from "./supabase/server";
import type { RestaurantProfile } from "./types";

export type PanelRestaurant = {
  id: string;
  slug: string;
  name: string;
  profile: RestaurantProfile;
  notify_email: string | null;
  active: boolean;
};

/** Usuario con sesión + sus restaurantes (las reglas RLS ya filtran lo que puede ver). */
export async function requireUser() {
  const supabase = await createUserClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/panel/login");
  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  return { supabase, user: data.user, isAdmin: Boolean(adminRow) };
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx.isAdmin) redirect("/panel");
  return ctx;
}

/** El restaurante que se está viendo: ?r=slug, o el primero del usuario. */
export async function currentRestaurant(slug?: string) {
  const ctx = await requireUser();
  let q = ctx.supabase.from("restaurants").select("id, slug, name, profile, notify_email, active").order("name");
  if (slug) q = q.eq("slug", slug);
  const { data } = await q.limit(1);
  return { ...ctx, restaurant: (data?.[0] ?? null) as PanelRestaurant | null };
}
