import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ATENLO · Tu restaurante responde a cada cliente, en su idioma";

// Imagen que sale al compartir atenlo.com por WhatsApp, Instagram, etc.
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#faf6ef", color: "#1c1917" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox="0 0 64 64" width="96" height="96">
            <rect width="64" height="64" rx="16" fill="#c2410c" />
            <path d="M19 15h26a8 8 0 0 1 8 8v13a8 8 0 0 1-8 8H31l-10 8v-8h-2a8 8 0 0 1-8-8V23a8 8 0 0 1 8-8z" fill="#faf6ef" />
            <circle cx="24" cy="29.5" r="3.2" fill="#1c1917" />
            <circle cx="32" cy="29.5" r="3.2" fill="#1c1917" />
            <circle cx="40" cy="29.5" r="3.2" fill="#c2410c" />
          </svg>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
            ATENLO<span style={{ color: "#c2410c" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 60, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
          Tu restaurante responde a cada cliente, en su idioma.
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#6b625a" }}>
          Carta, alérgenos y reservas en español, inglés y alemán · 24 h · Mallorca
        </div>
      </div>
    ),
    size,
  );
}
