import type { Allergen, Lang, RestaurantProfile } from "./types";

const LANGS: Lang[] = ["es", "en", "de"];
const ALLERGENS: Allergen[] = [
  "gluten", "crustaceos", "huevo", "pescado", "cacahuete", "soja", "lacteos",
  "frutos_secos", "apio", "mostaza", "sesamo", "sulfitos", "altramuces", "moluscos",
];

/** Ficha de partida para un restaurante nuevo. */
export function emptyProfile(name: string): RestaurantProfile {
  return {
    kind: "Restaurante",
    languages: ["es", "en", "de"],
    accent: "#c2410c",
    welcome: {
      es: `¡Hola! Soy el asistente de ${name}. Pregúntame por horarios, la carta, alérgenos o cómo reservar.`,
      en: `Hi! I'm ${name}'s assistant. Ask me about opening hours, the menu, allergens or how to book.`,
      de: `Hallo! Ich bin der Assistent von ${name}. Fragen Sie mich nach Öffnungszeiten, Speisekarte, Allergenen oder Reservierungen.`,
    },
    contact: { address: "", phone: "" },
    hours: [{ day: "Lunes a domingo", time: "13:00–16:00 y 19:30–23:00" }],
    menu: [{ section: "Carta", dishes: [] }],
    facts: [],
    reservations: { accepted: true, how: "Por teléfono o desde este chat; el restaurante te confirmará." },
    handoff: { name: `el equipo de ${name}`, channel: "teléfono" },
  };
}

const isStr = (v: unknown): v is string => typeof v === "string";
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Comprueba que una ficha escrita a mano tiene la forma correcta. Devuelve los errores. */
export function validateProfile(p: unknown): string[] {
  const e: string[] = [];
  if (!isObj(p)) return ["La ficha debe ser un objeto JSON."];
  if (!isStr(p.kind)) e.push("kind: texto obligatorio");
  if (!Array.isArray(p.languages) || !p.languages.length || !p.languages.every((l) => LANGS.includes(l))) e.push(`languages: lista con ${LANGS.join(", ")}`);
  if (!isStr(p.accent) || !/^#[0-9a-f]{6}$/i.test(p.accent)) e.push("accent: color tipo #c2410c");
  if (p.logo != null && (!isStr(p.logo) || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(p.logo) || p.logo.length > 300_000))
    e.push("logo: imagen PNG, JPG o WebP de menos de 200 KB");
  if (p.capacity != null && (!isObj(p.capacity) || [p.capacity.tables, p.capacity.seats].some((n) => n != null && (typeof n !== "number" || n < 0))))
    e.push("capacity: {tables: número, seats: número}");
  if (!isObj(p.welcome) || (Array.isArray(p.languages) && p.languages.some((l) => !isStr((p.welcome as Record<string, unknown>)?.[l])))) e.push("welcome: un saludo por cada idioma");
  if (!isObj(p.contact) || !isStr(p.contact.address)) e.push("contact.address: texto obligatorio");
  if (!Array.isArray(p.hours) || !p.hours.every((h) => isObj(h) && isStr(h.day) && isStr(h.time))) e.push("hours: lista de {day, time}");
  if (!Array.isArray(p.facts) || !p.facts.every((f) => isObj(f) && isStr(f.topic) && isStr(f.answer))) e.push("facts: lista de {topic, answer}");
  if (!isObj(p.reservations) || typeof p.reservations.accepted !== "boolean" || !isStr(p.reservations.how)) e.push("reservations: {accepted: true/false, how: texto}");
  if (!isObj(p.handoff) || !isStr(p.handoff.name) || !isStr(p.handoff.channel)) e.push("handoff: {name, channel}");
  if (!Array.isArray(p.menu)) e.push("menu: lista de secciones");
  else
    p.menu.forEach((s, i) => {
      if (!isObj(s) || !isStr(s.section) || !Array.isArray(s.dishes)) return e.push(`menu[${i}]: {section, dishes: []}`);
      s.dishes.forEach((d, j) => {
        if (!isObj(d) || !isStr(d.name)) return e.push(`menu[${i}].dishes[${j}]: falta name`);
        if (!Array.isArray(d.allergens) || !d.allergens.every((a) => ALLERGENS.includes(a)))
          e.push(`"${d.name}": allergens debe ser una lista con valores de: ${ALLERGENS.join(", ")} (vacía si no tiene)`);
        if (d.price != null && typeof d.price !== "number") e.push(`"${d.name}": price debe ser un número`);
      });
    });
  return e;
}

/** Temas típicos de "información práctica", con palabras clave para el modo sin IA. */
export const FACT_PRESETS: { topic: string; keywords: string[]; example: string }[] = [
  { topic: "Terraza", keywords: ["terraza", "fuera", "exterior", "terrace", "outside", "terrasse", "draussen"], example: "Sí, tenemos terraza." },
  { topic: "Perros / mascotas", keywords: ["perro", "mascota", "dog", "pet", "hund", "haustier"], example: "Perros bienvenidos en la terraza." },
  { topic: "Parking", keywords: ["parking", "aparcar", "coche", "park", "car", "parkplatz", "auto"], example: "Hay parking público a 5 minutos." },
  { topic: "Formas de pago", keywords: ["pago", "pagar", "tarjeta", "efectivo", "pay", "card", "cash", "zahlen", "bezahlen", "kreditkarte", "bargeld"], example: "Efectivo y tarjeta." },
  { topic: "Menú infantil", keywords: ["niño", "nino", "infantil", "kids", "child", "children", "kinder"], example: "Sí, menú infantil por 10 €." },
  { topic: "Accesibilidad", keywords: ["silla de ruedas", "accesible", "wheelchair", "accessible", "rollstuhl", "barrierefrei"], example: "Local adaptado para silla de ruedas." },
  { topic: "Wifi", keywords: ["wifi", "wi-fi", "internet", "wlan"], example: "Wifi gratis para clientes." },
  { topic: "Grupos y eventos", keywords: ["grupo", "evento", "cumpleaños", "group", "event", "birthday", "gruppe", "feier", "geburtstag"], example: "Grupos de hasta 30 personas con menú cerrado." },
  { topic: "Menú del día", keywords: ["menu del dia", "menú del día", "lunch menu", "mittagsmenu", "mittagsmenü", "tagesmenu"], example: "De lunes a viernes a mediodía, 15 €." },
];

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
