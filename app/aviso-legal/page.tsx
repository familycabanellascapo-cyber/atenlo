import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Aviso legal" };

export default function AvisoLegal() {
  const o = site.owner;
  return (
    <LegalPage title="Aviso legal">
      <h2>Titular del sitio</h2>
      <p>
        En cumplimiento de la Ley 34/2002 (LSSI-CE): este sitio web ({site.url}) pertenece a {o.name}, con NIF {o.nif} y
        domicilio en {o.address}. Contacto: {site.email}.
      </p>
      <h2>Objeto</h2>
      <p>
        ATENLO ofrece a bares y restaurantes un asistente de atención al cliente que responde preguntas usando la
        información que facilita cada local.
      </p>
      <h2>Responsabilidad</h2>
      <p>
        La información de cada local (horarios, carta, precios, alérgenos, reservas) la facilita y aprueba el propio
        local, que es responsable de su exactitud. Las peticiones de reserva hechas a través del asistente no están
        confirmadas hasta que el local las confirma. Ante cualquier alergia o intolerancia, avisa siempre al personal.
      </p>
      <h2>Propiedad intelectual</h2>
      <p>Los textos, diseño y código de este sitio pertenecen a su titular salvo que se indique lo contrario.</p>
      <h2>Legislación aplicable</h2>
      <p>Se aplica la legislación española.</p>
    </LegalPage>
  );
}
