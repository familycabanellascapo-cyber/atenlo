import type { Client } from "../types";

// Restaurante FICTICIO para enseñar la demo. No existe.
export const demo: Client = {
  slug: "demo",
  name: "Ca'n Demo",
  demo: true,
  kind: "Restaurante mediterráneo",
  languages: ["es", "en", "de"],
  accent: "#c2410c",
  welcome: {
    es: "¡Hola! Soy el asistente de Ca'n Demo. Pregúntame por horarios, la carta, alérgenos o cómo reservar.",
    en: "Hi! I'm Ca'n Demo's assistant. Ask me about opening hours, the menu, allergens or how to book.",
    de: "Hallo! Ich bin der Assistent von Ca'n Demo. Fragen Sie mich nach Öffnungszeiten, Speisekarte, Allergenen oder Reservierungen.",
  },
  contact: {
    address: "Carrer de l'Exemple 12, 07001 Palma (dirección ficticia)",
    phone: "+34 971 000 000",
  },
  hours: [
    { day: "Lunes", time: "Cerrado" },
    { day: "Martes a jueves", time: "13:00–16:00 y 19:30–23:00" },
    { day: "Viernes y sábado", time: "13:00–16:00 y 19:30–23:30" },
    { day: "Domingo", time: "13:00–16:30" },
  ],
  hoursI18n: {
    en: [
      { day: "Monday", time: "Closed" },
      { day: "Tuesday to Thursday", time: "13:00–16:00 and 19:30–23:00" },
      { day: "Friday and Saturday", time: "13:00–16:00 and 19:30–23:30" },
      { day: "Sunday", time: "13:00–16:30" },
    ],
    de: [
      { day: "Montag", time: "Geschlossen" },
      { day: "Dienstag bis Donnerstag", time: "13:00–16:00 und 19:30–23:00" },
      { day: "Freitag und Samstag", time: "13:00–16:00 und 19:30–23:30" },
      { day: "Sonntag", time: "13:00–16:30" },
    ],
  },
  menu: [
    {
      section: "Para compartir",
      dishes: [
        { name: "Pa amb oli con jamón", price: 9.5, allergens: ["gluten"] },
        { name: "Croquetas caseras de sobrasada", price: 8, allergens: ["gluten", "lacteos", "huevo"] },
        { name: "Calamares a la andaluza", price: 12, allergens: ["gluten", "moluscos"] },
        { name: "Tumbet", description: "Verduras de temporada al horno con tomate", price: 11, allergens: [], tags: ["vegano"] },
      ],
    },
    {
      section: "Principales",
      dishes: [
        { name: "Arroz brut", price: 18, allergens: ["apio", "crustaceos"] },
        { name: "Lubina a la mallorquina", price: 22, allergens: ["pescado", "apio"] },
        { name: "Frito mallorquín", price: 15, allergens: ["apio"] },
        { name: "Risotto de setas", price: 16, allergens: ["lacteos", "sulfitos"], tags: ["vegetariano"] },
      ],
    },
    {
      section: "Postres",
      dishes: [
        { name: "Ensaimada con helado", price: 7, allergens: ["gluten", "lacteos", "huevo"] },
        { name: "Gató de almendra", price: 6.5, allergens: ["frutos_secos", "huevo"] },
      ],
    },
  ],
  facts: [
    {
      topic: "Terraza",
      answer: "Sí, tenemos terraza con 10 mesas. No se puede reservar la terraza en concreto.",
      keywords: ["terraza", "fuera", "exterior", "terrace", "outside", "terrasse", "draussen"],
      i18n: {
        en: "Yes, we have a terrace with 10 tables. Terrace tables can't be booked specifically.",
        de: "Ja, wir haben eine Terrasse mit 10 Tischen. Terrassenplätze können nicht gezielt reserviert werden.",
      },
    },
    {
      topic: "Perros / mascotas",
      answer: "Los perros son bienvenidos en la terraza; dentro solo perros de asistencia.",
      keywords: ["perro", "mascota", "dog", "pet", "hund", "haustier"],
      i18n: {
        en: "Dogs are welcome on the terrace; inside only assistance dogs.",
        de: "Hunde sind auf der Terrasse willkommen; drinnen nur Assistenzhunde.",
      },
    },
    {
      topic: "Parking",
      answer: "No tenemos parking propio. Hay un parking público a 3 minutos andando.",
      keywords: ["parking", "aparcar", "coche", "park", "car", "parkplatz", "auto"],
      i18n: {
        en: "We don't have our own car park. There's a public car park a 3-minute walk away.",
        de: "Wir haben keinen eigenen Parkplatz. Ein öffentliches Parkhaus ist 3 Gehminuten entfernt.",
      },
    },
    {
      topic: "Formas de pago",
      answer: "Aceptamos efectivo, tarjeta y pago con móvil.",
      keywords: ["pago", "pagar", "tarjeta", "efectivo", "pay", "card", "cash", "zahlen", "bezahlen", "kreditkarte", "bargeld"],
      i18n: {
        en: "We accept cash, card and mobile payment.",
        de: "Wir akzeptieren Bargeld, Karte und mobiles Bezahlen.",
      },
    },
    {
      topic: "Menú infantil",
      answer: "Sí, tenemos menú infantil por 10 €.",
      keywords: ["niño", "nino", "infantil", "kids", "child", "children", "kinder"],
      i18n: { en: "Yes, we have a kids' menu for €10.", de: "Ja, wir haben ein Kindermenü für 10 €." },
    },
    {
      topic: "Accesibilidad",
      answer: "El local está adaptado para silla de ruedas y tiene baño adaptado.",
      keywords: ["silla de ruedas", "accesib", "wheelchair", "accessib", "rollstuhl", "barrierefrei"],
      i18n: {
        en: "The restaurant is wheelchair accessible and has an accessible toilet.",
        de: "Das Restaurant ist rollstuhlgerecht und hat eine barrierefreie Toilette.",
      },
    },
    {
      topic: "Wifi",
      answer: "Sí, wifi gratis para clientes. Pide la clave al personal.",
      keywords: ["wifi", "wi-fi", "internet", "wlan"],
      i18n: {
        en: "Yes, free wifi for guests. Ask the staff for the password.",
        de: "Ja, kostenloses WLAN für Gäste. Fragen Sie das Personal nach dem Passwort.",
      },
    },
    {
      topic: "Grupos y eventos",
      answer: "Aceptamos grupos de hasta 30 personas con menú cerrado. Contacta con al menos 48 h de antelación.",
      keywords: ["grupo", "evento", "cumpleaños", "group", "event", "birthday", "gruppe", "feier", "geburtstag"],
      i18n: {
        en: "We take groups of up to 30 people with a set menu. Please contact us at least 48 hours in advance.",
        de: "Wir nehmen Gruppen bis 30 Personen mit festem Menü. Bitte mindestens 48 Stunden vorher Bescheid geben.",
      },
    },
  ],
  reservations: {
    accepted: true,
    how: "Por teléfono (+34 971 000 000) o dejando aquí tu nombre, día, hora y número de personas; el restaurante te confirmará.",
  },
  handoff: { name: "el equipo de Ca'n Demo", channel: "teléfono +34 971 000 000" },
};
