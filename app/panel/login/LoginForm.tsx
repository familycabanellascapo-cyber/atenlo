"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    setBusy(true);
    setMsg(null);
    const supabase = createBrowserSupabase();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: String(f.get("password")) });
      if (error) {
        setMsg("Email o contraseña incorrectos.");
        setBusy(false);
        return;
      }
      window.location.href = "/panel";
    } else {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/panel/password`,
      });
      setMsg("Si el email existe, te hemos enviado un enlace para crear una contraseña nueva.");
      setBusy(false);
    }
  }

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-ink";
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      {mode === "login" && (
        <label className="block text-sm">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className={field} />
        </label>
      )}
      {msg && <p className="text-sm text-terra-dark">{msg}</p>}
      <button disabled={busy} className="w-full rounded-full bg-ink py-3 font-medium text-cream disabled:opacity-50">
        {mode === "login" ? "Entrar" : "Enviar enlace"}
      </button>
      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "reset" : "login"); setMsg(null); }}
        className="w-full text-sm text-muted underline"
      >
        {mode === "login" ? "He olvidado mi contraseña" : "Volver a entrar"}
      </button>
    </form>
  );
}
