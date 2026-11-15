import Link from "next/link";
import QRCode from "qrcode";
import { allergenNames } from "@/lib/knowledge";
import { currentRestaurant } from "@/lib/panel";
import { site } from "@/lib/site";
import { setReservationStatus, signOut, updateInfo } from "./actions";

type SP = Promise<{ r?: string; tab?: string; ok?: string; error?: string }>;

const tabs = [
  ["inicio", "Inicio"],
  ["reservas", "Reservas"],
  ["conversaciones", "Conversaciones"],
  ["info", "Mi información"],
  ["qr", "QR y enlace"],
] as const;

const statusLabel = { pending: "Pendiente", confirmed: "Confirmada", rejected: "Rechazada" } as const;
const langLabel: Record<string, string> = { es: "Español", en: "Inglés", de: "Alemán" };

export default async function PanelPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase, restaurant, isAdmin, user } = await currentRestaurant(sp.r);
  const tab = tabs.some(([k]) => k === sp.tab) ? sp.tab! : "inicio";

  if (!restaurant) {
    return (
      <Shell email={user.email} isAdmin={isAdmin}>
        <p className="text-muted">
          {isAdmin ? "Todavía no hay restaurantes. Créalo desde el panel de administración." : "Tu usuario no tiene ningún restaurante asignado. Escríbenos y lo revisamos."}
        </p>
      </Shell>
    );
  }

  const q = (t: string) => `/panel?r=${restaurant.slug}&tab=${t}`;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  return (
    <Shell email={user.email} isAdmin={isAdmin} title={restaurant.name}>
      <nav className="-mx-4 mb-8 flex gap-1 overflow-x-auto px-4 text-sm">
        {tabs.map(([k, label]) => (
          <Link
            key={k}
            href={q(k)}
            className={`shrink-0 rounded-full px-4 py-2 ${tab === k ? "bg-ink text-cream" : "text-muted hover:bg-sand"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "inicio" && <Inicio supabase={supabase} restaurantId={restaurant.id} monthStart={monthStart} q={q} />}
      {tab === "reservas" && <Reservas supabase={supabase} restaurantId={restaurant.id} />}
      {tab === "conversaciones" && <Conversaciones supabase={supabase} restaurantId={restaurant.id} slug={restaurant.slug} />}
      {tab === "info" && <Info restaurant={restaurant} ok={!!sp.ok} error={!!sp.error} />}
      {tab === "qr" && <Qr slug={restaurant.slug} />}
    </Shell>
  );
}

type DB = Awaited<ReturnType<typeof currentRestaurant>>["supabase"];

function Shell({ children, email, isAdmin, title }: { children: React.ReactNode; email?: string; isAdmin: boolean; title?: string }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/panel" className="font-display text-xl font-semibold">ATENLO<span className="text-terra">.</span></Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            {isAdmin && <Link href="/panel/admin" className="font-medium text-terra hover:underline">Administración</Link>}
            <span className="hidden sm:inline">{email}</span>
            <form action={signOut}><button className="hover:text-ink">Salir</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        {title && <h1 className="mb-6 font-display text-3xl font-semibold">{title}</h1>}
        {children}
      </main>
    </>
  );
}

async function Inicio({ supabase, restaurantId, monthStart, q }: { supabase: DB; restaurantId: string; monthStart: string; q: (t: string) => string }) {
  const [convs, pending, monthRes] = await Promise.all([
    supabase.from("conversations").select("lang, message_count").eq("restaurant_id", restaurantId).gte("created_at", monthStart),
    supabase.from("reservations").select("*").eq("restaurant_id", restaurantId).eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("reservations").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId).gte("created_at", monthStart),
  ]);
  const rows = convs.data ?? [];
  const questions = rows.reduce((n, c) => n + Math.floor(c.message_count / 2), 0);
  const langs = Object.entries(
    rows.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.lang ?? "es"]: (acc[c.lang ?? "es"] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">Este mes</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Preguntas respondidas" value={questions} />
          <Stat label="Conversaciones" value={rows.length} />
          <Stat label="Peticiones de reserva" value={monthRes.count ?? 0} />
        </div>
        {langs.length > 0 && (
          <p className="mt-4 text-sm text-muted">
            Idiomas: {langs.map(([l, n]) => `${langLabel[l] ?? l} ${Math.round((n / rows.length) * 100)}%`).join(" · ")}
          </p>
        )}
      </section>
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Reservas pendientes</h2>
          <Link href={q("reservas")} className="text-sm text-terra hover:underline">Ver todas</Link>
        </div>
        <ReservationList items={pending.data ?? []} empty="No tienes reservas pendientes." />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="font-display text-4xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

type Reservation = { id: string; name: string; day: string; time: string; people: number; contact: string; notes: string | null; status: keyof typeof statusLabel; created_at: string };

function ReservationList({ items, empty }: { items: Reservation[]; empty: string }) {
  if (!items.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              {r.name} · {formatDay(r.day)} {r.time} · {r.people} pers.
            </p>
            <p className="text-sm text-muted">
              {r.contact}
              {r.notes ? ` · “${r.notes}”` : ""}
            </p>
            <p className="mt-1 text-xs text-muted">Recibida {new Date(r.created_at).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" })}</p>
          </div>
          <div className="flex items-center gap-2">
            {r.status === "pending" ? (
              <>
                <StatusButton id={r.id} status="confirmed" className="bg-sea text-white">Confirmar</StatusButton>
                <StatusButton id={r.id} status="rejected" className="border border-line">Rechazar</StatusButton>
              </>
            ) : (
              <>
                <span className={`rounded-full px-3 py-1 text-sm ${r.status === "confirmed" ? "bg-sea/10 text-sea" : "bg-sand text-muted"}`}>
                  {statusLabel[r.status]}
                </span>
                <StatusButton id={r.id} status="pending" className="text-xs text-muted underline">Deshacer</StatusButton>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusButton({ id, status, className, children }: { id: string; status: string; className: string; children: React.ReactNode }) {
  return (
    <form action={setReservationStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-full px-4 py-2 text-sm font-medium ${className}`}>{children}</button>
    </form>
  );
}

function formatDay(day: string) {
  const d = new Date(`${day}T12:00:00`);
  return Number.isNaN(d.getTime()) ? day : d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

async function Reservas({ supabase, restaurantId }: { supabase: DB; restaurantId: string }) {
  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <>
      <p className="mb-4 text-sm text-muted">
        El asistente nunca confirma por su cuenta: contacta con el cliente y márcala aquí.
      </p>
      <ReservationList items={data ?? []} empty="Todavía no hay peticiones de reserva." />
    </>
  );
}

async function Conversaciones({ supabase, restaurantId, slug }: { supabase: DB; restaurantId: string; slug: string }) {
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, lang, message_count, last_message_at")
    .eq("restaurant_id", restaurantId)
    .order("last_message_at", { ascending: false })
    .limit(50);
  const ids = (convs ?? []).map((c) => c.id);
  const { data: firsts } = ids.length
    ? await supabase.from("messages").select("conversation_id, content").in("conversation_id", ids).eq("role", "user").order("id").limit(500)
    : { data: [] };
  const preview = new Map<string, string>();
  for (const m of firsts ?? []) if (!preview.has(m.conversation_id)) preview.set(m.conversation_id, m.content);

  if (!convs?.length) return <p className="text-muted">Todavía no hay conversaciones.</p>;
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
      {convs.map((c) => (
        <li key={c.id}>
          <Link href={`/panel/conversacion/${c.id}?r=${slug}`} className="flex items-center justify-between gap-4 p-4 hover:bg-cream">
            <span className="min-w-0">
              <span className="block truncate font-medium">“{preview.get(c.id) ?? "…"}”</span>
              <span className="text-xs text-muted">
                {langLabel[c.lang ?? ""] ?? "—"} · {Math.floor(c.message_count / 2)} preguntas
              </span>
            </span>
            <span className="shrink-0 text-xs text-muted">
              {new Date(c.last_message_at).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" })}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Info({ restaurant, ok, error }: { restaurant: NonNullable<Awaited<ReturnType<typeof currentRestaurant>>["restaurant"]>; ok: boolean; error: boolean }) {
  const p = restaurant.profile;
  const area = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-sm outline-none focus:border-ink";
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <form action={updateInfo} className="space-y-6">
        <input type="hidden" name="slug" value={restaurant.slug} />
        {ok && <p className="rounded-xl bg-sea/10 p-3 text-sm text-sea">Guardado. El asistente ya usa la información nueva.</p>}
        {error && <p className="rounded-xl bg-sand p-3 text-sm text-terra-dark">No se pudo guardar. Inténtalo de nuevo.</p>}
        <label className="block text-sm font-medium">
          Email de contacto del local
          <input name="notify_email" type="email" defaultValue={restaurant.notify_email ?? ""} className={area} />
        </label>
        <label className="block text-sm font-medium">
          Horario <span className="font-normal text-muted">(una línea por día: Día | horario)</span>
          <textarea name="hours" rows={6} defaultValue={p.hours.map((h) => `${h.day} | ${h.time}`).join("\n")} className={area} />
        </label>
        <label className="block text-sm font-medium">
          Información práctica <span className="font-normal text-muted">(una línea por tema: Tema | respuesta)</span>
          <textarea name="facts" rows={10} defaultValue={p.facts.map((f) => `${f.topic} | ${f.answer}`).join("\n")} className={area} />
        </label>
        <button className="rounded-full bg-ink px-6 py-3 font-medium text-cream">Guardar cambios</button>
      </form>

      <aside className="space-y-3">
        <h2 className="font-semibold">Carta y alérgenos</h2>
        <p className="text-sm text-muted">
          Para cambiar platos o alérgenos escríbenos a <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>. Los revisamos para que no haya errores.
        </p>
        <div className="space-y-4 rounded-2xl border border-line bg-white p-4 text-sm">
          {p.menu.map((s) => (
            <div key={s.section}>
              <p className="font-semibold">{s.section}</p>
              <ul className="mt-1 space-y-1">
                {s.dishes.map((d) => (
                  <li key={d.name}>
                    {d.name}
                    {d.price != null && <span className="text-muted"> · {d.price} €</span>}
                    <span className="block text-xs text-muted">
                      {d.allergens.length ? d.allergens.map((a) => allergenNames[a].es).join(", ") : "Sin alérgenos declarados"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

async function Qr({ slug }: { slug: string }) {
  const url = `${site.url}/c/${slug}`;
  const png = await QRCode.toDataURL(url, { width: 600, margin: 2, color: { dark: "#1c1917", light: "#ffffff" } });
  return (
    <div className="grid gap-8 sm:grid-cols-[260px_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={png} alt={`QR de ${url}`} className="w-full rounded-2xl border border-line bg-white p-2" />
      <div className="space-y-4">
        <p className="text-sm text-muted">Enlace de tu asistente:</p>
        <a href={url} target="_blank" className="block font-mono text-lg break-all text-terra underline">{url}</a>
        <a href={png} download={`atenlo-qr-${slug}.png`} className="inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream">
          Descargar QR
        </a>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Imprímelo en las mesas, la carta o la puerta.</li>
          <li>Pon el enlace en tu ficha de Google Maps (campo “Sitio web” o “Menú”).</li>
          <li>Ponlo en la bio de Instagram.</li>
        </ul>
      </div>
    </div>
  );
}
