import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/panel";
import { site } from "@/lib/site";
import type { RestaurantProfile } from "@/lib/types";
import { inviteOwner, saveRestaurant, saveRestaurantForm } from "../actions";
import RestaurantForm from "../RestaurantForm";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ msg?: string }> };

export default async function EditRestaurant({ params, searchParams }: Props) {
  const { slug } = await params;
  const { msg } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: r } = await supabase.from("restaurants").select("*").eq("slug", slug).maybeSingle();
  if (!r) notFound();
  const profile = r.profile as RestaurantProfile;

  const chatUrl = `${site.url}/c/${r.slug}`;
  const menuUrl = `${chatUrl}/carta`;
  const qr = await QRCode.toDataURL(chatUrl, { width: 800, margin: 2, color: { dark: "#1c1917", light: "#ffffff" } });
  const qrMenu = await QRCode.toDataURL(menuUrl, { width: 800, margin: 2, color: { dark: "#1c1917", light: "#ffffff" } });
  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-ink";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/panel/admin" className="text-sm text-muted hover:text-ink">← Administración</Link>
      <div className="mt-4 mb-6 flex items-center gap-4">
        {profile.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo} alt="" className="size-14 rounded-2xl border border-line bg-white object-contain" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-2xl font-display text-2xl text-white" style={{ background: profile.accent }}>
            {r.name.charAt(0)}
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl font-semibold">{r.name}</h1>
          <p className={`text-sm ${r.active ? "text-sea" : "text-muted"}`}>{r.active ? "● Publicado" : "○ No publicado"}</p>
        </div>
      </div>
      {msg && <p className="mb-6 rounded-xl bg-sand p-3 text-sm">{msg}</p>}

      {/* QR y enlaces listos para entregar */}
      <section className="mb-10 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">QR y enlaces para el restaurante</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { label: "💬 Chat (asistente + reservas)", url: chatUrl, png: qr, file: `atenlo-qr-chat-${r.slug}.png` },
            { label: "📖 Carta digital", url: menuUrl, png: qrMenu, file: `atenlo-qr-carta-${r.slug}.png` },
          ].map((x) => (
            <div key={x.url} className="space-y-3">
              <p className="text-sm font-medium">{x.label}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.png} alt={`QR de ${x.url}`} className="w-40 rounded-xl border border-line" />
              <a href={x.url} target="_blank" className="block font-mono text-xs break-all text-terra underline">{x.url}</a>
              <div className="flex gap-2">
                <a href={x.png} download={x.file} className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream">Descargar QR</a>
                <a href={x.url} target="_blank" className="rounded-full border border-line px-4 py-2 text-xs font-medium">Abrir ↗</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RestaurantForm
        mode="edit"
        action={saveRestaurantForm}
        initial={{ id: r.id, name: r.name, slug: r.slug, notify_email: r.notify_email, active: r.active, profile }}
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <form action={inviteOwner} className="space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="slug" value={r.slug} />
          <p className="font-semibold">Dar acceso a un dueño</p>
          <input name="email" type="email" required placeholder="email@ejemplo.com" className={field} />
          <button className="w-full rounded-full border border-ink py-2 font-medium">Dar acceso</button>
        </form>

        <details className="rounded-2xl border border-line bg-white p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Avanzado: editar la ficha en JSON</summary>
          <form action={saveRestaurant} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="slug" value={r.slug} />
            <input type="hidden" name="name" value={r.name} />
            <input type="hidden" name="notify_email" value={r.notify_email ?? ""} />
            {r.active && <input type="hidden" name="active" value="on" />}
            <textarea name="profile" rows={14} defaultValue={JSON.stringify({ ...profile, logo: profile.logo ? "(se mantiene)" : undefined }, null, 2)} className={`${field} font-mono text-xs`} spellCheck={false} />
            <button className="rounded-full bg-ink px-4 py-2 font-medium text-cream">Guardar JSON</button>
          </form>
        </details>
      </div>
    </main>
  );
}
