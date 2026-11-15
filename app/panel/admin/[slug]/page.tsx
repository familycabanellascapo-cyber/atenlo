import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/panel";
import { inviteOwner, saveRestaurant } from "../actions";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ msg?: string }> };

export default async function EditRestaurant({ params, searchParams }: Props) {
  const { slug } = await params;
  const { msg } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: r } = await supabase.from("restaurants").select("*").eq("slug", slug).maybeSingle();
  if (!r) notFound();

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/panel/admin" className="text-sm text-muted hover:text-ink">← Administración</Link>
      <div className="mt-4 mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">{r.name}</h1>
        <a href={`/c/${r.slug}`} target="_blank" className="text-sm text-terra underline">Abrir su chat ↗</a>
      </div>
      {msg && <p className="mb-6 rounded-xl bg-sand p-3 text-sm">{msg}</p>}

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <form action={saveRestaurant} className="space-y-4">
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="slug" value={r.slug} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Nombre
              <input name="name" defaultValue={r.name} className={field} />
            </label>
            <label className="block text-sm">
              Email de avisos
              <input name="notify_email" type="email" defaultValue={r.notify_email ?? ""} className={field} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={r.active} /> Activo (si lo desactivas, su chat deja de funcionar)
          </label>
          <label className="block text-sm">
            Ficha completa (JSON): carta, alérgenos, horario, información…
            <textarea name="profile" rows={28} defaultValue={JSON.stringify(r.profile, null, 2)} className={`${field} font-mono text-xs`} spellCheck={false} />
          </label>
          <button className="rounded-full bg-ink px-6 py-3 font-medium text-cream">Guardar</button>
        </form>

        <aside className="space-y-6 text-sm">
          <form action={inviteOwner} className="space-y-3 rounded-2xl border border-line bg-white p-4">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="slug" value={r.slug} />
            <p className="font-semibold">Dar acceso a un dueño</p>
            <input name="email" type="email" required placeholder="email@ejemplo.com" className={field} />
            <button className="w-full rounded-full border border-ink py-2 font-medium">Invitar</button>
          </form>
          <div className="space-y-2 rounded-2xl bg-sand p-4 text-muted">
            <p className="font-semibold text-ink">Alérgenos válidos</p>
            <p className="font-mono text-xs">gluten, crustaceos, huevo, pescado, cacahuete, soja, lacteos, frutos_secos, apio, mostaza, sesamo, sulfitos, altramuces, moluscos</p>
            <p>Usa la ficha de la demo (<code>lib/clients/demo.ts</code>) como ejemplo. Los alérgenos los confirma SIEMPRE el restaurante.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
