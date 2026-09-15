import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/config";

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg tracking-tight text-paper hover:text-amber transition-colors"
        >
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          {site.name}
        </Link>
        <nav className="flex items-center gap-6 font-mono text-sm text-muted">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-paper transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
