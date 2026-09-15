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
          El sitio muestra un aviso de cookies al entrar, donde puedes aceptar o
          rechazar. Nota importante: cuando actives Google AdSense, Google exige
          además que ese aviso sea un panel de consentimiento (CMP) certificado por
          Google antes de servir anuncios personalizados en el EEE y Reino Unido — la
          forma más sencilla de cumplirlo es activar el "mensaje de consentimiento" de
          Funding Choices desde el propio panel de AdSense una vez te aprueben la
          cuenta, que sustituye a este aviso básico por uno ya certificado.
        </p>
        <h2>¿Qué son las cookies?</h2>
        <p>
          Pequeños archivos que se guardan en tu navegador para recordar información
          sobre tu visita.
        </p>
        <h2>Cookies que se usan en este sitio</h2>
        <ul>
          <li>Técnicas: necesarias para el funcionamiento básico del sitio, incluida
            recordar tu elección en el aviso de cookies.</li>
          <li>
            Publicidad (Google AdSense): cuando esté activo, para mostrar anuncios y,
            si aceptas, personalizarlos según tu navegación.
          </li>
          <li>Analítica (si se activa Google Analytics u otra herramienta).</li>
        </ul>
        <h2>Cómo desactivarlas</h2>
        <p>
          Puedes elegir "Rechazar" en el aviso de cookies al entrar, o bloquear y
          eliminar las cookies desde la configuración de tu navegador en cualquier
          momento. Bloquearlas puede afectar al funcionamiento del sitio.
        </p>
      </div>
    </div>
  );
}
