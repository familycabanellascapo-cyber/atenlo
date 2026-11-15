import Header from "./Header";
import Footer from "./Footer";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="legal mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm">Última actualización: noviembre de 2026</p>
        {children}
      </main>
      <Footer />
    </>
  );
}
