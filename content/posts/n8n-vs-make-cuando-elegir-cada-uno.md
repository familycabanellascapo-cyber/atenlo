---
title: "n8n vs Make: cuándo uso cada uno"
date: "2026-09-17"
excerpt: "No es una guerra de herramientas. Es qué encaja mejor según el cliente y el tipo de flujo."
category: "Técnica"
---

Me preguntan a menudo cuál es "mejor" entre n8n y Make. La respuesta honesta es que
depende del cliente y del flujo, no de la herramienta en sí. Esto es lo que miro antes
de elegir una u otra.

## Cuándo uso n8n

- El cliente quiere los datos alojados en su propio servidor (por ejemplo, por RGPD o
  por política interna)
- El flujo es complejo, con muchas condiciones y necesito control total sobre la
  lógica
- Ya tengo una instancia self-hosted corriendo y añadir un flujo más no tiene coste
  extra

## Cuándo uso Make

- El cliente no quiere preocuparse de mantenimiento ni servidores
- El flujo se apoya mucho en integraciones ya preparadas (Make tiene un catálogo muy
  amplio) y prefiero no reinventar esa parte
- Necesito que alguien del equipo del cliente pueda entender el flujo de un vistazo —
  el editor visual de Make suele ser más legible para alguien no técnico

## Lo que no cambia según la herramienta

Antes de montar cualquier flujo, mapeo el proceso a mano: qué dispara la
automatización, qué pasos sigue una persona hoy, y dónde se pierde más tiempo. Si eso
no está claro, cambiar de herramienta no arregla nada — solo se automatiza el caos más
rápido.

**[Nota para ti, Miquel: añade aquí un ejemplo concreto de un flujo que hayas migrado
de una herramienta a otra, o un caso donde te equivocaste de herramienta al principio.
Es el tipo de detalle que un curso genérico no puede contar.]**
