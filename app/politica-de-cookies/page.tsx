import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de cookies",
};

export default function PoliticaCookies() {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-6">Política de cookies</h1>
      <div className="prose-log text-paper">
        <p className="text-amber">
          Plantilla de partida. Cuando actives AdSense, Google exige que muestres un
          panel de consentimiento de cookies (CMP) antes de servir anuncios
          personalizados en el EEE y Reino Unido — no basta con este texto.
        </p>
        <h2>¿Qué son las cookies?</h2>
        <p>
          Pequeños archivos que se guardan en tu navegador para recordar información
          sobre tu visita.
        </p>
        <h2>Cookies que se usan en este sitio</h2>
        <ul>
          <li>Técnicas: necesarias para el funcionamiento básico del sitio.</li>
          <li>
            Publicidad (Google AdSense): cuando esté activo, para mostrar anuncios y,
            si aceptas, personalizarlos según tu navegación.
          </li>
          <li>Analítica (si se activa Google Analytics u otra herramienta).</li>
        </ul>
        <h2>Cómo desactivarlas</h2>
        <p>
          Puedes bloquear o eliminar las cookies desde la configuración de tu
          navegador. Bloquearlas puede afectar al funcionamiento del sitio.
        </p>
      </div>
    </div>
  );
}
