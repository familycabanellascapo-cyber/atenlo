---
title: "Cómo monté un agente de IA que responde WhatsApp para un restaurante"
date: "2026-09-16"
excerpt: "Reservas, horarios y preguntas repetidas, contestadas solas las 24 horas. Esto fue lo que tardó y lo que ahorra de verdad."
category: "Caso real"
---

**[Nota para ti, Miquel: esta entrada es una plantilla de caso real. Sustituye los
datos entre corchetes por los de un cliente real de Atenlo (anonimizado si prefieres,
por ejemplo "un restaurante de Palma de 40 mesas"). Los casos con números concretos
son los que mejor posicionan y los que nadie más puede copiar, porque son tuyos.]**

## El problema

[Nombre o descripción del negocio] recibía de media [X] mensajes de WhatsApp al día
preguntando por horarios, disponibilidad de mesa y el menú del día. Alguien del
personal tenía que dejar lo que estaba haciendo para contestar, muchas veces en plena
hora de servicio.

## Qué construí

Un agente de IA conectado a WhatsApp Business que:

1. Responde preguntas frecuentes (horario, ubicación, si hay terraza, alérgenos)
2. Consulta la disponibilidad real de mesas antes de confirmar una reserva
3. Escala a una persona solo cuando la petición es ambigua o especial

Herramientas usadas: **n8n** para el flujo principal, la API de WhatsApp Business, y
un modelo de lenguaje para interpretar la intención del mensaje antes de decidir qué
hacer.

## Cuánto tardó

De la primera reunión al primer flujo funcionando en producción: [X días/semanas].

## El resultado, con números

- Mensajes gestionados sin intervención humana: [X]% del total
- Tiempo de personal liberado a la semana: [X] horas
- Ahorro estimado al mes: [X] € (puedes calcularlo con la
  [calculadora de ahorro](/herramientas/ahorro-automatizacion))

## Lo que falló a la primera

[Cuenta aquí algo que no funcionó bien al principio — por ejemplo, el agente
confirmaba reservas sin comprobar el aforo real, o no entendía bien las preguntas en
mallorquín/catalán. La honestidad aquí es lo que diferencia esta entrada de cualquier
guía genérica de n8n.]
