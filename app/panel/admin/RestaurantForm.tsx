"use client";

import { useActionState, useMemo, useState } from "react";
import { allergenNames } from "@/lib/knowledge";
import { FACT_PRESETS, slugify } from "@/lib/profile";
import type { Allergen, Client, Dish, Lang, RestaurantProfile } from "@/lib/types";

// Formulario visual para crear o editar un restaurante (sin tocar JSON).
// Al enviar, todo se empaqueta en el campo oculto "profile" que reciben las acciones del servidor.

const ALLERGENS = Object.keys(allergenNames) as Allergen[];
const LANG_LABEL: Record<Lang, string> = { es: "Español", en: "Inglés", de: "Alemán" };

type Initial = {
  id?: string;
  name: string;
  slug: string;
  notify_email: string | null;
  active: boolean;
  profile: RestaurantProfile;
};

type Fact = RestaurantProfile["facts"][number];

const newDish = (): Dish => ({ name: "", allergens: [] });

function welcomeFor(name: string): Client["welcome"] {
  return {
    es: `¡Hola! Soy el asistente de ${name}. Pregúntame por horarios, la carta, alérgenos o cómo reservar.`,
    en: `Hi! I'm ${name}'s assistant. Ask me about opening hours, the menu, allergens or how to book.`,
    de: `Hallo! Ich bin der Assistent von ${name}. Fragen Sie mich nach Öffnungszeiten, Speisekarte, Allergenen oder Reservierungen.`,
  };
}

async function resizeLogo(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const max = 256;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}

export default function RestaurantForm({
  initial,
  action,
  mode,
}: {
  initial: Initial;
  action: (prev: { error?: string }, fd: FormData) => Promise<{ error?: string }>;
  mode: "create" | "edit";
}) {
  const p0 = initial.profile;
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [kind, setKind] = useState(p0.kind);
  const [accent, setAccent] = useState(p0.accent);
  const [logo, setLogo] = useState<string | undefined>(p0.logo);
  const [logoErr, setLogoErr] = useState("");
  const [languages, setLanguages] = useState<Lang[]>(p0.languages);
  const [address, setAddress] = useState(p0.contact.address);
  const [phone, setPhone] = useState(p0.contact.phone ?? "");
  const [mapsUrl, setMapsUrl] = useState(p0.contact.mapsUrl ?? "");
  const [hours, setHours] = useState(p0.hours.length ? p0.hours : [{ day: "", time: "" }]);
  const [facts, setFacts] = useState<Fact[]>(p0.facts);
  const [accepted, setAccepted] = useState(p0.reservations.accepted);
  const [how, setHow] = useState(p0.reservations.how);
  const [tables, setTables] = useState(p0.capacity?.tables ? String(p0.capacity.tables) : "");
  const [seats, setSeats] = useState(p0.capacity?.seats ? String(p0.capacity.seats) : "");
  const [menu, setMenu] = useState<Client["menu"]>(p0.menu.length ? p0.menu : [{ section: "Carta", dishes: [] }]);
  const [notify, setNotify] = useState(initial.notify_email ?? "");
  const [active, setActive] = useState(initial.active);

  const cleanName = name.trim();
  const profile: RestaurantProfile = useMemo(() => {
    const nameChanged = cleanName !== initial.name;
    return {
      ...p0,
      kind: kind.trim() || "Restaurante",
      accent,
      logo,
      languages: languages.length ? languages : ["es"],
      welcome: nameChanged || mode === "create" ? welcomeFor(cleanName || "nuestro local") : p0.welcome,
      contact: { address: address.trim(), phone: phone.trim() || undefined, mapsUrl: mapsUrl.trim() || undefined },
      hours: hours.filter((h) => h.day.trim() && h.time.trim()),
      hoursI18n: JSON.stringify(hours) === JSON.stringify(p0.hours) ? p0.hoursI18n : undefined,
      facts: facts
        .filter((f) => f.topic.trim() && f.answer.trim())
        .map((f) => {
          const prev = p0.facts.find((x) => x.topic === f.topic);
          return {
            ...f,
            keywords: f.keywords?.length ? f.keywords : slugify(f.topic).split("-").filter((w) => w.length > 2),
            i18n: prev && prev.answer === f.answer ? prev.i18n : undefined,
          };
        }),
      reservations: { accepted, how: how.trim() || "Desde este chat; el restaurante te confirmará." },
      capacity: { tables: Number(tables) || 0, seats: Number(seats) || 0 },
      handoff: {
        name: `el equipo de ${cleanName || "el local"}`,
        channel: phone.trim() ? `teléfono ${phone.trim()}` : "el personal del local",
      },
      menu: menu
        .map((s) => ({
          section: s.section.trim(),
          dishes: s.dishes
            .filter((d) => d.name.trim())
            .map((d) => ({ ...d, name: d.name.trim(), description: d.description?.trim() || undefined })),
        }))
        .filter((s) => s.section && s.dishes.length),
    };
  }, [p0, kind, accent, logo, languages, cleanName, initial.name, mode, address, phone, mapsUrl, hours, facts, accepted, how, tables, seats, menu]);

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  const small = "rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
  const dishCount = profile.menu.reduce((n, s) => n + s.dishes.length, 0);

  const updDish = (si: number, di: number, patch: Partial<Dish> | ((d: Dish) => Partial<Dish>)) =>
    setMenu((cur) =>
      cur.map((sec, i) =>
        i !== si ? sec : { ...sec, dishes: sec.dishes.map((d, j) => (j !== di ? d : { ...d, ...(typeof patch === "function" ? patch(d) : patch) })) },
      ),
    );

  return (
    <form action={formAction} className="space-y-8">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="profile" value={JSON.stringify(profile)} />
      <input type="hidden" name="active" value={active ? "on" : ""} />

      {/* ── 1. Datos ── */}
      <Box n="1" title="Datos del local">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Nombre *
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Bar Juan"
              className={field}
            />
          </label>
          <label className="block text-sm">
            Tipo de local
            <input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="Restaurante mediterráneo" className={field} />
          </label>
          <label className="block text-sm sm:col-span-2">
            Dirección web *
            <div className="mt-1 flex items-center rounded-xl border border-line bg-white focus-within:border-ink">
              <span className="pl-3 text-sm text-muted">atenlo.com/c/</span>
              <input
                value={slug}
                onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                disabled={mode === "edit"}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                className="min-w-0 flex-1 rounded-r-xl bg-transparent py-2 pr-3 outline-none disabled:text-muted"
              />
            </div>
            {mode === "edit" && <span className="text-xs text-muted">No se puede cambiar para no romper los QR ya impresos.</span>}
          </label>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-4">
            <div
              className="flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-line bg-white"
              style={logo ? undefined : { background: accent }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {logo ? <img src={logo} alt="Logo" className="size-full object-contain" /> : <span className="font-display text-3xl text-white">{cleanName.charAt(0) || "?"}</span>}
            </div>
            <div className="space-y-2 text-sm">
              <label className="inline-block cursor-pointer rounded-full border border-ink px-4 py-1.5 font-medium">
                {logo ? "Cambiar logo" : "Subir logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setLogoErr("");
                    try {
                      const url = await resizeLogo(f);
                      if (url.length > 300_000) setLogoErr("La imagen es demasiado grande, prueba con otra.");
                      else setLogo(url);
                    } catch {
                      setLogoErr("No se pudo leer la imagen.");
                    }
                  }}
                />
              </label>
              {logo && <button type="button" onClick={() => setLogo(undefined)} className="block text-xs text-muted underline">Quitar logo</button>}
              {logoErr && <p className="text-xs text-terra-dark">{logoErr}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              Color del local
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border border-line" />
            </label>
            <span className="text-muted">Idiomas:</span>
            {(["es", "en", "de"] as Lang[]).map((l) => (
              <label key={l} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={languages.includes(l)}
                  disabled={l === "es"}
                  onChange={(e) => setLanguages((cur) => e.target.checked ? [...cur, l] : cur.filter((x) => x !== l))}
                />
                {LANG_LABEL[l]}
              </label>
            ))}
          </div>
        </div>
      </Box>

      {/* ── 2. Contacto ── */}
      <Box n="2" title="Dirección y contacto">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            Dirección
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Carrer Major 12, Palma" className={field} />
          </label>
          <label className="block text-sm">
            Teléfono del local
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 971 000 000" className={field} />
          </label>
          <label className="block text-sm">
            Enlace de Google Maps
            <input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/…" className={field} />
          </label>
          <label className="block text-sm sm:col-span-2">
            Email del local {mode === "create" && <span className="text-muted">(con él entrará el dueño en su panel)</span>}
            <input name={mode === "create" ? "owner" : "notify_email"} type="email" value={notify} onChange={(e) => setNotify(e.target.value)} className={field} />
          </label>
        </div>
      </Box>

      {/* ── 3. Horario ── */}
      <Box n="3" title="Horario">
        <div className="space-y-2">
          {hours.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input value={h.day} onChange={(e) => setHours((cur) => cur.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))} placeholder="Martes a jueves" className={`${small} w-2/5`} />
              <input value={h.time} onChange={(e) => setHours((cur) => cur.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} placeholder="13:00–16:00 y 19:30–23:00 (o Cerrado)" className={`${small} min-w-0 flex-1`} />
              <Remove onClick={() => setHours((cur) => cur.filter((_, j) => j !== i))} />
            </div>
          ))}
        </div>
        <Add onClick={() => setHours((cur) => [...cur, { day: "", time: "" }])}>Añadir línea</Add>
      </Box>

      {/* ── 4. Información práctica ── */}
      <Box n="4" title="Información práctica">
        <div className="mb-3 flex flex-wrap gap-2">
          {FACT_PRESETS.filter((pr) => !facts.some((f) => f.topic === pr.topic)).map((pr) => (
            <button
              key={pr.topic}
              type="button"
              onClick={() => setFacts((cur) => [...cur, { topic: pr.topic, answer: "", keywords: pr.keywords }])}
              className="rounded-full border border-dashed border-ink/40 px-3 py-1 text-sm hover:border-ink"
            >
              + {pr.topic}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {facts.map((f, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <input value={f.topic} onChange={(e) => setFacts((cur) => cur.map((x, j) => (j === i ? { ...x, topic: e.target.value, keywords: undefined } : x)))} placeholder="Tema" className={`${small} sm:w-1/4`} />
              <input
                value={f.answer}
                onChange={(e) => setFacts((cur) => cur.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
                placeholder={FACT_PRESETS.find((p) => p.topic === f.topic)?.example ?? "Respuesta"}
                className={`${small} min-w-0 flex-1`}
              />
              <Remove onClick={() => setFacts((cur) => cur.filter((_, j) => j !== i))} />
            </div>
          ))}
        </div>
        <Add onClick={() => setFacts((cur) => [...cur, { topic: "", answer: "" }])}>Otro tema</Add>
      </Box>

      {/* ── 5. Reservas ── */}
      <Box n="5" title="Reservas, mesas y aforo">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /> Acepta peticiones de reserva desde el chat
        </label>
        {accepted && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm sm:col-span-3">
              Cómo se reserva
              <input value={how} onChange={(e) => setHow(e.target.value)} placeholder="Desde este chat o por teléfono; grupos de más de 8, con 48 h." className={field} />
            </label>
            <label className="block text-sm">
              Mesas que se pueden reservar
              <input type="number" min={0} max={500} value={tables} onChange={(e) => setTables(e.target.value)} placeholder="ej. 10" className={field} />
            </label>
            <label className="block text-sm">
              Aforo máximo (personas)
              <input type="number" min={0} max={5000} value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="ej. 40" className={field} />
            </label>
            <p className="self-end text-xs text-muted">Por turno (comida / cena). Vacío = sin límite.</p>
          </div>
        )}
      </Box>

      {/* ── 6. Carta ── */}
      <Box n="6" title={`Carta (${dishCount} platos)`}>
        <div className="space-y-6">
          {menu.map((s, si) => (
            <div key={si} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex gap-2">
                <input
                  value={s.section}
                  onChange={(e) => setMenu((cur) => cur.map((x, i) => (i === si ? { ...x, section: e.target.value } : x)))}
                  placeholder="Sección (Entrantes, Principales, Postres…)"
                  className={`${small} min-w-0 flex-1 font-semibold`}
                />
                <Remove onClick={() => setMenu((cur) => cur.filter((_, i) => i !== si))} label="Quitar sección" />
              </div>
              <div className="space-y-4">
                {s.dishes.map((d, di) => (
                  <div key={di} className="rounded-xl bg-cream p-3">
                    <div className="flex flex-wrap gap-2">
                      <input value={d.name} onChange={(e) => updDish(si, di, { name: e.target.value })} placeholder="Nombre del plato" className={`${small} min-w-40 flex-1`} />
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={d.price ?? ""}
                        onChange={(e) => updDish(si, di, { price: e.target.value === "" ? undefined : Number(e.target.value) })}
                        placeholder="€"
                        className={`${small} w-24`}
                      />
                      <Remove onClick={() => setMenu((cur) => cur.map((x, i) => (i === si ? { ...x, dishes: x.dishes.filter((_, j) => j !== di) } : x)))} />
                    </div>
                    <input
                      value={d.description ?? ""}
                      onChange={(e) => updDish(si, di, { description: e.target.value })}
                      placeholder="Descripción (opcional)"
                      className={`${small} mt-2 w-full`}
                    />
                    <p className="mt-2 mb-1 text-xs text-muted">Alérgenos (los confirma el restaurante):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALLERGENS.map((a) => {
                        const on = d.allergens.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => updDish(si, di, (cd) => ({ allergens: cd.allergens.includes(a) ? cd.allergens.filter((x) => x !== a) : [...cd.allergens, a] }))}
                            className={`rounded-full px-2.5 py-1 text-xs ${on ? "bg-terra text-white" : "bg-white text-muted ring-1 ring-line"}`}
                          >
                            {allergenNames[a].es}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {(["vegano", "vegetariano", "sin_gluten_opcion"] as const).map((tag) => (
                        <label key={tag} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!!d.tags?.includes(tag)}
                            onChange={(e) => { const on = e.target.checked; updDish(si, di, (cd) => ({ tags: on ? [...(cd.tags ?? []), tag] : cd.tags?.filter((x) => x !== tag) })); }}
                          />
                          {tag === "vegano" ? "Vegano" : tag === "vegetariano" ? "Vegetariano" : "Opción sin gluten"}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Add onClick={() => setMenu((cur) => cur.map((x, i) => (i === si ? { ...x, dishes: [...x.dishes, newDish()] } : x)))}>Añadir plato</Add>
            </div>
          ))}
        </div>
        <Add onClick={() => setMenu((cur) => [...cur, { section: "", dishes: [newDish()] }])}>Añadir sección</Add>
      </Box>

      {/* ── Publicar ── */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream/95 px-4 py-4 backdrop-blur">
        {mode === "edit" ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Publicado (si lo desactivas, su chat deja de funcionar)
          </label>
        ) : (
          <p className="text-sm text-muted">Se publicará al momento en atenlo.com/c/{slug || "…"}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {state.error && <p className="max-w-md text-sm text-terra-dark">{state.error}</p>}
          <button disabled={pending} className="rounded-full bg-terra px-6 py-3 font-medium text-white hover:bg-terra-dark disabled:opacity-50">
            {pending ? "Guardando…" : mode === "create" ? "Crear y publicar" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Box({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-ink text-sm text-cream">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Add({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 text-sm font-medium text-terra hover:underline">
      + {children}
    </button>
  );
}

function Remove({ onClick, label = "Quitar" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="shrink-0 rounded-xl px-3 text-lg text-muted hover:bg-sand hover:text-ink">
      ×
    </button>
  );
}
