# Automatizando en Mallorca

Base del blog en Next.js (App Router + TypeScript + Tailwind). Sin base de datos:
los artículos son archivos Markdown en `content/posts/`, así que puedes escribir uno
nuevo, hacer commit y publicarlo sin tocar código.

## Poner en marcha en tu ordenador

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — cambios en el código o en los artículos se recargan
solos.

Nota: este proyecto se ha escrito a mano en un entorno sin conexión a internet, así
que **no se ha podido ejecutar `npm install` ni `npm run build` para comprobarlo**.
El código sigue las convenciones estándar de Next.js 14 (App Router), pero corre
`npm run build` en tu máquina antes de darlo por bueno, y avísame si algo chirría —
lo repasamos juntos.

## Añadir un artículo nuevo

1. Crea un archivo `.md` dentro de `content/posts/`, por ejemplo
   `content/posts/mi-nuevo-flujo.md`.
2. Cabecera obligatoria arriba del todo:

   ```markdown
   ---
   title: "Título del artículo"
   date: "2026-09-20"
   excerpt: "Una frase de resumen para la lista del blog."
   category: "Caso real"
   ---

   El contenido en markdown normal empieza aquí.
   ```
3. Guarda, haz commit y push. Aparece solo en `/` y en `/blog`, ordenado por fecha.

Ya tienes 3 artículos de ejemplo en `content/posts/` con notas entre corchetes
señalando dónde meter tus datos reales (clientes, números, anécdotas). Sustitúyelos
o bórralos cuando tengas contenido propio.

## Antes de publicar de verdad

- Cambia el correo de `/contacto` por el tuyo real.
- Rellena los datos reales en `/aviso-legal` y revisa `/politica-de-privacidad` y
  `/politica-de-cookies` — son plantillas de partida, no asesoría legal.
- Cambia `pub-0000000000000000` en `public/ads.txt` por tu ID real de AdSense cuando
  te aprueben la cuenta.
- Actualiza `url` en `lib/config.ts` con tu dominio final.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Primera versión del sitio"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(Crea antes el repositorio vacío en GitHub — sin README ni licencia, para no chocar
con este commit.)

## Desplegar en Vercel

1. Entra en vercel.com con tu cuenta de GitHub.
2. "Add New… → Project" y selecciona el repositorio que acabas de subir.
3. Vercel detecta Next.js solo — no hace falta tocar nada de configuración.
4. Deploy. En 1-2 minutos tienes una URL en `.vercel.app`.
5. Cuando compres el dominio, lo añades desde Project Settings → Domains.

Cada `git push` a `main` vuelve a desplegar solo. Así que el flujo del día a día es:
escribes un `.md` nuevo → commit → push → ya está publicado.

## Estructura

```
app/                    páginas (App Router)
  blog/[slug]/          plantilla de artículo
  herramientas/         la calculadora de ahorro
components/             Header, Footer, PostRow, la calculadora
content/posts/          tus artículos en Markdown
lib/posts.ts            lee y parsea los .md
lib/config.ts           nombre del sitio, nav, descripción
```
