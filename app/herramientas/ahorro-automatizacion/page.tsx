import type { Metadata } from "next";
import AhorroCalculator from "@/components/AhorroCalculator";

export const metadata: Metadata = {
  title: "Calculadora de ahorro al automatizar",
  description:
    "Calcula cuánto tiempo y dinero puedes ahorrar automatizando una tarea repetitiva de tu negocio.",
};

export default function HerramientaAhorro() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-sm text-teal mb-4">Herramienta</p>
      <h1 className="font-display text-3xl sm:text-4xl text-paper mb-4">
        ¿Cuánto te ahorraría automatizar esta tarea?
      </h1>
      <p className="text-muted max-w-2xl leading-relaxed mb-14">
        Ajusta los valores a tu caso real. No hace falta que sea exacto — sirve para ver
        si merece la pena dedicarle un flujo de automatización o no.
      </p>

      <AhorroCalculator />
    </div>
  );
}
