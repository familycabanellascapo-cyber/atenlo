---
title: "Cómo monté un agente de IA que responde WhatsApp para un restaurante"
date: "2026-09-20"
excerpt: "Reservas, horarios y preguntas repetidas, contestadas solas las 24 horas con un agente de IA en WhatsApp Business. Esto fue lo que tardó, cómo funciona por dentro y lo que ahorra de verdad."
category: "Caso real"
---

Este es uno de varios casos reales que voy documentando en sectores distintos — este
es de hostelería, pero la misma arquitectura (agente de IA + WhatsApp Business + una
fuente de datos que consultar) sirve igual para una clínica que gestiona citas, una
inmobiliaria que recibe consultas de pisos o cualquier negocio que reciba muchos
mensajes repetidos por WhatsApp.

**[Nota: sustituye los datos entre corchetes por los de un cliente real, anonimizado
si prefieres (por ejemplo "un restaurante de 40 mesas"). Los casos con números
concretos son los que mejor posicionan y los que nadie más puede copiar, porque son
tuyos.]**

## El problema

[Nombre o descripción del negocio] recibía de media [X] mensajes de WhatsApp al día
preguntando por horarios, disponibilidad de mesa y el menú del día. Alguien del
personal tenía que dejar lo que estaba haciendo para contestar, muchas veces en plena
hora de servicio — el peor momento posible para que alguien se pare a escribir un
mensaje.

Es un patrón que se repite en casi cualquier negocio con atención al cliente por
WhatsApp: la mayoría de mensajes que entran son variaciones de las mismas 4 o 5
preguntas, pero como llegan mezclados con consultas de verdad importantes, alguien
tiene que leerlos todos igual.

## Qué construí

Un agente de IA conectado a WhatsApp Business que:

1. Responde preguntas frecuentes (horario, ubicación, si hay terraza, alérgenos)
2. Consulta la disponibilidad real de mesas antes de confirmar una reserva
3. Escala a una persona solo cuando la petición es ambigua o especial

Herramientas usadas: **n8n** para el flujo principal, la API de WhatsApp Business, y
un modelo de lenguaje para interpretar la intención del mensaje antes de decidir qué
hacer.

### Cómo decide el agente qué hacer con cada mensaje

Esta es la parte que marca la diferencia entre un bot que frustra a los clientes y uno
que de verdad ayuda. El flujo no responde "lo primero que encaja" — sigue un orden:

1. **Interpreta la intención del mensaje** con un modelo de lenguaje: ¿es una pregunta
   frecuente, una petición de reserva, o algo fuera de patrón?
2. **Si es una pregunta frecuente**, responde directamente con la información ya
   preparada (horarios, ubicación, alérgenos, etc.)
3. **Si es una reserva**, consulta la disponibilidad real antes de confirmar nada — el
   agente nunca "promete" una mesa que no existe
4. **Si el mensaje es ambiguo, delicado o no encaja en ningún patrón conocido**, lo
   escala directamente a una persona, con el contexto de la conversación ya resumido

Ese último paso es el más importante y el que más se pasa por alto al montar algo así:
un agente que intenta responder a toda costa, incluso cuando no está seguro, es lo que
genera las quejas. Uno que sabe cuándo callarse y pasarle el turno a una persona es el
que de verdad funciona en producción.

### Cómo se estructura el flujo, paso a paso

Para quien quiera entender cómo es esto por dentro, el flujo en n8n sigue esta forma
general (independientemente de si lo montas con n8n o con Make):

1. **Disparador**: un mensaje nuevo entra por la API de WhatsApp Business
2. **Clasificación de intención**: el modelo de lenguaje analiza el mensaje y decide en
   qué categoría cae (pregunta frecuente, reserva, ambiguo/otro)
3. **Ramas condicionales**: el flujo se bifurca según esa clasificación — cada rama
   tiene su propia lógica
4. **Consulta de datos en tiempo real**: si es una reserva, se consulta el sistema de
   disponibilidad antes de responder nada
5. **Generación de la respuesta**: el modelo redacta una respuesta natural con los
   datos reales ya consultados, no una plantilla genérica
6. **Registro y escalado**: cada conversación queda registrada, y si el caso lo
   requiere, se notifica a una persona con el contexto ya resumido

Ninguno de estos pasos es exclusivo de un restaurante — es la misma estructura que
usaría para cualquier negocio que reciba mensajes repetidos y tenga un sistema de
datos que consultar.

## Cuánto tardó

De la primera reunión al primer flujo funcionando en producción: [X días/semanas].

## El resultado, con números

- Mensajes gestionados sin intervención humana: [X]% del total
- Tiempo de personal liberado a la semana: [X] horas
- Ahorro estimado al mes: [X] € (puedes calcularlo con la
  [calculadora de ahorro](/herramientas/ahorro-automatizacion))

## Lo que falló a la primera

[Cuenta aquí algo que no funcionó bien al principio — por ejemplo, el agente
confirmaba reservas sin comprobar el aforo real, o no entendía bien preguntas escritas
en un idioma o dialecto local concreto. La honestidad aquí es lo que diferencia esta
entrada de cualquier guía genérica de n8n.]

## Por qué esta arquitectura sirve para más que un restaurante

El patrón de fondo — agente de IA que interpreta la intención, consulta datos reales
antes de confirmar nada, y escala a una persona cuando no está seguro — no tiene nada
de específico de hostelería. Se traduce directamente a:

- **Una clínica o consulta**: el agente confirma citas y consulta la agenda real antes
  de dar un hueco, en vez de prometer un horario que ya está ocupado
- **Una inmobiliaria**: responde preguntas sobre un piso concreto (precio, metros,
  disponibilidad de visita) y escala cuando el interesado quiere negociar condiciones
- **Un ecommerce**: responde sobre el estado de un pedido consultando el sistema real,
  en vez de dar una respuesta genérica que podría no ser cierta
- **Cualquier negocio de servicios**: cualifica la consulta antes de pasarla a una
  persona, para que quien atienda ya sepa de qué va antes de escribir

## Qué necesitas para montar algo similar en tu negocio

- Un canal de mensajería con API disponible (WhatsApp Business es el más habitual)
- Una fuente de datos que el agente pueda consultar en tiempo real (un calendario, un
  sistema de reservas, un inventario) — sin esto, el agente solo puede responder
  preguntas genéricas, no confirmar nada de forma fiable
- Una lista clara de qué preguntas se repiten más, para priorizar qué automatizar
  primero — puedes usar el criterio de
  [¿vale la pena automatizar tu negocio?](/blog/vale-la-pena-automatizar-mi-negocio)
  para decidirlo
- Un criterio explícito de cuándo el agente debe escalar a una persona, en vez de
  intentar responder a toda costa

## Qué pasa cuando el negocio crece

Un flujo bien diseñado desde el principio escala sin rediseñarlo entero. Si el volumen
de mensajes se multiplica, lo que suele cambiar no es la lógica del agente, sino:

- **El alojamiento**: si el volumen crece mucho, puede compensar pasar de una
  herramienta en la nube que cobra por ejecución a una instancia self-hosted — el
  mismo criterio que explico en
  [n8n vs Make: cuándo uso cada uno](/blog/n8n-vs-make-cuando-elegir-cada-uno)
- **Los casos límite que escalan a una persona**: cuantos más mensajes gestiona el
  agente, más patrones nuevos aparecen — conviene revisar de vez en cuando qué se está
  escalando y por qué, para ir ampliando lo que el agente puede resolver solo
- **La fuente de datos**: si el negocio empieza a gestionar varias ubicaciones o
  canales a la vez, la consulta de disponibilidad tiene que reflejar eso

## Qué no puede hacer (todavía) este tipo de agente

Para no vender esto como magia: un agente de IA conectado a WhatsApp no debería
tomar decisiones delicadas por su cuenta — negociar un precio especial, gestionar una
queja seria o improvisar una excepción a la política del negocio. El diseño correcto
no es "que el agente lo resuelva todo", sino que reconozca esos casos y los pase a una
persona con el contexto ya listo. Un agente que intenta cubrir el 100% de los casos
suele acabar generando más problemas de los que resuelve.

## Preguntas frecuentes sobre agentes de IA para WhatsApp

### ¿Cuánto cuesta montar un agente de IA para WhatsApp Business?

Depende del alcance, pero un flujo bien acotado (responder preguntas frecuentes y
consultar disponibilidad) suele costar mucho menos que mantener a una persona
respondiendo mensajes repetidos, y se amortiza en semanas si el volumen de mensajes es
alto.

### ¿Necesito tener ya la API de WhatsApp Business activada?

No necesariamente desde el principio — activarla es parte del proceso de montar el
flujo. Sí conviene tener claro qué número de WhatsApp vas a usar para el negocio.

### ¿El agente puede responder en varios idiomas?

Sí, un modelo de lenguaje puede interpretar y responder en varios idiomas sin
necesidad de flujos separados para cada uno, aunque conviene revisar cómo maneja
expresiones locales o dialectos concretos de tu zona.

### ¿Qué pasa si el cliente pregunta algo que el agente no sabe responder?

Ese es justo el caso que debe escalar a una persona. Un buen diseño no intenta que el
agente lo resuelva todo — define claramente en qué casos debe ceder el turno.

### ¿Esto sirve para un negocio que no sea un restaurante?

Sí — la arquitectura de fondo (interpretar intención, consultar datos reales, escalar
cuando hace falta) es la misma para cualquier negocio que reciba mensajes repetidos por
WhatsApp, como se explica más arriba.

Si quieres algo parecido montado para tu negocio, escríbeme desde
[contacto](/contacto).
