import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { cancelBooking } from "./actions";

// Página que recibe el cliente al reservar: ver su reserva y cancelarla.
export const metadata: Metadata = { title: "Tu reserva", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Booking = {
  name: string; booking_day: string; booking_time: string; people: number; status: string; lang: string | null;
  restaurant_name: string; restaurant_slug: string; restaurant_phone: string | null; accent: string | null;
};

const T = {
  es: {
    title: "Tu reserva", people: "personas", status: { pending: "Pendiente de confirmar", confirmed: "Confirmada ✓", rejected: "No disponible", cancelled: "Cancelada" },
    cancel: "Cancelar la reserva", sure: "Sí, quiero cancelar esta reserva", done: "Tu reserva se ha cancelado. ¡Gracias por avisar!",
    error: "No se ha podido cancelar. Llama al restaurante, por favor.", past: "Esta reserva ya no se puede cancelar desde aquí.",
    call: "Llamar al restaurante", back: "Volver al chat",
  },
  en: {
    title: "Your booking", people: "people", status: { pending: "Waiting for confirmation", confirmed: "Confirmed ✓", rejected: "Not available", cancelled: "Cancelled" },
    cancel: "Cancel booking", sure: "Yes, I want to cancel this booking", done: "Your booking has been cancelled. Thanks for letting us know!",
    error: "It couldn't be cancelled. Please call the restaurant.", past: "This booking can no longer be cancelled here.",
    call: "Call the restaurant", back: "Back to chat",
  },
  de: {
    title: "Ihre Reservierung", people: "Personen", status: { pending: "Wartet auf Bestätigung", confirmed: "Bestätigt ✓", rejected: "Nicht verfügbar", cancelled: "Storniert" },
    cancel: "Reservierung stornieren", sure: "Ja, ich möchte diese Reservierung stornieren", done: "Ihre Reservierung wurde storniert. Danke für Ihre Nachricht!",
    error: "Stornierung nicht möglich. Bitte rufen Sie das Restaurant an.", past: "Diese Reservierung kann hier nicht mehr storniert werden.",
    call: "Restaurant anrufen", back: "Zurück zum Chat",
  },
};

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ cancelled?: string; error?: string }> };

export default async function BookingPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  if (!UUID.test(token)) notFound();
  const { data } = await createPublicClient().rpc("get_reservation_by_token", { p_token: token }).maybeSingle<Booking>();
  if (!data) notFound();

  const t = T[(data.lang as keyof typeof T) ?? "es"] ?? T.es;
  const locale = data.lang === "en" ? "en-GB" : data.lang === "de" ? "de-DE" : "es-ES";
  const accent = data.accent ?? "#c2410c";
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const canCancel = (data.status === "pending" || data.status === "confirmed") && data.booking_day >= today;
  const dayLabel = new Date(`${data.booking_day}T12:00:00`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  const status = t.status[data.status as keyof typeof t.status] ?? data.status;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="px-6 py-5 text-white" style={{ background: accent }}>
          <p className="text-xs tracking-widest uppercase opacity-80">{t.title}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{data.restaurant_name}</h1>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <p className="text-lg font-semibold first-letter:uppercase">{dayLabel}</p>
            <p className="text-muted">
              {data.booking_time} · {data.people} {t.people} · {data.name}
            </p>
            <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm ${data.status === "confirmed" ? "bg-sea/10 text-sea" : data.status === "cancelled" || data.status === "rejected" ? "bg-sand text-muted" : "bg-terra/10 text-terra-dark"}`}>
              {status}
            </p>
          </div>

          {sp.cancelled && <p className="rounded-xl bg-sea/10 p-3 text-sm text-sea">{t.done}</p>}
          {sp.error && <p className="rounded-xl bg-sand p-3 text-sm text-terra-dark">{t.error}</p>}

          {canCancel ? (
            <form action={cancelBooking} className="space-y-3 border-t border-line pt-5">
              <input type="hidden" name="token" value={token} />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" required className="mt-0.5" /> {t.sure}
              </label>
              <button className="w-full rounded-full border-2 border-terra py-2.5 font-medium text-terra-dark hover:bg-terra hover:text-white">
                {t.cancel}
              </button>
            </form>
          ) : (
            !sp.cancelled && data.status !== "cancelled" && <p className="text-sm text-muted">{t.past}</p>
          )}

          <div className="flex flex-col gap-2 border-t border-line pt-5 text-center text-sm">
            {data.restaurant_phone && (
              <a href={`tel:${data.restaurant_phone.replace(/[^\d+]/g, "")}`} className="rounded-full bg-ink py-2.5 font-medium text-cream">
                📞 {t.call}
              </a>
            )}
            <a href={`/c/${data.restaurant_slug}`} className="text-muted underline">{t.back}</a>
          </div>
        </div>
      </div>
    </main>
  );
}
