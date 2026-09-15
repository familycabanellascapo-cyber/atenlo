import Link from "next/link";
import { site } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {site.name}. Automatizaciones para negocios, contadas con números reales.
        </p>
        <div className="flex gap-5 font-mono">
          <Link href="/aviso-legal" className="hover:text-paper transition-colors">
            Aviso legal
          </Link>
          <Link href="/politica-de-privacidad" className="hover:text-paper transition-colors">
            Privacidad
          </Link>
          <Link href="/politica-de-cookies" className="hover:text-paper transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
