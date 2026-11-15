import Link from "next/link";
import { whatsappLink } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          ATENLO<span className="text-terra">.</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <a href="/#como-funciona" className="hidden text-muted hover:text-ink sm:inline">Cómo funciona</a>
          <a href="/#precios" className="hidden text-muted hover:text-ink sm:inline">Precios</a>
          <Link href="/demo" className="text-muted hover:text-ink">Demo</Link>
          <a
            href={whatsappLink("Hola, tengo un local y me interesa ATENLO.")}
            className="rounded-full bg-ink px-4 py-2 font-medium text-cream hover:bg-terra"
          >
            Contactar
          </a>
        </nav>
      </div>
    </header>
  );
}
