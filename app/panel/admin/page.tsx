import Link from "next/link";
import { requireAdmin } from "@/lib/panel";
import { createRestaurant } from "./actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: list } = await supabase.from("restaurants").select("id, slug, name, active, created_at").order("created_at", { ascending: false });
  const { data: pending } = await supabase.from("reservations").select("restaurant_id").eq("status", "pending");
  const pendingBy = new Map<string, number>();
  for (const p of pending ?? []) pendingBy.set(p.restaurant_id, (pendingBy.get(p.restaurant_id) ?? 0) + 1);

  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/panel" className="text-sm text-muted hover:text-ink">← Panel</Link>
      <h1 className="mt-4 mb-6 font-display text-3xl font-semibold">Administración</h1>
      {msg && <p className="mb-6 rounded-xl bg-sand p-3 text-sm">{msg}</p>}

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="mb-3 font-semibold">Restaurantes ({list?.length ?? 0})</h2>
          {!list?.length ? (
            <p className="text-muted">Todavía no hay ninguno.</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
              {list.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">
                      {r.name} {!r.active && <span className="ml-1 rounded-full bg-sand px-2 py-0.5 text-xs text-muted">inactivo</span>}
                    </p>
                    <p className="text-xs text-muted">/c/{r.slug}{pendingBy.get(r.id) ? ` · ${pendingBy.get(r.id)} reservas pendientes` : ""}</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-sm">
                    <Link href={`/panel?r=${r.slug}`} className="text-muted hover:text-ink">Ver panel</Link>
                    <Link href={`/panel/admin/${r.slug}`} className="text-terra hover:underline">Editar ficha</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form action={createRestaurant} className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">Nuevo restaurante</h2>
          <label className="block text-sm">
            Nombre
            <input name="name" required placeholder="Bar Juan" className={field} />
          </label>
          <label className="block text-sm">
            Dirección web <span className="text-muted">(atenlo.com/c/…)</span>
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="bar-juan" className={field} />
          </label>
          <label className="block text-sm">
            Email del dueño <span className="text-muted">(le llega la invitación)</span>
            <input name="owner" type="email" placeholder="juan@ejemplo.com" className={field} />
          </label>
          <button className="w-full rounded-full bg-ink py-2.5 font-medium text-cream">Crear</button>
        </form>
      </div>
    </main>
  );
}
