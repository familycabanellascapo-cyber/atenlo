import { redirect } from "next/navigation";
import { createUserClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  // Si ya has iniciado sesión, directo a tu panel.
  const { data } = await (await createUserClient()).auth.getUser();
  if (data.user) redirect("/panel");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" aria-label="ATENLO, inicio"><Logo size="lg" /></a>
        <h1 className="mt-6 font-display text-3xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted">Accede al panel de tu restaurante.</p>
        {sp.error && <p className="mt-4 rounded-xl bg-sand p-3 text-sm">El enlace ha caducado o no es válido. Pide uno nuevo.</p>}
        <LoginForm />
      </div>
    </main>
  );
}
