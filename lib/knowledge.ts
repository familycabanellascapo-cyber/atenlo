import type { Allergen, Client, Lang } from "./types";

export const allergenNames: Record<Allergen, Record<Lang, string>> = {
  gluten: { es: "gluten", en: "gluten", de: "Gluten" },
  crustaceos: { es: "crustáceos", en: "crustaceans", de: "Krebstiere" },
  huevo: { es: "huevo", en: "egg", de: "Ei" },
  pescado: { es: "pescado", en: "fish", de: "Fisch" },
  cacahuete: { es: "cacahuete", en: "peanuts", de: "Erdnüsse" },
  soja: { es: "soja", en: "soy", de: "Soja" },
  lacteos: { es: "lácteos", en: "milk", de: "Milch" },
  frutos_secos: { es: "frutos de cáscara", en: "tree nuts", de: "Schalenfrüchte" },
  apio: { es: "apio", en: "celery", de: "Sellerie" },
  mostaza: { es: "mostaza", en: "mustard", de: "Senf" },
  sesamo: { es: "sésamo", en: "sesame", de: "Sesam" },
  sulfitos: { es: "sulfitos", en: "sulphites", de: "Sulfite" },
  altramuces: { es: "altramuces", en: "lupin", de: "Lupinen" },
  moluscos: { es: "moluscos", en: "molluscs", de: "Weichtiere" },
};

/** Ficha del local en texto, para dársela a la IA como única fuente de verdad. */
export function clientKnowledge(c: Client): string {
  const menu = c.menu
    .map(
      (s) =>
        `## ${s.section}\n` +
        s.dishes
          .map((d) => {
            const al = d.allergens.length ? d.allergens.map((a) => allergenNames[a].es).join(", ") : "ninguno declarado";
            const extra = [d.description, d.tags?.join(", ")].filter(Boolean).join(" · ");
            return `- ${d.name}${d.price != null ? ` (${d.price} €)` : ""}${extra ? ` — ${extra}` : ""}. Alérgenos: ${al}.`;
          })
          .join("\n"),
    )
    .join("\n");

  return [
    `# ${c.name} (${c.kind})`,
    `Dirección: ${c.contact.address}`,
    c.contact.phone && `Teléfono: ${c.contact.phone}`,
    c.contact.mapsUrl && `Google Maps: ${c.contact.mapsUrl}`,
    `\n# Horario\n${c.hours.map((h) => `- ${h.day}: ${h.time}`).join("\n")}`,
    `\n# Reservas\n${c.reservations.accepted ? "Se aceptan reservas. " : "No se aceptan reservas. "}${c.reservations.how}`,
    `\n# Información práctica\n${c.facts.map((f) => `- ${f.topic}: ${f.answer}`).join("\n")}`,
    `\n# Carta\n${menu}`,
    `\n# Contacto con una persona\n${c.handoff.name}, por ${c.handoff.channel}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
