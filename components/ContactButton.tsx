"use client";

import { useEffect, useRef, useState } from "react";

// Botón que abre el formulario de "Solicitar demo / contacto".
// Lo que rellenan llega a tu panel de administración (Solicitudes).
export default function ContactButton({
  source,
  className,
  children,
}: {
  source: string;
  className: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <ContactDialog source={source} onClose={() => setOpen(false)} />}
    </>
  );
}

function ContactDialog({ source, onClose }: { source: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // Sin cleanup que llame a close(): dispararía onClose y cerraría el formulario
    // nada más abrirse. Al desmontarse, el <dialog> desaparece solo.
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(f), source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.");
      setState("error");
    }
  }

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-ink";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-cream p-0 text-ink shadow-2xl backdrop:bg-ink/50"
    >
      <div className="max-h-[90dvh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">
            {state === "sent" ? "¡Recibido! ☕" : "Hablemos de tu local"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="-mt-1 text-2xl leading-none text-muted hover:text-ink">
            ×
          </button>
        </div>

        {state === "sent" ? (
          <>
            <p className="mt-4 leading-relaxed text-muted">
              Gracias. Te llamaremos o escribiremos por WhatsApp en menos de 24 horas para enseñarte la demo con
              tu propia carta.
            </p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-ink py-3 font-medium text-cream">
              Cerrar
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <p className="text-sm text-muted">Déjanos tus datos y te enseñamos cómo quedaría en tu local. Sin compromiso.</p>
            {/* Trampa para bots: las personas no ven este campo. */}
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Tu nombre *
                <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} />
              </label>
              <label className="block text-sm">
                Nombre del local *
                <input name="business" required minLength={2} maxLength={100} autoComplete="organization" className={field} />
              </label>
              <label className="block text-sm">
                Teléfono / WhatsApp *
                <input name="phone" type="tel" required minLength={9} maxLength={20} autoComplete="tel" className={field} />
              </label>
              <label className="block text-sm">
                Email
                <input name="email" type="email" maxLength={120} autoComplete="email" className={field} />
              </label>
              <label className="block text-sm">
                Tipo de local
                <select name="business_type" defaultValue="" className={field}>
                  <option value="">Elige…</option>
                  <option>Bar</option>
                  <option>Restaurante</option>
                  <option>Cafetería</option>
                  <option>Chiringuito / beach club</option>
                  <option>Hotel</option>
                  <option>Otro</option>
                </select>
              </label>
              <label className="block text-sm">
                Municipio
                <input name="town" maxLength={60} placeholder="Palma, Alcúdia…" className={field} />
              </label>
            </div>
            <label className="block text-sm">
              ¿Algo que quieras contarnos?
              <textarea name="message" rows={3} maxLength={1000} className={field} />
            </label>
            <label className="flex items-start gap-2 text-xs text-muted">
              <input type="checkbox" required className="mt-0.5" />
              <span>
                Acepto que ATENLO use estos datos para contactarme sobre el servicio, según la{" "}
                <a href="/privacidad" target="_blank" className="underline">política de privacidad</a>.
              </span>
            </label>
            {state === "error" && <p className="text-sm text-terra-dark">{error}</p>}
            <button
              disabled={state === "sending"}
              className="w-full rounded-full bg-terra py-3 font-medium text-white hover:bg-terra-dark disabled:opacity-50"
            >
              {state === "sending" ? "Enviando…" : "Quiero que me contactéis"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
