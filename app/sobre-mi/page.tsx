import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: "Quién escribe este diario de automatización.",
};

export default function SobreMi() {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-8">Sobre mí</h1>

      <div className="prose-log text-paper">
        <p>
          Soy Miquel, desarrollador autodidacta desde Mallorca. Aprendí a programar por mi
          cuenta y ahora construyo webs, automatizaciones y agentes de IA para negocios
          reales — sobre todo en hostelería, que es un sector que conozco de primera mano.
        </p>
        <p>
          Este sitio es un cuaderno de bitácora, no un curso ni un escaparate de agencia.
          Aquí documento los flujos de automatización que monto de verdad, con capturas,
          números de tiempo y dinero ahorrado, y también lo que no ha salido bien a la
          primera — porque eso es lo que casi nadie cuenta.
        </p>
        <p>
          Si tienes un negocio y quieres algo similar montado para ti en vez de hacerlo tú
          mismo, puedes escribirme desde la página de{" "}
          <a href="/contacto">contacto</a>.
        </p>
      </div>
    </div>
  );
}
