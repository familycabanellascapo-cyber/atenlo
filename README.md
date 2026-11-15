# ATENLO

Asistente de atención al cliente para bares y restaurantes: responde horarios, carta,
alérgenos y reservas en español, inglés y alemán, y avisa al local cuando hace falta
una persona.

## Arrancar en tu ordenador

```bash
npm install
cp .env.example .env.local   # y pon tu OPENAI_API_KEY (opcional)
npm run dev
```

- Web comercial: http://localhost:3000
- Demo (restaurante ficticio): http://localhost:3000/demo
- Chat de un cliente: http://localhost:3000/c/<slug>

Sin `OPENAI_API_KEY` el chat funciona en **modo básico**: respuestas fijas a partir de
la ficha del local, sin coste. Con la clave, usa IA (solo con la información de la ficha).

## Añadir un cliente nuevo

1. Copia `lib/clients/demo.ts` como `lib/clients/<slug>.ts` y rellena su ficha
   (quita `demo: true`). Los alérgenos los aprueba SIEMPRE el local.
2. Regístralo en `lib/clients/index.ts`.
3. Su página queda en `atenlo.com/c/<slug>` → genera un QR con esa URL para las mesas,
   Google Maps e Instagram.

## Estructura

- `app/page.tsx` — web comercial
- `app/c/[slug]` — página de chat de cada local
- `app/api/chat` — API del chat (IA + modo básico + límite por IP)
- `lib/clients/` — fichas de los locales
- `lib/ai.ts` — instrucciones y llamada a OpenAI
- `lib/fallback.ts` — modo básico sin IA

## Pendiente (por fases)

- [ ] Rellenar los TODO de `lib/site.ts` (WhatsApp, correo, datos del titular)
- [ ] Supabase: fichas y conversaciones en base de datos
- [ ] Aviso al local por email/WhatsApp cuando llega una petición de reserva
- [ ] Panel con contraseña para que el local edite su ficha y vea conversaciones
- [ ] WhatsApp e Instagram (requiere verificación de Meta)
