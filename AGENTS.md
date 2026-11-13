# AGENTS.md — Recolector UPTlax (web Astro + app Expo)

Eres el equipo de desarrollo de una herramienta **académica** para recolectar respuestas abiertas de estudiantes de la UPTlax
(proyecto final de Minería de Textos, grupo 7C). Trabajas por **fases**; nunca avances a la siguiente sin que el usuario lo pida.

## Lee antes de actuar
1. `docs/SPEC.md` — qué se construye, alcance y criterios de aceptación.
2. `docs/DISENO.md` — sistema visual (web y app comparten estética).
3. `contracts/` — esquema Zod, catálogo de carreras, pregunta oficial y contrato de API. **Son la fuente de verdad.**
4. El skill que corresponda en `.agent/skills/` y el workflow de la fase en `.agent/workflows/`.

## Estructura del workspace
```
/                      ← carpeta abierta en Antigravity
├── AGENTS.md  docs/  contracts/  .agent/
├── resenias-dashboard/               ← proyecto Astro (SSR, Vercel): formulario, API, DB, admin, exportación
└── resenias-app/               ← proyecto Expo (React Native): captura offline con SQLite + sincronización
```
`resenias-dashboard/` y `resenias-app/` son proyectos independientes (cada uno con su `package.json`). Cada uno tiene una copia de `contracts/`
en `src/shared/` (`resenias-dashboard/src/shared`, `resenias-app/src/shared`). Sincroniza con `node scripts/sync-contracts.mjs` y no edites las copias a mano.

## Stack (fijo; no cambiar sin pedir permiso)
- **Web:** Astro 5 (modo `server`, adaptador `@astrojs/vercel`), islands de React, Tailwind CSS, React Hook Form + Zod
  (`@hookform/resolvers`), `@libsql/client` contra **Turso**, `exceljs` para .xlsx.
- **App:** Expo (SDK estable actual) + Expo Router, NativeWind, React Hook Form + Zod, `expo-sqlite`,
  `@react-native-community/netinfo`, `expo-crypto`, `expo-file-system`, `expo-sharing`.
- TypeScript estricto en ambos. Gestor de paquetes: `npm` (salvo que el usuario indique otro).
- **Costo cero:** solo planes gratuitos (Vercel Hobby, Turso Free, Expo Go / builds locales). Nada que pida tarjeta.
- Antes de instalar o configurar una librería, **consulta su documentación actual** (las versiones cambian rápido).
  Si NativeWind/Tailwind/Expo tienen requisitos de versión cruzados, sigue la guía oficial vigente.

## Reglas no negociables
1. **Pregunta oficial intacta.** Se usa `PREGUNTA_OFICIAL` de `contracts/pregunta.ts`. Sin ejemplos, sugerencias, placeholders
   que induzcan ideas ni preguntas adicionales.
2. **Privacidad.** No recolectar nombre, matrícula, teléfono, correo, IP, user-agent ni ID de dispositivo. No analytics ni cookies
   de terceros. Consentimiento visible **antes** de responder.
3. **Respuesta intacta.** Solo `trim()`. Nunca autocorregir, capitalizar ni reformular el texto del alumno.
4. **Idempotencia.** El `id` (UUID v4) nace en el cliente. El servidor hace upsert por `id`. La app marca `enviado` solo lo que el servidor confirmó.
5. **Folios R001…** se asignan **al exportar**, no en el cliente ni al guardar.
6. **Secretos** solo en variables de entorno; nunca en el repo ni en el bundle público más allá del `SYNC_TOKEN` de la app (que se captura en Ajustes, no se hardcodea).
7. **Sin pérdida de datos.** En la app nunca se borra un registro local al sincronizar; solo cambia su estado.
8. Todo el texto de interfaz en **español de México**, tono cercano y claro.

## Forma de trabajar
- Una fase por conversación. Empieza con un **plan corto**, implementa, **ejecuta y prueba** (build, lint, typecheck, pruebas con `curl`),
  y termina con un resumen: qué hiciste, cómo probarlo, qué falta, qué decisión necesitas del usuario.
- Commits pequeños y descriptivos (`feat:`, `fix:`, `chore:`), un commit por tarea lógica.
- Entrega **archivos completos** listos para usar, no fragmentos ni diffs sueltos.
- Si falta un dato (lista de carreras, URLs, tokens), **pregunta o deja `TODO(usuario)` visible**; no inventes.
- No agregues funciones fuera de `docs/SPEC.md`. Las ideas extra van en una lista "Sugerencias" al final del resumen.
- Accesibilidad mínima: contraste AA, objetivos táctiles ≥ 44 px, etiquetas en todos los campos, foco visible, `prefers-reduced-motion`.
