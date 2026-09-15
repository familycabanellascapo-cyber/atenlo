import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
};

export default function AvisoLegal() {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-6">Aviso legal</h1>
      <div className="prose-log text-paper">
        <p className="text-amber">
          Plantilla de partida, no es asesoría legal. Rellena los datos reales y, si
          vas a monetizar el sitio, conviene que lo revise un gestor o asesoría antes
          de publicarlo.
        </p>
        <h2>Titular del sitio</h2>
        <ul>
          <li>Nombre / razón social: [tu nombre o el de tu autónomo]</li>
          <li>NIF: [tu NIF]</li>
          <li>Domicilio: [tu dirección o la de tu actividad]</li>
          <li>Correo de contacto: [tu correo]</li>
        </ul>
        <h2>Objeto</h2>
        <p>
          Este sitio web tiene una finalidad informativa y divulgativa sobre
          automatización de procesos con inteligencia artificial. El acceso y uso del
          sitio atribuye la condición de usuario e implica la aceptación de las
          condiciones aquí descritas.
        </p>
        <h2>Propiedad intelectual</h2>
        <p>
          Los contenidos publicados (textos, imágenes, código de los ejemplos) son
          propiedad del titular salvo que se indique lo contrario, y no pueden
          reproducirse sin autorización.
        </p>
        <h2>Publicidad</h2>
        <p>
          Este sitio puede mostrar anuncios de terceros (Google AdSense) y enlaces de
          afiliación. Esto se ampliará en la política de cookies conforme se activen
          esos servicios.
        </p>
      </div>
    </div>
  );
}
