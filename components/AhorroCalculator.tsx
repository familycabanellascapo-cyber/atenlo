"use client";

import { useMemo, useState } from "react";

function eur(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function AhorroCalculator() {
  const [horas, setHoras] = useState(5);
  const [coste, setCoste] = useState(15);
  const [porcentaje, setPorcentaje] = useState(80);

  const { ahorroSemanal, ahorroMensual, ahorroAnual, horasAnuales } = useMemo(() => {
    const horasAhorradas = horas * (porcentaje / 100);
    const semanal = horasAhorradas * coste;
    return {
      ahorroSemanal: semanal,
      ahorroMensual: semanal * 4.33,
      ahorroAnual: semanal * 52,
      horasAnuales: horasAhorradas * 52,
    };
  }, [horas, coste, porcentaje]);

  return (
    <div className="grid sm:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div>
          <label className="flex justify-between font-mono text-sm text-muted mb-2">
            <span>Horas a la semana en esta tarea</span>
            <span className="text-paper">{horas} h</span>
          </label>
          <input
            type="range"
            min={1}
            max={40}
            value={horas}
            onChange={(e) => setHoras(Number(e.target.value))}
            className="w-full accent-amber"
          />
        </div>

        <div>
          <label className="flex justify-between font-mono text-sm text-muted mb-2">
            <span>Coste de tu hora (o de quien la hace)</span>
            <span className="text-paper">{eur(coste)}</span>
          </label>
          <input
            type="range"
            min={5}
            max={60}
            value={coste}
            onChange={(e) => setCoste(Number(e.target.value))}
            className="w-full accent-amber"
          />
        </div>

        <div>
          <label className="flex justify-between font-mono text-sm text-muted mb-2">
            <span>% de la tarea que se puede automatizar</span>
            <span className="text-paper">{porcentaje}%</span>
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={porcentaje}
            onChange={(e) => setPorcentaje(Number(e.target.value))}
            className="w-full accent-amber"
          />
        </div>
      </div>

      <div className="border border-line p-8 flex flex-col justify-center">
        <p className="font-mono text-xs text-teal mb-6">Ahorro estimado</p>
        <div className="space-y-5">
          <div className="flex items-baseline justify-between">
            <span className="text-muted">Al mes</span>
            <span className="font-display text-2xl text-paper">{eur(ahorroMensual)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted">Al año</span>
            <span className="font-display text-2xl text-amber">{eur(ahorroAnual)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-muted">Horas libres al año</span>
            <span className="font-mono text-paper">{Math.round(horasAnuales)} h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
