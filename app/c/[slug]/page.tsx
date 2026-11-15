import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Chat from "@/components/Chat";
import { allClientSlugs, getClient } from "@/lib/clients";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allClientSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getClient((await params).slug);
  if (!c) return {};
  return {
    title: { absolute: `${c.name} · Pregúntanos` },
    description: `Horarios, carta, alérgenos y reservas de ${c.name}.`,
    robots: c.demo ? { index: false } : undefined,
  };
}

export default async function ClientChatPage({ params }: Props) {
  const c = getClient((await params).slug);
  if (!c) notFound();
  return (
    <Chat
      slug={c.slug}
      name={c.name}
      kind={c.kind}
      accent={c.accent}
      languages={c.languages}
      welcome={c.welcome}
      demo={c.demo}
    />
  );
}
