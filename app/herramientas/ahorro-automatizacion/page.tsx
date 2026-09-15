import type { Metadata } from "next";
import Link from "next/link";
import AhorroCalculator from "@/components/AhorroCalculator";

export const metadata: Metadata = {
  title: "Calculadora de ahorro: cuánto ahorras al automatizar una tarea",
  description:
    "¿Cuánto ahorrarías si automatizaras esta tarea? Calcula en segundos el ahorro real de tiempo y dinero al automatizar un proceso de tu negocio: horas semanales, coste por hora y % automatizable.",
};

export default function HerramientaAhorro() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-sm text-teal mb-4">Herramienta gratuita</p>
      <h1 className="font-display text-3xl sm:text-4xl text-paper mb-4">
        ¿Cuánto ahorrarías automatizando esta tarea?
      </h1>
      <p className="text-muted max-w-2xl leading-relaxed mb-14">
        Calcula el ahorro real de automatizar una tarea de tu negocio a partir de tres
        datos: las horas semanales que le dedica la persona que la hace, el coste de
        esa hora de trabajo y el porcentaje de la tarea que se puede automatizar.
        Ajusta los valores a tu caso — no hace falta que sea exacto, sirve para ver si
        merece la pena dedicarle un flujo de automatización o no.
      </p>

      <AhorroCalculator />

      <div className="prose-log text-paper max-w-2xl mt-20 pt-14 border-t border-line">
        <h2>Cómo funciona esta calculadora de ahorro</h2>
        <p>
          El ahorro de automatizar una tarea depende siempre de las mismas tres
          variables. Esta calculadora las cruza para darte una estimación de ahorro
          mensual y anual al instante:
        </p>
        <ul>
          <li>
            <strong>Horas a la semana en la tarea:</strong> cuánto tiempo dedica hoy una
            persona (tú u otro trabajador) a esa tarea repetitiva.
          </li>
          <li>
            <strong>Coste de esa hora de trabajo:</strong> el sueldo por hora de quien la
            hace, o lo que vale tu propia hora si eres autónomo.
          </li>
          <li>
            <strong>Porcentaje de la tarea que se puede automatizar:</strong> pocas
            tareas se automatizan al 100% — normalmente un flujo cubre la mayoría de
            los casos y una persona resuelve las excepciones.
          </li>
        </ul>
        <p>
          Con esos tres datos, calculamos las horas libres a la semana, al mes y al año,
          y su valor en euros. Si ese ahorro supera lo que costaría construir el flujo de
          automatización, la cuenta sale a favor — es el mismo criterio que explico en
          la guía{" "}
          <Link href="/blog/vale-la-pena-automatizar-mi-negocio">
            ¿Vale la pena automatizar tu negocio?
          </Link>
          .
        </p>
        <p>
          ¿Ya sabes qué tarea quieres automatizar y te falta saber cómo? Escríbeme
          desde <Link href="/contacto">contacto</Link> y lo miramos juntos.
        </p>
      </div>
    </div>
  );
}
