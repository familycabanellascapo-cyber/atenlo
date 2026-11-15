"use client";

import { useState } from "react";
import { allergenNames } from "@/lib/knowledge";
import type { Allergen, Client, Lang } from "@/lib/types";

const ICON: Record<Allergen, string> = {
  gluten: "🌾", crustaceos: "🦐", huevo: "🥚", pescado: "🐟", cacahuete: "🥜", soja: "🫘", lacteos: "🥛",
  frutos_secos: "🌰", apio: "🥬", mostaza: "🟡", sesamo: "⚪", sulfitos: "🍷", altramuces: "🟤", moluscos: "🦑",
};

// Filtros rápidos más pedidos.
const QUICK: Allergen[] = ["gluten", "lacteos", "huevo", "frutos_secos", "crustaceos", "pescado"];

const T = {
  es: {
    menu: "Carta", hide: "Ocultar platos con:", veg: "🌱 Solo vegetariano", clear: "Quitar filtros",
    vegan: "Vegano", vegetarian: "Vegetariano", gf: "Opción sin gluten", noAllergens: "Sin alérgenos declarados",
    none: "Ningún plato cumple esos filtros.", hidden: (n: number) => `${n} plato${n === 1 ? "" : "s"} oculto${n === 1 ? "" : "s"} por tus filtros`,
    warn: "Información de alérgenos facilitada por el restaurante. Si tienes una alergia o intolerancia, avísalo siempre al personal al pedir.",
    ask: "💬 Pregúntanos", close: "Cerrar",
  },
  en: {
    menu: "Menu", hide: "Hide dishes with:", veg: "🌱 Vegetarian only", clear: "Clear filters",
    vegan: "Vegan", vegetarian: "Vegetarian", gf: "Gluten-free option", noAllergens: "No allergens declared",
    none: "No dishes match those filters.", hidden: (n: number) => `${n} dish${n === 1 ? "" : "es"} hidden by your filters`,
    warn: "Allergen information provided by the restaurant. If you have an allergy or intolerance, always tell the staff when ordering.",
    ask: "💬 Ask us", close: "Close",
  },
  de: {
    menu: "Speisekarte", hide: "Gerichte ausblenden mit:", veg: "🌱 Nur vegetarisch", clear: "Filter löschen",
    vegan: "Vegan", vegetarian: "Vegetarisch", gf: "Glutenfreie Option", noAllergens: "Keine Allergene angegeben",
    none: "Kein Gericht passt zu diesen Filtern.", hidden: (n: number) => `${n} Gericht${n === 1 ? "" : "e"} durch Filter ausgeblendet`,
    warn: "Allergeninformationen vom Restaurant. Bei Allergien oder Unverträglichkeiten bitte immer dem Personal Bescheid geben.",
    ask: "💬 Fragen Sie uns", close: "Schließen",
  },
};

const price = (n: number) => `${n.toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;

export default function MenuView({
  name,
  kind,
  accent,
  menu,
  languages,
  initialLang,
  onClose,
  chatHref,
  logo,
}: {
  name: string;
  kind?: string;
  accent: string;
  menu: Client["menu"];
  languages: Lang[];
  initialLang: Lang;
  onClose?: () => void;
  chatHref?: string;
  logo?: string;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [hide, setHide] = useState<Allergen[]>([]);
  const [vegOnly, setVegOnly] = useState(false);
  const t = T[lang];

  const visible = (d: Client["menu"][number]["dishes"][number]) =>
    !hide.some((a) => d.allergens.includes(a)) && (!vegOnly || d.tags?.some((x) => x === "vegano" || x === "vegetariano"));
  const total = menu.reduce((n, s) => n + s.dishes.length, 0);
  const shown = menu.reduce((n, s) => n + s.dishes.filter(visible).length, 0);
  const filtering = hide.length > 0 || vegOnly;

  return (
    <div className="min-h-full bg-cream print:bg-white">
      {/* Cabecera */}
      <header className="relative px-5 pt-16 pb-8 text-center text-white print:pt-6 print:text-ink" style={{ background: accent }}>
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between print:hidden">
          <div className="flex gap-1">
            {languages.length > 1 &&
              languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${lang === l ? "bg-white text-ink" : "bg-white/15 hover:bg-white/25"}`}
                >
                  {l}
                </button>
              ))}
          </div>
          {onClose && (
            <button onClick={onClose} aria-label={t.close} className="flex size-9 items-center justify-center rounded-full bg-white/15 text-xl hover:bg-white/25">
              ×
            </button>
          )}
        </div>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="mx-auto mb-4 size-20 rounded-2xl bg-white object-contain p-1 shadow-sm" />
        )}
        <p className="text-xs tracking-[0.3em] uppercase opacity-80">{kind}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{name}</h1>
        <div className="mx-auto mt-4 flex max-w-[200px] items-center gap-3 opacity-80">
          <span className="h-px flex-1 bg-current" />
          <span className="font-display text-lg italic">{t.menu}</span>
          <span className="h-px flex-1 bg-current" />
        </div>
      </header>

      {/* Filtros */}
      <div className="sticky top-0 z-10 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur print:hidden">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-xs text-muted">{t.hide}</p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {QUICK.map((a) => {
              const on = hide.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => setHide(on ? hide.filter((x) => x !== a) : [...hide, a])}
                  aria-pressed={on}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${on ? "border-ink bg-ink text-white line-through decoration-white/60" : "border-line bg-white"}`}
                >
                  {ICON[a]} {allergenNames[a][lang]}
                </button>
              );
            })}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              aria-pressed={vegOnly}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${vegOnly ? "border-sea bg-sea text-white" : "border-line bg-white"}`}
            >
              {t.veg}
            </button>
          </div>
          {filtering && (
            <p className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>{shown === total ? "" : t.hidden(total - shown)}</span>
              <button onClick={() => { setHide([]); setVegOnly(false); }} className="underline">{t.clear}</button>
            </p>
          )}
        </div>
      </div>

      {/* Platos */}
      <main className="mx-auto max-w-2xl px-5 py-8">
        {shown === 0 && <p className="py-10 text-center text-muted">{t.none}</p>}
        {menu.map((s) => {
          const dishes = s.dishes.filter(visible);
          if (!dishes.length) return null;
          return (
            <section key={s.section} className="mb-10 break-inside-avoid">
              <h2 className="mb-5 text-center font-display text-2xl font-semibold" style={{ color: accent }}>
                {s.section}
              </h2>
              <ul className="space-y-5">
                {dishes.map((d) => (
                  <li key={d.name} className="break-inside-avoid">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold">{d.name}</h3>
                      <span className="flex-1 translate-y-[-3px] border-b border-dotted border-muted/40" />
                      {d.price != null && <span className="font-display text-lg font-semibold whitespace-nowrap">{price(d.price)}</span>}
                    </div>
                    {d.description && <p className="mt-0.5 text-sm text-muted italic">{d.description}</p>}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {d.tags?.includes("vegano") && <Tag cls="bg-sea/10 text-sea">🌱 {t.vegan}</Tag>}
                      {d.tags?.includes("vegetariano") && <Tag cls="bg-sea/10 text-sea">🥕 {t.vegetarian}</Tag>}
                      {d.tags?.includes("sin_gluten_opcion") && <Tag cls="bg-sand text-ink">{t.gf}</Tag>}
                      {d.allergens.length === 0 ? (
                        <Tag cls="text-muted">{t.noAllergens}</Tag>
                      ) : (
                        d.allergens.map((a) => (
                          <Tag key={a} cls="bg-white text-muted ring-1 ring-line">
                            {ICON[a]} {allergenNames[a][lang]}
                          </Tag>
                        ))
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <p className="mt-4 rounded-2xl bg-sand p-4 text-xs leading-relaxed text-muted">⚠️ {t.warn}</p>

        {chatHref && (
          <a
            href={chatHref}
            className="mt-6 block rounded-full py-3 text-center font-medium text-white print:hidden"
            style={{ background: accent }}
          >
            {t.ask}
          </a>
        )}
        <p className="mt-8 text-center text-[11px] text-muted print:hidden">
          <a href="/" className="underline">ATENLO</a>
        </p>
      </main>
    </div>
  );
}

function Tag({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] ${cls}`}>{children}</span>;
}
