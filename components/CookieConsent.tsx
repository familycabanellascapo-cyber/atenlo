"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "atenlo-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage no disponible (modo privado, etc.) — no bloquea el resto de la web
    }
  }, []);

  function choose(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // si no se puede guardar, simplemente se volverá a mostrar en la siguiente visita
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-panel">
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted flex-1">
          Usamos cookies técnicas necesarias para que la web funcione y, si las
          aceptas, cookies de publicidad y analítica. Puedes leer más en la{" "}
          <Link href="/politica-de-cookies" className="text-amber hover:underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex gap-3 font-mono text-sm shrink-0">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="border border-line px-4 py-2 text-muted hover:text-paper hover:border-paper transition-colors"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="border border-amber bg-amber text-ink px-4 py-2 hover:bg-transparent hover:text-amber transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
