import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-4xl font-semibold">Página no encontrada</h1>
      <Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-cream">Volver a ATENLO</Link>
    </main>
  );
}
