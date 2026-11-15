import { updateLead } from "./actions";

type Lead = {
  id: string; name: string; business: string; business_type: string | null; town: string | null;
  phone: string; email: string | null; message: string | null; source: string | null;
  status: "new" | "contacted" | "client" | "discarded"; notes: string | null; created_at: string;
};

const STATUS: Record<Lead["status"], { label: string; cls: string }> = {
  new: { label: "Nueva", cls: "bg-terra text-white" },
  contacted: { label: "Contactada", cls: "bg-sand text-ink" },
  client: { label: "Cliente ✓", cls: "bg-sea text-white" },
  discarded: { label: "Descartada", cls: "bg-line text-muted" },
};

const waLink = (phone: string, name: string) => {
  let n = phone.replace(/\D/g, "");
  if (n.length === 9) n = `34${n}`; // número español sin prefijo
  return `https://wa.me/${n}?text=${encodeURIComponent(`¡Hola ${name}! Soy de ATENLO, me pediste información sobre el asistente para tu local.`)}`;
};

export default function Leads({ leads, filter }: { leads: Lead[]; filter: string }) {
  const shown = filter === "all" ? leads : leads.filter((l) => l.status === "new" || l.status === "contacted");
  const fresh = leads.filter((l) => l.status === "new").length;
  return (
    <section className="mb-12">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">
          Solicitudes de contacto {fresh > 0 && <span className="ml-1 rounded-full bg-terra px-2 py-0.5 text-xs text-white">{fresh} nuevas</span>}
        </h2>
        <div className="flex gap-3 text-sm">
          <a href="/panel/admin" className={filter === "all" ? "text-muted hover:text-ink" : "font-medium"}>Pendientes</a>
          <a href="/panel/admin?leads=all" className={filter === "all" ? "font-medium" : "text-muted hover:text-ink"}>Todas ({leads.length})</a>
        </div>
      </div>

      {!shown.length ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">
          {leads.length ? "No hay solicitudes pendientes." : "Todavía no ha llegado ninguna solicitud desde la web."}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((l) => (
            <li key={l.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {l.business} <span className="font-normal text-muted">· {l.name}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {[l.business_type, l.town].filter(Boolean).join(" · ") || "—"} ·{" "}
                    {new Date(l.created_at).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS[l.status].cls}`}>{STATUS[l.status].label}</span>
              </div>

              {l.message && <p className="mt-3 rounded-xl bg-cream p-3 text-sm">“{l.message}”</p>}

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="rounded-full border border-line px-3 py-1.5 hover:border-ink">📞 {l.phone}</a>
                <a href={waLink(l.phone, l.name)} target="_blank" className="rounded-full border border-line px-3 py-1.5 hover:border-ink">💬 WhatsApp</a>
                {l.email && <a href={`mailto:${l.email}`} className="rounded-full border border-line px-3 py-1.5 hover:border-ink">✉️ {l.email}</a>}
              </div>

              <form action={updateLead} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="id" value={l.id} />
                <input
                  name="notes"
                  defaultValue={l.notes ?? ""}
                  placeholder="Tus notas (ej. llamar el lunes, interesado en fundador…)"
                  className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
                <select name="status" defaultValue={l.status} className="rounded-xl border border-line px-3 py-2 text-sm">
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream">Guardar</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
