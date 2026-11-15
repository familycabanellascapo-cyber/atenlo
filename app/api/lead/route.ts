import { NextResponse } from "next/server";
import { clientIp, rateLimited } from "@/lib/ratelimit";
import { createPublicClient } from "@/lib/supabase/server";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Formulario "Solicitar demo / contacto" de la web.
export async function POST(req: Request) {
  if (rateLimited(`lead:${clientIp(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Has enviado varias solicitudes. Te contactaremos pronto." }, { status: 429 });
  }
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  // Campo trampa: si viene relleno es un bot. Le decimos que todo bien y no guardamos nada.
  if (str(b.website, 200)) return NextResponse.json({ ok: true });

  const name = str(b.name, 80);
  const business = str(b.business, 100);
  const phone = str(b.phone, 20);
  const email = str(b.email, 120);
  if (name.length < 2 || business.length < 2 || phone.replace(/\D/g, "").length < 9) {
    return NextResponse.json({ error: "Revisa tu nombre, el del local y el teléfono." }, { status: 400 });
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "El email no parece correcto." }, { status: 400 });
  }

  const { error } = await createPublicClient().rpc("create_lead", {
    p_name: name,
    p_business: business,
    p_business_type: str(b.business_type, 40),
    p_town: str(b.town, 60),
    p_phone: phone,
    p_email: email,
    p_message: str(b.message, 1000),
    p_source: str(b.source, 40),
  });
  if (error) {
    console.error("[lead] no se pudo guardar:", error.message);
    return NextResponse.json({ error: "No se pudo enviar. Inténtalo de nuevo en un momento." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
