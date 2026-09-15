import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbeme directamente.",
};

export default function Contacto() {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-6">Contacto</h1>
      <p className="text-muted leading-relaxed mb-8">
        La forma más directa es por correo. Cuéntame qué tarea repetitiva te está
        quitando tiempo y te digo si tiene sentido automatizarla.
      </p>
      <a
        href="mailto:hola@automatizando-en-mallorca.com"
        className="inline-block font-mono text-sm border border-amber text-amber px-5 py-3 hover:bg-amber hover:text-ink transition-colors"
      >
        hola@automatizando-en-mallorca.com
      </a>
      <p className="text-muted text-sm mt-10">
        Nota: cambia esta dirección por tu correo real antes de publicar. Si más
        adelante quieres un formulario en vez de un enlace de correo, se puede añadir
        con un servicio como Formspree sin tocar el resto de la web.
      </p>
    </div>
  );
}
