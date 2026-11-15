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

## Base de datos (Supabase)

La web **no necesita ninguna clave en el hosting**: la dirección y la clave pública de
Supabase están en `lib/supabase/config.ts` (son públicas; la seguridad la ponen las
reglas de la base de datos). La clave secreta no se usa en la web.

Para montar la base de datos desde cero: Supabase → SQL Editor → ejecuta en orden
`supabase/migrations/0001_init.sql` y `0002_no_secret_key.sql`.

Para hacerte administrador: crea tu usuario en Authentication → Users y ejecuta
`insert into public.admins (user_id) values ('TU-ID');`

## Añadir un cliente nuevo

1. `/panel/admin` → **Nuevo restaurante**: nombre, dirección (`bar-juan`) y email del dueño.
2. Dile al dueño que entre en `atenlo.com/panel/login` con ese email y pulse
   "Enviarme un enlace para entrar". Al entrar queda unido a su restaurante.
3. Rellena su ficha (carta, alérgenos, horario…) en **Editar ficha**. Usa
   `lib/clients/demo.ts` como ejemplo. Los alérgenos los confirma SIEMPRE el local.
4. Su chat queda en `atenlo.com/c/bar-juan`. El QR lo descarga él desde su panel.

## Privacidad (cómo está organizado)

- Un solo dominio: cada local en `atenlo.com/c/<slug>`.
- Los clientes del restaurante no pueden leer nada de la base de datos: el chat guarda
  desde el servidor. Cada uno solo ve su propia conversación en su móvil.
- Cada dueño solo ve SU restaurante: lo imponen las reglas RLS de la base de datos.
  Pruébalo con `node scripts/test-rls.mjs`.
- Los administradores (tabla `admins`) ven todo.

## Estructura

- `app/page.tsx` — web comercial
- `app/c/[slug]` — chat de cada local (+ formulario de reserva)
- `app/api/chat`, `app/api/reservation` — APIs del chat y de reservas
- `app/panel` — panel del restaurante (inicio, reservas, conversaciones, información, QR)
- `app/panel/admin` — administración de ATENLO
- `lib/clients/` — demo (en código) y lectura de locales desde Supabase
- `lib/store.ts` — guardar conversaciones y reservas (funciones de la base de datos)
- `supabase/migrations/` — tablas y reglas de seguridad

## Pendiente

- [ ] Número de WhatsApp y correo hola@atenlo.com en `lib/site.ts`
- [ ] Aviso de reservas por email
- [ ] Cobro mensual (Stripe)
- [ ] WhatsApp e Instagram (más adelante)
