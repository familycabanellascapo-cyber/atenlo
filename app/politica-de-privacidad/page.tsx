import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default function PoliticaPrivacidad() {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-6">Política de privacidad</h1>
      <div className="prose-log text-paper">
        <p className="text-amber">
          Plantilla de partida, no es asesoría legal. Ajusta según los servicios que
          actives realmente (AdSense, formulario de contacto, analítica).
        </p>
        <h2>Responsable del tratamiento</h2>
        <p>Miquel Cabanellas Capó · mikiarkanz@gmail.com</p>
        <h2>¿Qué datos se recogen?</h2>
        <p>
          Si escribes por el formulario o correo de contacto: tu nombre y correo
          electrónico, únicamente para responderte. Si se activa Google Analytics o
          AdSense, estos servicios pueden recoger datos de navegación de forma anónima
          o pseudonimizada (ver política de cookies).
        </p>
        <h2>Finalidad</h2>
        <p>
          Responder a tus consultas y, en su caso, mostrar publicidad relevante a
          través de Google AdSense.
        </p>
        <h2>Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión y oposición
          escribiendo a mikiarkanz@gmail.com.
        </p>
      </div>
    </div>
  );
}
