// Modo sin IA: respuestas fijas a partir de la ficha del local.
// Sirve para la demo sin coste y como red de seguridad si la IA falla.
import { allergenNames } from "./knowledge";
import type { Allergen, Client, Lang } from "./types";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const has = (text: string, words: string[]) => words.some((w) => text.includes(norm(w)));

export function detectLang(text: string): Lang {
  const t = ` ${norm(text).replace(/[^a-z\s]/g, " ")} `;
  const score = (words: string[]) => words.filter((w) => t.includes(` ${w} `)).length;
  const de = score(["ich", "sie", "haben", "ist", "gibt", "wann", "hund", "tisch", "und", "nicht", "kann", "man", "wir", "hallo", "danke", "bitte", "offnungszeiten", "geoffnet", "heute", "mit"]);
  const en = score(["do", "you", "have", "is", "are", "the", "what", "when", "can", "open", "table", "hi", "hello", "thanks", "please", "any", "book", "today", "with", "dog", "options", "there", "dishes", "where", "how", "much", "your"]);
  if (de > en && de > 0) return "de";
  if (en > de && en > 0) return "en";
  return "es";
}

const T = {
  hours: { es: "Nuestro horario:", en: "Our opening hours:", de: "Unsere Öffnungszeiten:" },
  address: { es: "Estamos en", en: "You'll find us at", de: "Sie finden uns in" },
  bookYes: {
    es: "¡Claro! Para reservar, llama al",
    en: "Of course! To book, please call",
    de: "Gerne! Zum Reservieren rufen Sie bitte an:",
  },
  bookNo: { es: "No aceptamos reservas.", en: "We don't take bookings.", de: "Wir nehmen keine Reservierungen an." },
  menuIntro: { es: "Esta es nuestra carta:", en: "Here's our menu:", de: "Unsere Speisekarte:" },
  free: { es: "Platos sin", en: "Dishes without", de: "Gerichte ohne" },
  noneFree: {
    es: "Según nuestra carta, todos los platos contienen",
    en: "According to our menu, all dishes contain",
    de: "Laut unserer Karte enthalten alle Gerichte",
  },
  allergenList: { es: "Alérgenos por plato:", en: "Allergens per dish:", de: "Allergene pro Gericht:" },
  allergenWarn: {
    es: "⚠️ Si tienes una alergia o intolerancia, avísalo siempre al personal al pedir.",
    en: "⚠️ If you have an allergy or intolerance, please always tell the staff when ordering.",
    de: "⚠️ Bei Allergien oder Unverträglichkeiten sagen Sie bitte immer dem Personal Bescheid.",
  },
  vegan: { es: "Opciones veganas/vegetarianas:", en: "Vegan/vegetarian options:", de: "Vegane/vegetarische Optionen:" },
  handoff: {
    es: "No tengo esa información, prefiero no inventármela. Puedes contactar con",
    en: "I don't have that information and I'd rather not guess. You can contact",
    de: "Dazu habe ich keine Informationen und möchte nichts erfinden. Bitte kontaktieren Sie",
  },
  by: { es: "por", en: "via", de: "per" },
  greet: {
    es: "¡Hola! ¿En qué te puedo ayudar? Puedo contarte horarios, carta, alérgenos, reservas, terraza, parking…",
    en: "Hi! How can I help? I can tell you about opening hours, the menu, allergens, bookings, terrace, parking…",
    de: "Hallo! Wie kann ich helfen? Ich informiere Sie über Öffnungszeiten, Speisekarte, Allergene, Reservierungen, Terrasse, Parken…",
  },
  thanks: { es: "¡A ti! Te esperamos 😊", en: "You're welcome! See you soon 😊", de: "Gern geschehen! Bis bald 😊" },
};

const allergenWords: Record<Allergen, string[]> = {
  gluten: ["gluten", "celiac", "celiaco", "zoliakie", "glutenfrei"],
  lacteos: ["lacteo", "lactosa", "leche", "dairy", "milk", "lactose", "milch", "laktose"],
  huevo: ["huevo", "egg", " ei ", "eier"],
  frutos_secos: ["frutos secos", "nueces", "almendra", "nuts", "nuss", "nusse", "mandel"],
  cacahuete: ["cacahuete", "mani", "peanut", "erdnuss"],
  pescado: ["pescado", "fish", "fisch"],
  crustaceos: ["marisco", "crustaceo", "gamba", "shellfish", "shrimp", "prawn", "krebs", "garnele"],
  moluscos: ["molusco", "calamar", "mollusc", "squid", "weichtier", "tintenfisch"],
  soja: ["soja", "soy"],
  apio: ["apio", "celery", "sellerie"],
  mostaza: ["mostaza", "mustard", "senf"],
  sesamo: ["sesamo", "sesame", "sesam"],
  sulfitos: ["sulfito", "sulphite", "sulfite"],
  altramuces: ["altramuz", "lupin", "lupine"],
};

export function fallbackAnswer(c: Client, message: string): string {
  const lang = detectLang(message);
  const t = ` ${norm(message)} `;
  const dishes = c.menu.flatMap((s) => s.dishes);

  // Alérgenos
  const asked = (Object.keys(allergenWords) as Allergen[]).filter((a) => has(t, allergenWords[a]));
  if (asked.length || has(t, ["alerg", "allerg", "intoleran", "unvertrag"])) {
    if (asked.length) {
      const ok = dishes.filter((d) => !asked.some((a) => d.allergens.includes(a)));
      const names = asked.map((a) => allergenNames[a][lang]).join(", ");
      const body = ok.length
        ? `${T.free[lang]} ${names}: ${ok.map((d) => d.name).join(", ")}.`
        : `${T.noneFree[lang]} ${names}.`;
      return `${body}\n\n${T.allergenWarn[lang]}`;
    }
    const list = dishes
      .map((d) => `• ${d.name}: ${d.allergens.length ? d.allergens.map((a) => allergenNames[a][lang]).join(", ") : "—"}`)
      .join("\n");
    return `${T.allergenList[lang]}\n${list}\n\n${T.allergenWarn[lang]}`;
  }

  // Vegano / vegetariano
  if (has(t, ["vegan", "vegetar"])) {
    const v = dishes.filter((d) => d.tags?.some((x) => x === "vegano" || x === "vegetariano"));
    if (v.length) return `${T.vegan[lang]} ${v.map((d) => `${d.name}${d.tags?.includes("vegano") ? " (vegan)" : ""}`).join(", ")}.`;
  }

  // Información práctica
  const fact = c.facts.find((f) => f.keywords && has(t, f.keywords));
  if (fact) return fact.i18n?.[lang] ?? fact.answer;

  // Reservas
  if (has(t, ["reserv", "mesa", "book", "table", "tisch", "platz fur"])) {
    if (!c.reservations.accepted) return T.bookNo[lang];
    return `${T.bookYes[lang]} ${c.contact.phone ?? c.handoff.channel}.`;
  }

  // Horario
  if (has(t, ["horario", "hora", "abr", "cerr", "open", "close", "hours", "offnung", "geoffnet", "geschlossen", "wann", "heute", "hoy", "today", "tonight", "esta noche"])) {
    const h = c.hoursI18n?.[lang] ?? c.hours;
    return `${T.hours[lang]}\n${h.map((x) => `• ${x.day}: ${x.time}`).join("\n")}`;
  }

  // Dirección
  if (has(t, ["donde", "direcc", "llegar", "ubicac", "where", "address", "location", "adresse", " wo "])) {
    return `${T.address[lang]} ${c.contact.address}.${c.contact.mapsUrl ? `\n${c.contact.mapsUrl}` : ""}`;
  }

  // Carta / precios
  if (has(t, ["carta", "menu", "plato", "comer", "precio", "food", "dish", "price", "eat", "speise", "karte", "essen", "preis"])) {
    return `${T.menuIntro[lang]}\n${c.menu
      .map((s) => `\n${s.section}\n${s.dishes.map((d) => `• ${d.name}${d.price != null ? ` — ${d.price} €` : ""}`).join("\n")}`)
      .join("\n")}`;
  }

  if (has(t, ["gracias", "thank", "danke"])) return T.thanks[lang];
  if (has(t, ["hola", "buenas", "hello", " hi ", "hey", "hallo", "guten"])) return T.greet[lang];

  return `${T.handoff[lang]} ${c.handoff.name} ${T.by[lang]} ${c.handoff.channel}.`;
}
