import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseConfigured() {
  return Boolean(url && anonKey && serviceKey);
}

/** Cliente con la sesión del usuario que ha iniciado sesión (respeta las reglas RLS). */
export async function createUserClient() {
  if (!url || !anonKey) throw new Error("Falta configurar Supabase (.env.local)");
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el proxy ya refresca la sesión.
        }
      },
    },
  });
}

/** Cliente con permisos totales. SOLO en el servidor y tras comprobar permisos. */
export function createAdminClient() {
  if (!url || !serviceKey) throw new Error("Falta configurar Supabase (.env.local)");
  return createSupabaseClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
