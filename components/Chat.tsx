"use client";

import { useEffect, useRef, useState } from "react";
import type { Client, Lang } from "@/lib/types";
import MenuView from "./MenuView";

type Msg = { role: "user" | "assistant"; content: string; showMenu?: boolean };

const suggestions: Record<Lang, string[]> = {
  es: ["¿Qué horario tenéis?", "¿Tenéis platos sin gluten?", "¿Se puede ir con perro?", "¿Dónde estáis?"],
  en: ["What are your opening hours?", "Any gluten-free dishes?", "Are dogs allowed?", "Where are you?"],
  de: ["Wann haben Sie geöffnet?", "Gibt es glutenfreie Gerichte?", "Sind Hunde erlaubt?", "Wo sind Sie?"],
};

const ui = {
  es: {
    placeholder: "Escribe tu pregunta…", send: "Enviar", error: "No he podido responder. Inténtalo de nuevo.",
    privacy: "No compartas datos sensibles.", book: "📅 Reservar mesa", bookTitle: "Pedir reserva",
    name: "Nombre", day: "Día", time: "Hora", people: "Personas", contact: "Teléfono o email",
    notes: "Comentarios (opcional)", submit: "Enviar petición", cancel: "Cancelar",
    sent: "✅ ¡Petición enviada! El restaurante te contactará para confirmarla. Tu reserva no está confirmada hasta entonces.",
    sentDemo: "✅ (Demo) Así se enviaría la petición al restaurante. En la demo no se envía nada.",
    bookError: "No se pudo enviar. Revisa los datos o llama al restaurante.",
    full: "Lo sentimos, para ese día y turno ya no quedan mesas. Prueba otra hora u otro día, o llama al restaurante.",
    menuBtn: "📖 Ver carta", viewMenu: "📖 Ver la carta completa",
  },
  en: {
    placeholder: "Type your question…", send: "Send", error: "Something went wrong. Please try again.",
    privacy: "Please don't share sensitive data.", book: "📅 Book a table", bookTitle: "Booking request",
    name: "Name", day: "Day", time: "Time", people: "People", contact: "Phone or email",
    notes: "Comments (optional)", submit: "Send request", cancel: "Cancel",
    sent: "✅ Request sent! The restaurant will contact you to confirm. Your booking isn't confirmed until then.",
    sentDemo: "✅ (Demo) This is how the request would reach the restaurant. Nothing is sent in the demo.",
    bookError: "Couldn't send it. Check the details or call the restaurant.",
    full: "Sorry, there are no tables left for that day and service. Try another time or day, or call the restaurant.",
    menuBtn: "📖 View menu", viewMenu: "📖 View the full menu",
  },
  de: {
    placeholder: "Ihre Frage…", send: "Senden", error: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    privacy: "Bitte keine sensiblen Daten teilen.", book: "📅 Tisch reservieren", bookTitle: "Reservierungsanfrage",
    name: "Name", day: "Tag", time: "Uhrzeit", people: "Personen", contact: "Telefon oder E-Mail",
    notes: "Anmerkungen (optional)", submit: "Anfrage senden", cancel: "Abbrechen",
    sent: "✅ Anfrage gesendet! Das Restaurant meldet sich zur Bestätigung. Bis dahin ist die Reservierung nicht bestätigt.",
    sentDemo: "✅ (Demo) So würde die Anfrage beim Restaurant ankommen. In der Demo wird nichts gesendet.",
    bookError: "Senden fehlgeschlagen. Bitte Daten prüfen oder das Restaurant anrufen.",
    full: "Leider sind für diesen Tag und diese Schicht keine Tische mehr frei. Bitte andere Uhrzeit oder anderen Tag wählen oder anrufen.",
    menuBtn: "📖 Speisekarte", viewMenu: "📖 Ganze Speisekarte ansehen",
  },
} satisfies Record<Lang, Record<string, string>>;

type Props = {
  slug: string;
  name: string;
  kind: string;
  accent: string;
  languages: Lang[];
  welcome: Record<Lang, string>;
  demo?: boolean;
  reservations: boolean;
  menu: Client["menu"];
  logo?: string;
};

export default function Chat({ slug, name, kind, accent, languages, welcome, demo, reservations, menu, logo }: Props) {
  const [lang, setLang] = useState<Lang>(languages[0]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasMenu = menu.some((s) => s.dishes.length > 0);
  const conversationId = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navigator.language.slice(0, 2) as Lang;
    if (languages.includes(nav)) setLang(nav);
  }, [languages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, showBooking]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          messages: next.map(({ role, content }) => ({ role, content })),
          conversationId: conversationId.current,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.conversationId) conversationId.current = data.conversationId;
      setMessages([...next, { role: "assistant", content: data.reply, showMenu: hasMenu && !!data.showMenu }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const t = ui[lang];

  return (
    <div className="flex h-dvh flex-col bg-cream">
      <header className="px-4 py-3 text-white" style={{ background: accent }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="size-10 shrink-0 rounded-xl bg-white object-contain p-0.5" />
            )}
            <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold">{name}</h1>
            <p className="truncate text-xs opacity-85">{kind}</p>
            </div>
          </div>
          {languages.length > 1 && (
            <div className="flex shrink-0 gap-1" role="group" aria-label="Idioma">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${lang === l ? "bg-white text-ink" : "bg-white/15 hover:bg-white/25"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {demo && (
        <p className="bg-sand px-4 py-2 text-center text-xs text-muted">
          Demo con un restaurante ficticio · <a href="/" className="underline">Volver a ATENLO</a>
        </p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-5">
          <Bubble role="assistant">{welcome[lang]}</Bubble>
          {messages.map((m, i) => (
            <div key={i} className="space-y-2">
              <Bubble role={m.role}>{m.content}</Bubble>
              {m.showMenu && (
                <button
                  onClick={() => setMenuOpen(true)}
                  className="ml-1 rounded-2xl border-2 bg-white px-4 py-3 text-left font-medium shadow-sm"
                  style={{ borderColor: accent, color: accent }}
                >
                  {t.viewMenu} →
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex">
              <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm" aria-label="…">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
                </span>
              </p>
            </div>
          )}
          {error && <p className="text-center text-sm text-terra-dark">{t.error}</p>}
          {messages.length === 0 && !showBooking && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions[lang].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {showBooking && (
            <BookingForm
              slug={slug}
              lang={lang}
              accent={accent}
              conversationId={conversationId.current}
              onClose={() => setShowBooking(false)}
              onSent={(msg) => {
                setShowBooking(false);
                setMessages((m) => [...m, { role: "assistant", content: msg }]);
              }}
            />
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {((reservations && !showBooking) || hasMenu) && (
          <div className="mx-auto mb-2 flex max-w-2xl gap-2">
            {hasMenu && (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="rounded-full border px-3 py-1.5 text-sm font-medium"
                style={{ borderColor: accent, color: accent }}
              >
                {t.menuBtn}
              </button>
            )}
            {reservations && !showBooking && (
            <button
              type="button"
              onClick={() => setShowBooking(true)}
              className="rounded-full border px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: accent, color: accent }}
            >
              {t.book}
            </button>
            )}
          </div>
        )}
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            maxLength={600}
            className="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-base outline-none focus:border-ink"
            aria-label={t.placeholder}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full px-5 py-2.5 font-medium text-white disabled:opacity-40"
            style={{ background: accent }}
          >
            {t.send}
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted">
          {t.privacy} <a href="/privacidad" className="underline">Privacidad</a> · Asistente de{" "}
          <a href="/" className="underline">ATENLO</a>
        </p>
      </form>

      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cream" role="dialog" aria-modal="true">
          <MenuView
            name={name}
            kind={kind}
            accent={accent}
            menu={menu}
            languages={languages}
            initialLang={lang}
            logo={logo}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function BookingForm({
  slug, lang, accent, conversationId, onClose, onSent,
}: {
  slug: string;
  lang: Lang;
  accent: string;
  conversationId: string | null;
  onClose: () => void;
  onSent: (msg: string) => void;
}) {
  const t = ui[lang];
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<false | "full" | "error">(false);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    setErr(false);
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug, lang, conversationId,
          name: f.get("name"), day: f.get("day"), time: f.get("time"),
          people: Number(f.get("people")), contact: f.get("contact"), notes: f.get("notes"),
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setErr("full");
        return;
      }
      if (!res.ok) throw new Error(data.error);
      onSent(data.demo ? t.sentDemo : t.sent);
    } catch {
      setErr("error");
    } finally {
      setSending(false);
    }
  }

  const field = "w-full rounded-xl border border-line bg-cream px-3 py-2 text-base outline-none focus:border-ink";
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
      <p className="font-semibold">{t.bookTitle}</p>
      <label className="block text-sm">
        {t.name}
        <input name="name" required maxLength={80} autoComplete="name" className={field} />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="col-span-3 block text-sm sm:col-span-1">
          {t.day}
          <input name="day" type="date" required min={today} className={field} />
        </label>
        <label className="col-span-2 block text-sm sm:col-span-1">
          {t.time}
          <input name="time" type="time" required className={field} />
        </label>
        <label className="block text-sm">
          {t.people}
          <input name="people" type="number" min={1} max={200} defaultValue={2} required className={field} />
        </label>
      </div>
      <label className="block text-sm">
        {t.contact}
        <input name="contact" required maxLength={120} autoComplete="tel" className={field} />
      </label>
      <label className="block text-sm">
        {t.notes}
        <input name="notes" maxLength={300} className={field} />
      </label>
      {err && <p className="rounded-xl bg-sand p-3 text-sm text-terra-dark">{err === "full" ? t.full : t.bookError}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 rounded-full py-2.5 font-medium text-white disabled:opacity-50"
          style={{ background: accent }}
        >
          {t.submit}
        </button>
        <button type="button" onClick={onClose} className="rounded-full border border-line px-4 py-2.5">
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex"}>
      <p
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-line ${
          role === "user" ? "rounded-br-sm bg-ink text-white" : "rounded-bl-sm bg-white shadow-sm"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
