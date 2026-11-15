import Link from "next/link";
import ContactButton from "./ContactButton";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" aria-label="ATENLO, inicio" className="shrink-0">
          <Logo compact />
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <a href="/#como-funciona" className="hidden text-muted hover:text-ink md:inline">Cómo funciona</a>
          <a href="/#precios" className="hidden text-muted hover:text-ink md:inline">Precios</a>
          <Link href="/demo" className="hidden text-muted hover:text-ink sm:inline">Demo</Link>
          <Link href="/panel/login" className="flex items-center gap-1 whitespace-nowrap text-muted hover:text-ink">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H3Z" />
            </svg>
            Iniciar sesión
          </Link>
          <ContactButton source="cabecera" className="rounded-full bg-ink px-4 py-2 font-medium whitespace-nowrap text-cream hover:bg-terra">
            Solicitar demo
          </ContactButton>
        </nav>
      </div>
    </header>
  );
}
