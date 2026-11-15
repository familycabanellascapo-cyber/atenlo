import type { Client } from "../types";
import { demo } from "./demo";

// De momento las fichas viven en el código (un archivo por cliente).
// Cuando haya varios clientes de pago, se pasan a Supabase sin cambiar el resto.
const clients: Record<string, Client> = {
  [demo.slug]: demo,
};

export function getClient(slug: string): Client | undefined {
  return clients[slug];
}

export function allClientSlugs(): string[] {
  return Object.keys(clients);
}
