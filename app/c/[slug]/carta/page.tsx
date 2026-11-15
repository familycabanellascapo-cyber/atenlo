import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MenuView from "@/components/MenuView";
import { getRestaurant } from "@/lib/clients";
import type { Lang } from "@/lib/types";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRestaurant((await params).slug);
  if (!r) return {};
  return {
    title: { absolute: `Carta · ${r.client.name}` },
    description: `Carta de ${r.client.name} con precios y alérgenos.`,
    robots: r.client.demo ? { index: false } : undefined,
  };
}

// Carta digital del local: para el QR de la mesa, una tablet o imprimir.
export default async function CartaPage({ params, searchParams }: Props) {
  const r = await getRestaurant((await params).slug);
  if (!r) notFound();
  const c = r.client;
  const want = (await searchParams).lang as Lang | undefined;
  const lang = want && c.languages.includes(want) ? want : c.languages[0];
  return (
    <MenuView
      name={c.name}
      kind={c.kind}
      accent={c.accent}
      menu={c.menu}
      languages={c.languages}
      initialLang={lang}
      chatHref={`/c/${c.slug}`}
      logo={c.logo}
    />
  );
}
