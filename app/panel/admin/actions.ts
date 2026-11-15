"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/panel";
import { emptyProfile, validateProfile } from "@/lib/profile";
import { site } from "@/lib/site";

// Todas estas acciones pasan por funciones de la base de datos que comprueban
// otra vez que quien llama es administrador.

const back = (path: string, msg: string) => redirect(`${path}?msg=${encodeURIComponent(msg)}`);

const inviteMsg = (email: string, r: string) =>
  r === "linked"
    ? `${email} ya tenía cuenta: ya puede ver este restaurante en su panel.`
    : `Acceso preparado para ${email}. Dile que entre en ${site.url}/panel/login con ese email y pida el enlace de acceso.`;

export async function createRestaurant(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const owner = String(formData.get("owner") ?? "").trim();
  if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug === "demo") {
    back("/panel/admin", "Revisa el nombre y la dirección (solo minúsculas, números y guiones).");
  }
  const { error } = await supabase.rpc("admin_create_restaurant", {
    p_name: name,
    p_slug: slug,
    p_profile: emptyProfile(name),
    p_owner_email: owner,
  });
  if (error) back("/panel/admin", error.code === "23505" ? "Esa dirección ya existe." : `Error: ${error.message}`);
  revalidatePath("/panel/admin");
  back(`/panel/admin/${slug}`, `Creado. ${owner ? inviteMsg(owner, "invited") : ""} Ahora rellena su ficha.`);
}

export async function saveRestaurant(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));
  let profile: unknown;
  try {
    profile = JSON.parse(String(formData.get("profile")));
  } catch {
    back(`/panel/admin/${slug}`, "La ficha no es un JSON válido (revisa comas y comillas).");
  }
  // El logo no se muestra en el JSON (es muy largo): si pone "(se mantiene)", conservamos el actual.
  if (profile && typeof profile === "object" && (profile as { logo?: string }).logo === "(se mantiene)") {
    const { data } = await supabase.from("restaurants").select("profile").eq("id", id).single();
    (profile as { logo?: string }).logo = (data?.profile as { logo?: string })?.logo;
  }
  const errors = validateProfile(profile);
  if (errors.length) back(`/panel/admin/${slug}`, `No guardado: ${errors.slice(0, 4).join(" · ")}`);

  const { error } = await supabase.rpc("admin_update_restaurant", {
    p_id: id,
    p_name: String(formData.get("name") ?? "").trim(),
    p_profile: profile,
    p_notify_email: String(formData.get("notify_email") ?? "").trim(),
    p_active: formData.get("active") === "on",
  });
  revalidatePath(`/panel/admin/${slug}`);
  back(`/panel/admin/${slug}`, error ? `Error: ${error.message}` : "Guardado ✓");
}

export async function inviteOwner(formData: FormData) {
  const { supabase } = await requireAdmin();
  const slug = String(formData.get("slug"));
  const email = String(formData.get("email") ?? "").trim();
  if (!email) back(`/panel/admin/${slug}`, "Escribe un email.");
  const { data, error } = await supabase.rpc("admin_invite", { p_restaurant: String(formData.get("id")), p_email: email });
  back(`/panel/admin/${slug}`, error ? `Error: ${error.message}` : inviteMsg(email, data as string));
}

export async function updateLead(formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const patch: { status?: string; notes?: string | null } = {};
  if (["new", "contacted", "client", "discarded"].includes(status)) patch.status = status;
  if (formData.has("notes")) patch.notes = String(formData.get("notes")).trim().slice(0, 1000) || null;
  await supabase.from("leads").update(patch).eq("id", String(formData.get("id")));
  revalidatePath("/panel/admin");
}

// ── Formulario visual (crear / editar). Devuelven el error sin perder lo escrito. ──
export type FormState = { error?: string };

function readProfile(formData: FormData): { profile?: unknown; error?: string } {
  try {
    const profile = JSON.parse(String(formData.get("profile")));
    const errors = validateProfile(profile);
    return errors.length ? { error: `Revisa: ${errors.slice(0, 3).join(" · ")}` } : { profile };
  } catch {
    return { error: "No se pudo leer el formulario." };
  }
}

export async function createRestaurantForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const owner = String(formData.get("owner") ?? "").trim();
  if (!name) return { error: "Falta el nombre del local." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug === "demo") return { error: "Revisa la dirección web (solo minúsculas, números y guiones)." };
  const { profile, error: perr } = readProfile(formData);
  if (perr) return { error: perr };
  const { error } = await supabase.rpc("admin_create_restaurant", { p_name: name, p_slug: slug, p_profile: profile, p_owner_email: owner });
  if (error) return { error: error.code === "23505" ? `La dirección atenlo.com/c/${slug} ya existe. Elige otra.` : `Error: ${error.message}` };
  revalidatePath("/panel/admin");
  back(`/panel/admin/${slug}`, `✅ ¡${name} creado y publicado!${owner ? ` ${inviteMsg(owner, "invited")}` : ""}`);
  return {};
}

export async function saveRestaurantForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const slug = String(formData.get("slug"));
  const { profile, error: perr } = readProfile(formData);
  if (perr) return { error: perr };
  const { error } = await supabase.rpc("admin_update_restaurant", {
    p_id: String(formData.get("id")),
    p_name: String(formData.get("name") ?? "").trim(),
    p_profile: profile,
    p_notify_email: String(formData.get("notify_email") ?? "").trim(),
    p_active: formData.get("active") === "on",
  });
  if (error) return { error: `Error: ${error.message}` };
  revalidatePath(`/panel/admin/${slug}`);
  revalidatePath(`/c/${slug}`);
  back(`/panel/admin/${slug}`, "Guardado ✓");
  return {};
}
