"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string };

const suggestions: Record<Lang, string[]> = {
  es: ["¿Qué horario tenéis?", "¿Tenéis platos sin gluten?", "Quiero reservar", "¿Se puede ir con perro?"],
  en: ["What are your opening hours?", "Any gluten-free dishes?", "I'd like to book a table", "Are dogs allowed?"],
  de: ["Wann haben Sie geöffnet?", "Gibt es glutenfreie Gerichte?", "Ich möchte reservieren", "Sind Hunde erlaubt?"],
};
const ui: Record<Lang, { placeholder: string; send: string; error: string; privacy: string }> = {
  es: { placeholder: "Escribe tu pregunta…", send: "Enviar", error: "No he podido responder. Inténtalo de nuevo.", privacy: "No compartas datos sensibles." },
  en: { placeholder: "Type your question…", send: "Send", error: "Something went wrong. Please try again.", privacy: "Please don't share sensitive data." },
  de: { placeholder: "Ihre Frage…", send: "Senden", error: "Etwas ist schiefgelaufen. Bitte erneut versuchen.", privacy: "Bitte keine sensiblen Daten teilen." },
};

export default function Chat({
  slug,
  name,
  kind,
  accent,
  languages,
  welcome,
  demo,
}: {
  slug: string;
  name: string;
  kind: string;
  accent: string;
  languages: Lang[];
  welcome: Record<Lang, string>;
  demo?: boolean;
}) {
  const [lang, setLang] = useState<Lang>(languages[0]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Idioma inicial según el móvil del cliente.
  useEffect(() => {
    const nav = navigator.language.slice(0, 2) as Lang;
    if (languages.includes(nav)) setLang(nav);
  }, [languages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

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
        body: JSON.stringify({ slug, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.reply }]);
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
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold">{name}</h1>
            <p className="truncate text-xs opacity-85">{kind}</p>
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
            <Bubble key={i} role={m.role}>{m.content}</Bubble>
          ))}
          {loading && (
            <div className="flex">
              <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm" aria-label="Escribiendo">
                <span className="inline-flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
                </span>
              </p>
            </div>
          )}
          {error && <p className="text-center text-sm text-terra-dark">{t.error}</p>}
          {messages.length === 0 && (
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
    </div>
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
