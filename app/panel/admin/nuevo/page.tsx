import Link from "next/link";
import { requireAdmin } from "@/lib/panel";
import { emptyProfile } from "@/lib/profile";
import { createRestaurantForm } from "../actions";
import RestaurantForm from "../RestaurantForm";

export default async function NewRestaurantPage() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/panel/admin" className="text-sm text-muted hover:text-ink">← Administración</Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">Nuevo restaurante</h1>
      <p className="mt-2 mb-8 text-muted">
        Rellena lo que tengas: al pulsar <strong>Crear y publicar</strong> su chat, su carta y su QR quedan listos al momento.
        Todo se puede cambiar después.
      </p>
      <RestaurantForm
        mode="create"
        action={createRestaurantForm}
        initial={{ name: "", slug: "", notify_email: "", active: true, profile: { ...emptyProfile(""), hours: [{ day: "", time: "" }] } }}
      />
    </main>
  );
}
