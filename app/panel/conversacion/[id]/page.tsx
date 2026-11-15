import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/panel";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ r?: string }> };

export default async function ConversationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { r } = await searchParams;
  const { supabase } = await requireUser();
  // RLS: si la conversación no es de tu restaurante, no devuelve nada.
  const { data: conv } = await supabase.from("conversations").select("id, created_at").eq("id", id).maybeSingle();
  if (!conv) notFound();
  const { data: msgs } = await supabase.from("messages").select("id, role, content, created_at").eq("conversation_id", id).order("id");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/panel?${r ? `r=${r}&` : ""}tab=conversaciones`} className="text-sm text-muted hover:text-ink">← Conversaciones</Link>
      <h1 className="mt-4 mb-6 font-display text-2xl font-semibold">
        Conversación del {new Date(conv.created_at).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Madrid" })}
      </h1>
      <div className="space-y-3">
        {(msgs ?? []).map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex"}>
            <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 whitespace-pre-line ${m.role === "user" ? "bg-ink text-white" : "bg-white shadow-sm"}`}>
              {m.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
