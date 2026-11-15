import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Asistente para restaurantes en Mallorca`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, locale: "es_ES", type: "website" },
  // Verificación de Google Search Console (la misma que tenía la web anterior).
  verification: { google: "Z7W6dfvgrBo3prT6BsvAWkrOvoOcd4s7cRFBOCXe9zo" },
};

export const viewport: Viewport = { themeColor: "#faf6ef" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
