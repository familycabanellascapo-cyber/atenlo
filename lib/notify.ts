import "server-only";
import { site } from "./site";

export type ReservationRequest = {
  name: string;
  day: string;
  time: string;
  people: number;
  contact: string;
  notes?: string | null;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Avisa al restaurante por email (Resend). Si no está configurado, solo lo apunta en el log. */
export async function notifyReservation(to: string | null, restaurantName: string, r: ReservationRequest) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM || "ATENLO <avisos@atenlo.com>";
  if (!key || !to) {
    console.log(`[aviso] (sin email configurado) ${restaurantName}:`, r);
    return false;
  }
  const rows = [
    ["Nombre", r.name],
    ["Día", r.day],
    ["Hora", r.time],
    ["Personas", String(r.people)],
    ["Contacto", r.contact],
    ...(r.notes ? [["Notas", r.notes]] : []),
  ];
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px">
      <h2 style="margin:0 0 12px">Nueva petición de reserva</h2>
      <table style="border-collapse:collapse">${rows
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b625a">${k}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`)
        .join("")}</table>
      <p style="margin-top:16px">Contacta con el cliente para confirmarla y márcala en tu panel:</p>
      <p><a href="${site.url}/panel" style="background:#c2410c;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Abrir mi panel</a></p>
    </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Reserva: ${r.name} · ${r.day} ${r.time} · ${r.people} pers.`,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return true;
  } catch (err) {
    console.error("[aviso] fallo enviando email:", err);
    return false;
  }
}
