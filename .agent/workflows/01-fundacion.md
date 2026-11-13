---
description: Fase 1 — Fundación del workspace (resenias-dashboard/, resenias-app/, contratos compartidos, tokens de diseño)
---

# /01-fundacion

Objetivo: dejar ambos proyectos creados, corriendo y con la misma base visual. **No** implementes formulario ni API todavía.

1. Lee `AGENTS.md`, `docs/SPEC.md`, `docs/DISENO.md` y `contracts/`. Resume en 5 líneas lo que entendiste y lista cualquier `TODO(usuario)` pendiente
   (lista de carreras completa, cuatrimestres). Pregunta lo que falte antes de continuar.
2. `git init` (si no existe) y crea `.gitignore` (node_modules, `.env*` excepto `.env.example`, `.expo`, `dist`, `.vercel`, `.astro`).
3. Crea `scripts/sync-contracts.mjs`: copia `contracts/{schema,carreras,pregunta}.ts` a `resenias-dashboard/src/shared/` y `resenias-app/src/shared/`. Ejecútalo.
4. Crea `resenias-dashboard/` (Astro + React + Tailwind + adaptador Vercel, `output: 'server'`). Usa el skill `astro-vercel-turso` (pasos 1 y 2 solamente).
5. Crea `resenias-app/` (Expo + Expo Router + NativeWind). Usa el skill `expo-offline-sqlite` (paso 1 solamente).
6. Aplica el skill `diseno-blueprint`: define tokens, fuentes y los componentes base (`Pantalla`, `Tarjeta`, `Boton`, `Campo`, `EncabezadoSeccion`, `Chip`)
   en **ambos** proyectos, y una pantalla de prueba en cada uno que muestre la paleta, tipografías y componentes.
7. Verifica: `npm run build` en `resenias-dashboard/`; `npx expo start` arranca en `resenias-app/` sin errores de bundler; `npx tsc --noEmit` en ambos.
8. Commit: `chore: fundación del workspace`.

Termina con: qué quedó, cómo ver cada pantalla de prueba, y la **lista exacta de comandos** para correrlas. Detente.
