"use server";

import { redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function cancelBooking(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!UUID.test(token)) redirect("/");
  const { data, error } = await createPublicClient().rpc("cancel_reservation", { p_token: token });
  redirect(`/r/${token}?${!error && data ? "cancelled=1" : "error=1"}`);
}
