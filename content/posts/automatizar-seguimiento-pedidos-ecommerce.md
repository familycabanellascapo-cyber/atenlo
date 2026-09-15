---
title: "Cómo automatizo el seguimiento de pedidos de un ecommerce con IA"
date: "2026-09-14"
excerpt: "Estado del pedido, devoluciones y preguntas repetidas, contestadas solas por WhatsApp o email. Ejemplo completo de cómo estructuro este flujo y lo que suele ahorrar."
category: "Ejemplo"
---

Este es un ejemplo ilustrativo de cómo estructuro este tipo de flujo — no es un
cliente concreto, sino las cifras y decisiones típicas que suelo encontrarme al
automatizar el seguimiento de pedidos en una tienda online. En cuanto documente un
caso real con un negocio concreto, lo publicaré aparte con sus propios números. La
arquitectura de fondo sirve igual para una tienda en Shopify, una en WooCommerce o
cualquier ecommerce con un sistema de pedidos que consultar.

## El problema

Una tienda online de tamaño medio, con unos 60-80 pedidos diarios, recibía de media
unos 25 mensajes al día por WhatsApp y email preguntando "¿dónde está mi pedido?",
"¿cuándo llega?" o "quiero devolver esto". Alguien del equipo tenía que abrir el
sistema de pedidos, buscar el número, y contestar manualmente cada vez — un proceso
que se repite casi idéntico en la mayoría de los mensajes.

Es un patrón muy habitual en ecommerce: la mayoría de las preguntas de "atención al
cliente" no son realmente problemas, son peticiones de información que ya existe en
algún sistema, solo que nadie la tiene a mano en el momento en que el cliente
pregunta.

## Qué construí

Un flujo conectado a WhatsApp Business y al email de atención al cliente que:

1. Interpreta la intención del mensaje (estado de pedido, devolución, pregunta
   general, queja)
2. Si es sobre un pedido, pide el número de pedido o el email de compra si no lo ha
   dado ya
3. Consulta el sistema de pedidos en tiempo real y responde con el estado actual
4. Si es una devolución, explica el proceso y genera la etiqueta si el pedido cumple
   las condiciones
5. Escala a una persona si es una queja, un caso ambiguo, o un pedido con una
   incidencia real (paquete perdido, producto dañado)

Herramientas usadas: **n8n** conectado a la API del sistema de pedidos (el mismo
patrón funciona con Shopify, WooCommerce o un sistema propio), WhatsApp Business, y un
modelo de lenguaje para interpretar la intención antes de decidir qué hacer.

### Cómo decide el flujo qué hacer con cada mensaje

No todos los mensajes de "¿dónde está mi pedido?" son iguales, y tratarlos igual es
un error habitual. El flujo distingue:

1. **Consulta simple de estado**: el pedido va según lo previsto — se responde
   directamente con el estado y la fecha estimada
2. **Pedido con retraso real**: si el sistema muestra que el envío lleva más tiempo
   del normal, el flujo lo marca como caso a revisar en vez de dar una fecha que
   probablemente ya no es correcta
3. **Devolución dentro de plazo**: se gestiona automáticamente según la política de la
   tienda
4. **Queja o incidencia**: paquete dañado, pedido incorrecto, o cualquier caso que no
   encaja en los anteriores — se escala directamente, con el historial del pedido ya
   resumido para quien lo atienda

Esa distinción entre "pedido va bien" y "pedido con problema" es la parte que marca la
diferencia. Responder automáticamente a un pedido con una incidencia real, como si
todo fuera normal, es lo que genera las quejas más serias.

### Cómo se estructura el flujo, paso a paso

Por dentro, el flujo sigue esta forma general:

1. **Disparador**: llega un mensaje nuevo por WhatsApp o email
2. **Identificación del pedido**: si el cliente no ha dado el número de pedido, el
   flujo lo pide antes de continuar (o lo busca por email de compra si lo tiene)
3. **Clasificación de intención**: el modelo de lenguaje decide si es consulta de
   estado, devolución, pregunta general o incidencia
4. **Consulta al sistema de pedidos**: se obtiene el estado real, la fecha estimada y
   si hay alguna alerta de retraso
5. **Comparación de fechas**: se compara la fecha estimada con la fecha actual para
   distinguir "todo normal" de "posible incidencia"
6. **Respuesta o escalado**: si todo encaja en el patrón esperado, responde
   directamente; si no, escala con el contexto ya resumido

El paso 5 es el que menos se suele tener en cuenta al montar algo así, y es
precisamente el que evita el tipo de fallo que cuento más abajo.

## Qué pasa cuando el volumen de pedidos crece

Un flujo bien diseñado no necesita rediseñarse entero cuando la tienda crece, pero sí
conviene revisar algunas cosas:

- **El volumen de llamadas a la API del sistema de pedidos**: si crece mucho, puede
  hacer falta cachear cierta información para no saturar el sistema
- **Los casos que se están escalando**: con más pedidos aparecen más variaciones de
  incidencias — conviene revisar periódicamente si alguna se puede automatizar también
- **Los picos estacionales**: en fechas de mucho volumen (rebajas, campañas), el
  patrón de mensajes puede cambiar, y conviene revisar que el flujo sigue clasificando
  bien

## Comparativa: qué se automatiza y qué no

| Tipo de consulta | ¿Se automatiza? | Por qué |
|---|---|---|
| "¿Dónde está mi pedido?" (va bien) | Sí, del todo | Dato disponible en el sistema, sin ambigüedad |
| "¿Cuándo llega?" | Sí, del todo | Misma lógica que el estado del pedido |
| Devolución dentro de plazo y condiciones | Sí, del todo | Proceso con reglas claras y siempre iguales |
| Pedido con retraso fuera de lo normal | Parcial | El sistema avisa, pero una persona decide qué comunicar |
| Producto dañado o incorrecto | No | Requiere valorar el caso y decidir una solución |
| Queja o reclamación seria | No | Necesita trato humano y criterio |

## Cuánto tardó

De la primera reunión al flujo funcionando en producción: unas dos semanas, incluyendo
la conexión con el sistema de pedidos y las pruebas con casos reales variados.

## El resultado, con números

- Mensajes gestionados sin intervención humana: alrededor del 70% del total
- Tiempo de personal liberado a la semana: unas 7 horas
- Ahorro estimado al mes: unos 420 € (puedes calcularlo con tus propios números en la
  [calculadora de ahorro](/herramientas/ahorro-automatizacion))

## Lo que falló a la primera

Al principio, el flujo consultaba el estado del pedido pero no distinguía bien entre
"en tránsito, todo normal" y "en tránsito, pero ya lleva más días de los previstos" —
daba la misma respuesta tranquilizadora en los dos casos, lo que generaba más quejas,
no menos, cuando el pedido de verdad se había retrasado. Se corrigió añadiendo una
comparación entre la fecha estimada y la fecha actual antes de decidir si el caso
podía responderse solo o debía avisar a una persona.

## Por qué esta arquitectura sirve para más que un ecommerce

El patrón — consultar un sistema real, distinguir entre "todo va bien" y "hay una
incidencia", y escalar solo lo segundo — se aplica igual a:

- **Una empresa de logística o mensajería**: seguimiento de envíos con la misma
  lógica de "estado normal" vs "incidencia real"
- **Una clínica o consulta**: estado de un resultado o de una solicitud, en vez del
  estado de un pedido
- **Un servicio de suscripción (SaaS o similar)**: estado de una solicitud de soporte
  o de facturación
- **Una inmobiliaria**: estado de una gestión o trámite en curso

Tienes el mismo principio aplicado a otro canal y otro sector en
[el ejemplo del agente de IA para WhatsApp de un restaurante](/blog/agente-ia-whatsapp-restaurante).

## Qué necesitas para montar algo similar

- Acceso a la API o sistema donde vive el estado real de los pedidos (la mayoría de
  plataformas de ecommerce lo ofrecen)
- Un canal de contacto con API disponible (WhatsApp Business, email)
- Una política clara de devoluciones ya definida, para que el flujo pueda aplicarla
  sin ambigüedad
- Un criterio explícito de qué es "incidencia real" frente a "consulta normal", que es
  la decisión de diseño más importante de todas

## Qué no puede hacer (todavía) este tipo de flujo

No debería decidir por su cuenta cómo resolver una incidencia seria — ofrecer un
reembolso, decidir una compensación, o gestionar una queja pública en redes sociales.
El diseño correcto es que reconozca esos casos y los pase a una persona con el
contexto completo, no que intente resolverlo todo por su cuenta.

## Cómo sé si está funcionando bien

Además del porcentaje de mensajes resueltos sin intervención humana, reviso dos cosas
en concreto para este tipo de flujo:

- **Cuántas veces el flujo responde "todo va bien" en un pedido que luego resulta
  tener una incidencia real.** Si pasa más de alguna vez puntual, la comparación de
  fechas o el umbral de retraso necesita ajustarse.
- **Cuántas devoluciones se gestionan solas frente a las que se escalan.** Si se
  escalan casi todas, probablemente las condiciones automáticas están definidas de
  forma demasiado estricta y se puede ampliar lo que el flujo resuelve solo.

## Con qué sistemas suele conectarse este tipo de flujo

No hace falta una plataforma concreta para montar algo así — lo importante es que el
sistema de pedidos tenga alguna forma de consultar datos en tiempo real (una API, o al
menos exportar el estado de forma accesible). Esto incluye plataformas de ecommerce
habituales, sistemas de gestión de pedidos propios, o incluso una hoja de cálculo bien
estructurada si el negocio todavía no usa nada más sofisticado — aunque en ese último
caso, conviene valorar si no ha llegado el momento de dar el salto a un sistema con
API real.

## Preguntas frecuentes sobre automatizar el seguimiento de pedidos

### ¿Se puede automatizar el estado de pedidos en Shopify o WooCommerce?

Sí, ambas plataformas exponen los datos del pedido mediante API, así que un flujo
puede consultar el estado real y responder con esa información sin intervención
humana en la mayoría de los casos.

### ¿Cuánto cuesta automatizar el seguimiento de pedidos de una tienda online?

Depende del volumen de pedidos y de si el sistema ya tiene API disponible, pero suele
ser un flujo de complejidad media — tienes rangos orientativos completos en
[¿cuánto cuesta automatizar un negocio?](/blog/cuanto-cuesta-automatizar-un-negocio).

### ¿El bot puede gestionar devoluciones automáticamente?

Sí, cuando la devolución cumple las condiciones definidas de antemano (plazo, estado
del producto). Los casos que no encajan claramente en esas condiciones deberían
escalar a una persona, no forzarse a encajar en una regla automática.

### ¿Qué pasa si el pedido tiene un problema real, como llegar dañado?

Ese es justo el tipo de caso que el flujo debe reconocer y escalar, no intentar
resolver solo. El sistema puede recoger la información inicial (fotos, descripción
del problema) para que la persona que lo atienda ya tenga el contexto listo.

### ¿Esto sirve para negocios que no sean ecommerce?

Sí — cualquier negocio donde los clientes pregunten por el estado de algo que ya
existe en un sistema (un pedido, una cita, una solicitud) puede aplicar la misma
lógica, como se explica más arriba.

### ¿Qué herramienta se usa para este tipo de flujo?

Yo suelo usar n8n cuando hace falta conectar varios sistemas con lógica algo compleja,
pero Make también sirve para casos más simples — tienes el criterio completo en
[n8n vs Make: cuándo uso cada uno](/blog/n8n-vs-make-cuando-elegir-cada-uno).

## Si quieres algo parecido para tu negocio

Escríbeme desde [contacto](/contacto) contándome cómo gestionas ahora mismo las
preguntas de seguimiento de pedidos o solicitudes, y te digo si tiene sentido
automatizarlo y por dónde empezaría.
