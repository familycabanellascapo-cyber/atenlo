"use client";

import { useState } from "react";
import { deleteRestaurant, setRestaurantActive } from "./actions";

// Pausar (reversible, p. ej. impago) o eliminar (definitivo) un restaurante.
export default function DangerZone({ id, slug, name, active }: { id: string; slug: string; name: string; active: boolean }) {
  const [typed, setTyped] = useState("");
  return (
    <section className="mt-10 space-y-4 rounded-3xl border-2 border-terra/30 p-5 sm:p-6">
      <h2 className="font-semibold">Pausar o eliminar</h2>

      <form action={setRestaurantActive} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="active" value={active ? "" : "on"} />
        <div className="text-sm">
          <p className="font-medium">{active ? "⏸️ Pausar el restaurante" : "▶️ Reactivar el restaurante"}</p>
          <p className="text-muted">
            {active
              ? "Por ejemplo si deja de pagar. Su chat y su carta dejan de funcionar, pero no se borra nada y puedes reactivarlo cuando quieras."
              : "Ahora está pausado. Al reactivarlo, su chat, su carta y sus QR vuelven a funcionar con todo lo que tenía."}
          </p>
        </div>
        <button className={`rounded-full px-5 py-2 text-sm font-medium ${active ? "border border-ink" : "bg-sea text-white"}`}>
          {active ? "Pausar" : "Reactivar"}
        </button>
      </form>

      <form action={deleteRestaurant} className="space-y-3 rounded-2xl bg-white p-4 text-sm">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="slug" value={slug} />
        <p className="font-medium text-terra-dark">🗑️ Eliminar el restaurante para siempre</p>
        <p className="text-muted">
          Se borra el local y <strong>todo lo suyo</strong>: carta, conversaciones, reservas y accesos de sus dueños. Sus QR
          dejarán de funcionar. <strong>No se puede deshacer.</strong>
        </p>
        <label className="block">
          Para confirmar, escribe el nombre exacto: <strong>{name}</strong>
          <input
            name="confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-terra"
          />
        </label>
        <button
          disabled={typed.trim() !== name}
          className="rounded-full bg-terra px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Eliminar definitivamente
        </button>
      </form>
    </section>
  );
}
