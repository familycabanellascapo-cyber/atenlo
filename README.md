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

## Conectar la base de datos (una sola vez)

1. Crea un proyecto en [supabase.com](https://supabase.com) (región Europa).
2. **SQL Editor** → pega y ejecuta `supabase/migrations/0001_init.sql`.
3. **Project Settings → API**: copia la URL, la `anon key` y la `service_role key` a
   `.env.local` (y a Vercel → Settings → Environment Variables).
4. **Authentication → URL Configuration**: Site URL `https://atenlo.com` y añade
   `http://localhost:3000/**` y `https://atenlo.com/**` a Redirect URLs.
5. **Authentication → Email Templates** → en "Invite user" y "Reset password", cambia el
   enlace por:
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/panel/password`
   (en "Reset password" usa `type=recovery`).
6. Hazte administrador: **Authentication → Users → Add user** con tu email y contraseña,
   copia su `id` y ejecuta en el SQL Editor:
   `insert into public.admins (user_id) values ('TU-ID');`
7. Entra en `/panel` → **Administración**.

Para los avisos de reserva por email: crea una cuenta en [resend.com](https://resend.com),
verifica el dominio atenlo.com y pon `RESEND_API_KEY`. Sin ella, el aviso solo queda en el
log del servidor (la reserva sí se guarda y se ve en el panel).

## Añadir un cliente nuevo

1. `/panel/admin` → **Nuevo restaurante**: nombre, dirección (`bar-juan`) y email del dueño.
   Al dueño le llega un email para crear su contraseña.
2. Rellena su ficha (carta, alérgenos, horario…) en **Editar ficha**. Usa
   `lib/clients/demo.ts` como ejemplo. Los alérgenos los confirma SIEMPRE el local.
3. Su chat queda en `atenlo.com/c/bar-juan`. El QR lo descarga él desde su panel.

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
- `lib/store.ts` — guardar conversaciones y reservas · `lib/notify.ts` — email de aviso
- `supabase/migrations/` — tablas y reglas de seguridad

## Pendiente

- [ ] Número de WhatsApp y correo hola@atenlo.com en `lib/site.ts`
- [ ] Cobro mensual (Stripe)
- [ ] WhatsApp e Instagram (más adelante)
