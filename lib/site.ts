// Datos generales de ATENLO. Cambia aquí lo marcado con TODO.
export const site = {
  name: "ATENLO",
  url: "https://atenlo.com",
  tagline: "Tu restaurante responde a cada cliente, en su idioma, a cualquier hora.",
  description:
    "Asistente para bares y restaurantes de Mallorca: responde horarios, carta, alérgenos y reservas en español, inglés y alemán, 24 horas, y te avisa cuando hace falta una persona.",
  // TODO: cámbialo por hola@atenlo.com cuando crees ese correo.
  email: "mikiarkanz@gmail.com",
  // TODO: tu número de WhatsApp en formato internacional sin "+" ni espacios (ej. 34600111222).
  // Mientras esté vacío, los botones abren un email.
  whatsapp: "",
  owner: {
    name: "Miquel Cabanellas Capó",
    nif: "49484431-T",
    address: "Calle Mayor, 21, Palma de Mallorca (Illes Balears)",
  },
};

export function whatsappLink(text: string) {
  if (!site.whatsapp) return `mailto:${site.email}?subject=${encodeURIComponent("Quiero probar ATENLO")}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
