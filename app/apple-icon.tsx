import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono para "Añadir a pantalla de inicio" en iPhone.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#c2410c" }}>
        <svg viewBox="0 0 64 64" width="180" height="180">
          <path d="M19 15h26a8 8 0 0 1 8 8v13a8 8 0 0 1-8 8H31l-10 8v-8h-2a8 8 0 0 1-8-8V23a8 8 0 0 1 8-8z" fill="#faf6ef" />
          <circle cx="24" cy="29.5" r="3.2" fill="#1c1917" />
          <circle cx="32" cy="29.5" r="3.2" fill="#1c1917" />
          <circle cx="40" cy="29.5" r="3.2" fill="#c2410c" />
        </svg>
      </div>
    ),
    size,
  );
}
