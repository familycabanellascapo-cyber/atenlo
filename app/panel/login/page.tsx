import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; setup?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="font-display text-2xl font-semibold">ATENLO<span className="text-terra">.</span></a>
        <h1 className="mt-6 font-display text-3xl font-semibold">Entra en tu panel</h1>
        {sp.setup && <p className="mt-4 rounded-xl bg-sand p-3 text-sm">Falta conectar la base de datos (Supabase). Mira el README.</p>}
        {sp.error && <p className="mt-4 rounded-xl bg-sand p-3 text-sm">El enlace ha caducado o no es válido. Pide uno nuevo.</p>}
        <LoginForm />
      </div>
    </main>
  );
}
