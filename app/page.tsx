import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhoneMockup from "@/components/PhoneMockup";
import { whatsappLink } from "@/lib/site";

const questions = [
  { lang: "ES", q: "¿Abrís hoy a mediodía?" },
  { lang: "EN", q: "Do you have vegan options?" },
  { lang: "DE", q: "Kann man mit Hund auf die Terrasse?" },
  { lang: "ES", q: "¿Tenéis mesa para 6 el sábado?" },
];

const steps = [
  { n: "1", title: "Nos pasas tu información", text: "Carta con alérgenos, horarios, reservas, terraza, parking… Una llamada de 20 minutos o una foto de la carta." },
  { n: "2", title: "Lo dejamos listo en 48 h", text: "Configuramos tu asistente, lo probamos con preguntas reales y te enseñamos cómo responde antes de activarlo." },
  { n: "3", title: "Lo pones donde te preguntan", text: "QR en las mesas, enlace en Google Maps y en la bio de Instagram, o en tu web. Sin instalar nada." },
];

const does = [
  "Responde en español, inglés y alemán, 24 horas",
  "Horarios, carta, precios, terraza, perros, parking, pago…",
  "Alérgenos, solo con la información que tú nos das",
  "Recoge peticiones de reserva (nombre, día, hora, personas) y te avisa",
  "Te pasa la conversación cuando no sabe algo",
  "Y con las tarjetas NFC, tus clientes te dejan reseña en Google con solo acercar el móvil",
];
const doesNot = [
  "No se inventa precios, platos ni disponibilidad",
  "No confirma reservas por su cuenta: las confirmas tú",
  "No sustituye a tu equipo en temas de alergias graves: siempre recomienda avisar al personal",
];

const faqs = [
  { q: "¿Necesito tener página web?", a: "No. Tu asistente tiene su propia página (atenlo.com/tu-local) que enlazas desde un QR, Google Maps o Instagram." },
  { q: "¿Y si responde algo mal?", a: "Solo responde con la información aprobada por ti. Si no la tiene, lo dice y deriva a tu equipo. Puedes revisar las conversaciones y corregir la información cuando quieras." },
  { q: "¿Hay permanencia?", a: "No. Pagas mes a mes y, si no te convence, lo das de baja cuando quieras." },
  { q: "¿Qué es el precio fundador?", a: "Los primeros 20 locales que se den de alta pagan 39 €/mes en lugar de 49 €, y mantienen ese precio para siempre mientras sigan con nosotros." },
  { q: "¿Cómo funcionan las tarjetas NFC?", a: "Te damos 2 tarjetas con NFC y QR. Tu cliente acerca el móvil (o escanea el QR) y se abre directamente la página para dejarte una reseña en Google." },
  { q: "¿Funciona por WhatsApp?", a: "Estamos preparando la conexión con WhatsApp e Instagram. De momento funciona con QR, enlace y web." },
];

export default function Home() {
  const cta = whatsappLink("Hola, tengo un local y me interesa ATENLO.");
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div>
            <p className="mb-5 inline-block rounded-full bg-sand px-3 py-1 text-sm text-terra-dark">
              Para bares y restaurantes de Mallorca
            </p>
            <h1 className="font-display text-4xl leading-[1.1] font-semibold sm:text-6xl">
              Tu restaurante responde a cada cliente, <span className="text-terra">en su idioma</span>, a cualquier hora.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Horarios, carta, alérgenos, reservas… Un asistente contesta las preguntas de siempre en
              español, inglés y alemán, y te avisa cuando hace falta una persona. Tú sigues a lo tuyo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo" className="rounded-full bg-terra px-6 py-3 font-medium text-white hover:bg-terra-dark">
                Probar la demo
              </Link>
              <a href="#precios" className="rounded-full border border-ink px-6 py-3 font-medium hover:bg-ink hover:text-cream">
                ☕ Cuesta un café al día
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">Sin permanencia · Listo en 48 h · Sin instalar nada</p>
          </div>
          <PhoneMockup />
        </section>

        {/* Problema */}
        <section className="border-y border-line bg-sand/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Cada día te preguntan lo mismo.</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Y casi siempre en plena hora de servicio, por mensaje o por teléfono, y muchas veces en otro idioma.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {questions.map((x) => (
                <div key={x.q} className="rounded-2xl border border-line bg-cream p-5">
                  <span className="text-xs font-semibold text-sea">{x.lang}</span>
                  <p className="mt-2 font-medium">“{x.q}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Cómo funciona</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-display text-5xl text-terra">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qué hace / qué no */}
        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 md:grid-cols-2">
          <div className="rounded-3xl bg-ink p-8 text-cream">
            <h3 className="font-display text-2xl">Lo que hace</h3>
            <ul className="mt-5 space-y-3">
              {does.map((d) => (
                <li key={d} className="flex gap-3"><span className="text-terra">✓</span>{d}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-line p-8">
            <h3 className="font-display text-2xl">Lo que no hace</h3>
            <ul className="mt-5 space-y-3 text-muted">
              {doesNot.map((d) => (
                <li key={d} className="flex gap-3"><span>✕</span>{d}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="scroll-mt-20 border-y border-line bg-sand/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">☕ Por menos de lo que cobras por un café al día.</h2>
            <p className="mt-3 max-w-2xl text-muted">Un solo plan, todo incluido, sin sorpresas.</p>
            <div className="mt-10 max-w-md rounded-3xl border-2 border-terra bg-cream p-8">
              <p className="text-sm font-semibold text-terra">ATENLO</p>
              <p className="mt-2">
                <span className="font-display text-5xl font-semibold">49 €</span>
                <span className="text-muted"> /mes + IVA</span>
              </p>
              <p className="mt-3 rounded-xl bg-sand px-4 py-3 text-sm">
                <strong className="text-terra-dark">Precio fundador: 39 €/mes para siempre</strong>
                <br />
                <span className="text-muted">Solo para los primeros 20 locales.</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm">
                <li>✓ Asistente en español, inglés y alemán, 24 h</li>
                <li>✓ Tu página propia + QR para las mesas</li>
                <li>✓ Carta, alérgenos, horarios e información práctica</li>
                <li>✓ Peticiones de reserva con aviso al momento</li>
                <li>✓ 2 tarjetas NFC para conseguir reseñas en Google</li>
                <li>✓ Lo configuramos nosotros en 48 h y lo actualizamos cuando lo necesites</li>
              </ul>
              <p className="mt-5 text-sm font-medium text-sea">Sin permanencia · Cancela cuando quieras</p>
              <a href={cta} className="mt-6 block rounded-full bg-terra py-3 text-center font-medium text-white hover:bg-terra-dark">
                Quiero mi plaza de fundador
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">Preguntas frecuentes</h2>
          <div className="mt-8 divide-y divide-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none font-medium marker:hidden">
                  <span className="mr-2 inline-block text-terra transition group-open:rotate-45">+</span>
                  {f.q}
                </summary>
                <p className="mt-3 pl-5 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl bg-terra px-8 py-14 text-center text-white">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Tu asistente, por un café al día.</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">
              Escríbenos y en 48 h lo tienes funcionando. Precio fundador para los primeros 20 locales.
            </p>
            <a href={cta} className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-medium text-terra-dark hover:bg-cream">
              Hablemos
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
