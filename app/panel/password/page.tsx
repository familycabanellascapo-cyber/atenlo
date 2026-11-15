"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

// Aquí llega el dueño desde el email de invitación o de "he olvidado mi contraseña".
export default function PasswordPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password.length < 8) return setMsg("Mínimo 8 caracteres.");
    if (password !== f.get("repeat")) return setMsg("Las contraseñas no coinciden.");
    setBusy(true);
    const { error } = await createBrowserSupabase().auth.updateUser({ password });
    if (error) {
      setMsg("No se pudo guardar. Abre de nuevo el enlace del email.");
      setBusy(false);
      return;
    }
    window.location.href = "/panel";
  }

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-ink";
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-3xl font-semibold">Crea tu contraseña</h1>
        <label className="block text-sm">
          Contraseña nueva
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>
        <label className="block text-sm">
          Repite la contraseña
          <input name="repeat" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>
        {msg && <p className="text-sm text-terra-dark">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-ink py-3 font-medium text-cream disabled:opacity-50">
          Guardar y entrar
        </button>
      </form>
    </main>
  );
}
