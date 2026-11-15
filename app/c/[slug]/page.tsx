import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Chat from "@/components/Chat";
import { getRestaurant } from "@/lib/clients";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRestaurant((await params).slug);
  if (!r) return {};
  return {
    title: { absolute: `${r.client.name} · Pregúntanos` },
    description: `Horarios, carta, alérgenos y reservas de ${r.client.name}.`,
    robots: r.client.demo ? { index: false } : undefined,
  };
}

export default async function ClientChatPage({ params }: Props) {
  const r = await getRestaurant((await params).slug);
  if (!r) notFound();
  const c = r.client;
  return (
    <Chat
      slug={c.slug}
      name={c.name}
      kind={c.kind}
      accent={c.accent}
      languages={c.languages}
      welcome={c.welcome}
      demo={c.demo}
      reservations={c.reservations.accepted}
      menu={c.menu}
    />
  );
}
