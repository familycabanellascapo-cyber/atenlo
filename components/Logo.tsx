// Logo de ATENLO: bocadillo de chat (el asistente que responde) + nombre.
// El último punto en naranja es el mismo punto de "ATENLO."
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#c2410c" />
      <path d="M19 15h26a8 8 0 0 1 8 8v13a8 8 0 0 1-8 8H31l-10 8v-8h-2a8 8 0 0 1-8-8V23a8 8 0 0 1 8-8z" fill="#faf6ef" />
      <circle cx="24" cy="29.5" r="3.2" fill="#1c1917" />
      <circle cx="32" cy="29.5" r="3.2" fill="#1c1917" />
      <circle cx="40" cy="29.5" r="3.2" fill="#c2410c" />
    </svg>
  );
}

export default function Logo({ size = "md", compact = false }: { size?: "md" | "lg"; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={size === "lg" ? "size-9" : "size-7"} />
      <span className={`font-display font-semibold tracking-tight ${size === "lg" ? "text-2xl" : "text-xl"} ${compact ? "hidden sm:inline" : ""}`}>
        ATENLO<span className="text-terra">.</span>
      </span>
    </span>
  );
}
