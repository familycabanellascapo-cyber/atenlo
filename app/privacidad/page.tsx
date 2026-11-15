import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Privacidad() {
  const o = site.owner;
  return (
    <LegalPage title="Política de privacidad">
      <h2>Quién trata tus datos</h2>
      <p>
        {o.name} (NIF {o.nif}), {o.address}. Contacto: {site.email}.
      </p>
      <h2>Si escribes en el chat de un local</h2>
      <ul>
        <li>
          <strong>Responsable:</strong> el local con el que hablas. ATENLO actúa como encargado del tratamiento por
          cuenta del local, según el contrato firmado con él.
        </li>
        <li>
          <strong>Qué datos:</strong> los mensajes que escribes y, si pides una reserva, los datos que facilites
          (nombre, día, hora, personas y contacto).
        </li>
        <li>
          <strong>Para qué:</strong> responder a tus preguntas y gestionar tu petición de reserva.
        </li>
        <li>
          <strong>Base legal:</strong> tu solicitud (medidas precontractuales) y el interés legítimo del local en
          atender a sus clientes.
        </li>
        <li>
          <strong>Proveedores:</strong> para generar las respuestas usamos un proveedor de inteligencia artificial
          (OpenAI) y un proveedor de alojamiento (Vercel), con las garantías del RGPD para transferencias
          internacionales. No usamos tus mensajes para publicidad.
        </li>
        <li>
          <strong>Conservación:</strong> el tiempo necesario para atender tu consulta y, como máximo, 12 meses.
        </li>
      </ul>
      <p>No escribas en el chat datos de salud, bancarios ni otros datos sensibles.</p>
      <h2>Si contactas con ATENLO</h2>
      <p>
        Si nos escribes por correo o WhatsApp, ATENLO es responsable de esos datos y los usa solo para responderte y,
        si contratas, para prestarte el servicio y facturar.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {site.email}.
        También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>
    </LegalPage>
  );
}
