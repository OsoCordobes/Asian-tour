# Nos vemos en Macau

Un sitio web premium como regalo: una propuesta cinematográfica de un viaje de un
mes / mes y medio por Asia, con una sala de planeo colaborativa para cargar notas
y precios reales hasta el día del viaje.

Dos mitades:

1. **Experiencia cinematográfica scroll-driven** — preloader → hero con globo →
   el viaje trazándose sobre el mapa, destino por destino, con la paleta neón que
   pasa de cálida (sudeste asiático) a helada (norte) → el clímax de Año Nuevo en
   Phuket → el cierre.
2. **Sala de planeo colaborativa** — link secreto sin signup, identidad liviana
   (nombre + color), notas y precios atribuidos por persona, tally de presupuesto
   en EUR que se actualiza en vivo (Supabase realtime).

## Stack

React + Vite + TypeScript · Tailwind · GSAP ScrollTrigger + Lenis · Framer Motion
· Mapbox GL JS (mapa) + React Three Fiber (globo del hero) · Howler.js (audio) ·
Supabase (capa colaborativa + realtime).

## Arranque rápido

```bash
npm install
cp .env.example .env   # opcional — corre sin credenciales
npm run dev
```

Abrí `http://localhost:5173` → redirige a `/viaje/demo`. **Funciona sin
configurar nada:** sin token de Mapbox usa el mapa Static (SVG); sin Supabase la
sala de planeo persiste en `localStorage`.

## Tiers de render (mobile-first)

La experiencia detecta capacidades del device (no user-agent) y elige un tier:

- **Static** — SVG/canvas, cero WebGL. Base garantizada. Cubre `reduced-motion`,
  `saveData`, gama baja y la ausencia de token de Mapbox.
- **Lite** — Mapbox plano (mercator), sin terreno. Mobile capaz.
- **Premium** — Mapbox globo + terreno 3D + flyTo + globo R3F en el hero. Desktop.

Nunca hay dos contextos WebGL vivos a la vez.

## Configuración

| Variable | Para qué |
|---|---|
| `VITE_MAPBOX_TOKEN` | Mapa Mapbox (restringí el token por dominio). Sin él → mapa Static. |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Capa colaborativa + realtime. Sin ellas → localStorage. |

## Supabase

1. Aplicá `supabase/migrations/0001_init.sql` (tablas + RLS + RPC + realtime).
2. Corré `supabase/seed.sql` para crear el viaje y obtener el **slug secreto**.
3. El link del regalo es `/viaje/<slug>`.

Seguridad: la tabla `trips` está cerrada a `anon`; la única puerta es el RPC
`get_trip_by_slug` (`security definer`). El slug de alta entropía y el `trip_id`
(UUID) son los secretos. Las child tables nunca usan `using(true)`. El borrado es
soft. Es el modelo "confiado" para 2 personas: quien tiene el link, entra.

## Deploy

Vercel + Supabase. `vercel.json` ya tiene el rewrite SPA para `/viaje/:slug`.
Cargá las env vars en el dashboard y restringí el token de Mapbox al dominio.

## Assets

Los placeholders salen de Unsplash. Reemplazá por material propio respetando la
convención de nombres en `src/data/assets.ts` (`dest-<id>-hero`, etc.) y los clips
de `/public/media` y `/public/audio`.
