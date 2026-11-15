// Datos PÚBLICOS de Supabase (pueden ir en el código: la seguridad la ponen las reglas
// de la base de datos). Se pueden cambiar con variables de entorno si hiciera falta.
// La clave secreta (service_role) NUNCA va aquí: la web no la necesita.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ojevuvmpsrwplflfidob.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_C9fj5EWA-ONls6yxvBNxCA_J_VmWO1K";
