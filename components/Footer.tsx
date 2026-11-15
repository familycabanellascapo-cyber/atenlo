import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display font-semibold text-ink">ATENLO</span> · Hecho en Mallorca ·{" "}
          <a href={`mailto:${site.email}`} className="hover:text-ink">{site.email}</a>
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/panel/login" className="font-medium text-ink hover:text-terra">Iniciar sesión</Link>
          <Link href="/aviso-legal" className="hover:text-ink">Aviso legal</Link>
          <Link href="/privacidad" className="hover:text-ink">Privacidad</Link>
          <Link href="/cookies" className="hover:text-ink">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
