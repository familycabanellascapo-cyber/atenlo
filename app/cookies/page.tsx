import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Política de cookies" };

export default function Cookies() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        Este sitio no usa cookies de análisis, publicidad ni seguimiento. Solo podría usar elementos técnicos
        imprescindibles para que la web funcione, que no requieren consentimiento.
      </p>
      <p>Si en el futuro añadimos cookies de otro tipo, te pediremos permiso antes y actualizaremos esta página.</p>
    </LegalPage>
  );
}
