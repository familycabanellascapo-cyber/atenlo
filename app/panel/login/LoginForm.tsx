"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { site } from "@/lib/site";

// Dos formas de entrar: con un enlace por email (lo normal para los restaurantes,
// sin contraseña) o con contraseña.
export default function LoginForm() {
  const [mode, setMode] = useState<"link" | "password">("link");
  const [msg, setMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    setBusy(true);
    setMsg(null);
    const supabase = createBrowserSupabase();
    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: String(f.get("password")) });
      if (error) {
        setMsg("Email o contraseña incorrectos.");
        setBusy(false);
        return;
      }
      window.location.href = "/panel";
      return;
    }
    // En local, el enlace vuelve a localhost; en la web, a atenlo.com.
    const base = window.location.hostname === "localhost" ? window.location.origin : site.url;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${base}/auth/confirm?next=/panel` },
    });
    setBusy(false);
    if (error) {
      setMsg(error.status === 429 ? "Has pedido muchos enlaces. Espera un minuto y vuelve a probar." : "No se pudo enviar el enlace. Revisa el email.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5">
        <p className="font-semibold">📩 Revisa tu correo</p>
        <p className="mt-2 text-sm text-muted">
          Te hemos enviado un enlace para entrar. Ábrelo en este mismo navegador. Si no lo ves, mira en spam.
        </p>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-ink";
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      {mode === "password" && (
        <label className="block text-sm">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className={field} />
        </label>
      )}
      {msg && <p className="text-sm text-terra-dark">{msg}</p>}
      <button disabled={busy} className="w-full rounded-full bg-ink py-3 font-medium text-cream disabled:opacity-50">
        {mode === "link" ? "Enviarme un enlace para entrar" : "Entrar"}
      </button>
      <button
        type="button"
        onClick={() => { setMode(mode === "link" ? "password" : "link"); setMsg(null); }}
        className="w-full text-sm text-muted underline"
      >
        {mode === "link" ? "Entrar con contraseña" : "Entrar con un enlace por email"}
      </button>
    </form>
  );
}
