"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/panel";
import { emptyProfile, validateProfile } from "@/lib/profile";
import { site } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/server";

const back = (path: string, msg: string) => redirect(`${path}?msg=${encodeURIComponent(msg)}`);

/** Da acceso a un dueño: si no existe, le manda un email de invitación para crear su contraseña. */
async function addOwner(restaurantId: string, email: string) {
  const db = createAdminClient();
  const invite = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${site.url}/auth/confirm?next=/panel/password`,
  });
  let userId = invite.data.user?.id;
  if (!userId) {
    // Ya existía: lo buscamos para darle acceso.
    const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
    userId = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  }
  if (!userId) return `No se pudo invitar a ${email}: ${invite.error?.message ?? "error desconocido"}`;
  await db.from("restaurant_members").upsert({ user_id: userId, restaurant_id: restaurantId });
  return invite.error ? `${email} ya tenía cuenta: le he dado acceso.` : `Invitación enviada a ${email}.`;
}

export async function createRestaurant(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const owner = String(formData.get("owner") ?? "").trim();
  if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug === "demo") {
    back("/panel/admin", "Revisa el nombre y la dirección (solo minúsculas, números y guiones).");
  }
  const db = createAdminClient();
  const { data, error } = await db
    .from("restaurants")
    .insert({ name, slug, profile: emptyProfile(name), notify_email: owner || null })
    .select("id")
    .single();
  if (error) back("/panel/admin", error.code === "23505" ? "Esa dirección ya existe." : `Error: ${error.message}`);
  const msg = owner ? await addOwner(data!.id, owner) : "Restaurante creado.";
  revalidatePath("/panel/admin");
  back(`/panel/admin/${slug}`, `Creado. ${msg} Ahora rellena su ficha.`);
}

export async function saveRestaurant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "").trim();
  let profile: unknown;
  try {
    profile = JSON.parse(String(formData.get("profile")));
  } catch {
    back(`/panel/admin/${slug}`, "La ficha no es un JSON válido (revisa comas y comillas).");
  }
  const errors = validateProfile(profile);
  if (errors.length) back(`/panel/admin/${slug}`, `No guardado: ${errors.slice(0, 4).join(" · ")}`);

  const { error } = await createAdminClient()
    .from("restaurants")
    .update({
      name: name || undefined,
      profile,
      notify_email: String(formData.get("notify_email") ?? "").trim() || null,
      active: formData.get("active") === "on",
    })
    .eq("id", id);
  revalidatePath(`/panel/admin/${slug}`);
  back(`/panel/admin/${slug}`, error ? `Error: ${error.message}` : "Guardado ✓");
}

export async function inviteOwner(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const email = String(formData.get("email") ?? "").trim();
  if (!email) back(`/panel/admin/${slug}`, "Escribe un email.");
  const msg = await addOwner(String(formData.get("id")), email);
  back(`/panel/admin/${slug}`, msg);
}
