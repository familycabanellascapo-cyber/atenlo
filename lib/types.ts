// Ficha de un cliente (restaurante/bar). Añadir un cliente = rellenar una ficha.
export type Lang = "es" | "en" | "de";

export type Allergen =
  | "gluten" | "crustaceos" | "huevo" | "pescado" | "cacahuete" | "soja" | "lacteos"
  | "frutos_secos" | "apio" | "mostaza" | "sesamo" | "sulfitos" | "altramuces" | "moluscos";

export type Dish = {
  name: string;
  description?: string;
  price?: number;
  // Lista cerrada de los 14 alérgenos de la UE. La rellena SIEMPRE el restaurante.
  allergens: Allergen[];
  tags?: ("vegetariano" | "vegano" | "sin_gluten_opcion")[];
};

export type Client = {
  slug: string;
  name: string;
  demo?: boolean; // datos ficticios
  kind: string; // "Restaurante", "Bar de tapas"...
  languages: Lang[];
  accent: string; // color de marca del local (hex)
  welcome: Record<Lang, string>;
  contact: {
    address: string;
    mapsUrl?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  // Texto libre por día, ej. "13:00–16:00 y 19:30–23:00" o "Cerrado".
  hours: { day: string; time: string }[];
  menu: { section: string; dishes: Dish[] }[];
  // Horario traducido (opcional; solo lo usa el modo sin IA, la IA traduce sola).
  hoursI18n?: Partial<Record<Lang, { day: string; time: string }[]>>;
  // Información práctica (terraza, perros, parking, pago, grupos...).
  // `keywords` ayuda al modo sin IA a encontrarla; `i18n` son traducciones opcionales.
  facts: { topic: string; answer: string; keywords?: string[]; i18n?: Partial<Record<Lang, string>> }[];
  reservations: {
    accepted: boolean;
    how: string; // ej. "Por teléfono o WhatsApp. Para grupos de más de 8, con 48 h."
  };
  // A quién avisar cuando el asistente no sabe responder.
  handoff: { name: string; channel: string };
};

/** Lo que se guarda en la columna `profile` de Supabase (la ficha sin slug ni nombre). */
export type RestaurantProfile = Omit<Client, "slug" | "name" | "demo">;
