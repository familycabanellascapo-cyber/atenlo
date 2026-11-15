// Ilustración estática de una conversación (no es un chat real).
const lines: { from: "guest" | "bot"; text: string }[] = [
  { from: "guest", text: "Hi! Are you open tonight? 🙂" },
  { from: "bot", text: "Yes! Tonight we're open from 19:30 to 23:30. Would you like to book a table?" },
  { from: "guest", text: "Haben Sie glutenfreie Gerichte?" },
  { from: "bot", text: "Ja: Tumbet, Lubina und Arroz brut enthalten laut unserer Karte kein Gluten. Bitte sagen Sie es trotzdem dem Personal." },
];

export default function PhoneMockup() {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border-[10px] border-ink bg-ink shadow-2xl">
      <div className="overflow-hidden rounded-[1.9rem] bg-white">
        <div className="bg-terra px-4 py-3 text-white">
          <p className="text-sm font-semibold">Ca&apos;n Demo</p>
          <p className="text-xs opacity-80">Responde al momento · ES · EN · DE</p>
        </div>
        <div className="space-y-2.5 bg-sand/60 px-3 py-4 text-[13px] leading-snug">
          {lines.map((l, i) => (
            <div key={i} className={l.from === "guest" ? "flex justify-end" : "flex"}>
              <p
                className={
                  l.from === "guest"
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-ink px-3 py-2 text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm"
                }
              >
                {l.text}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-line px-3 py-3 text-xs text-muted">Escribe tu pregunta…</div>
      </div>
    </div>
  );
}
