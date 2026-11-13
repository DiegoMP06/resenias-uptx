---
name: astro-vercel-turso
description: Construye y despliega la parte web y API del proyecto con Astro (SSR) en Vercel y una base Turso (libSQL) usando Drizzle ORM, con exportación CSV/XLSX y panel admin protegido por token. Úsalo para tareas en la carpeta web/.
---

# Skill: Astro + Vercel + Turso

## Cuándo usarlo
Al crear `web/`, la base de datos, los endpoints de `contracts/API.md`, el panel `/admin`, la exportación o el despliegue.

## Pasos
1. **Proyecto:** crea Astro (plantilla mínima, TypeScript estricto). Agrega `@astrojs/react`, `@astrojs/vercel`, Tailwind (integración oficial vigente),
   `react-hook-form`, `zod`, `@hookform/resolvers`, `@libsql/client`, `drizzle-orm`, `drizzle-kit` (dev), `exceljs`, `lucide-react`, `@fontsource/*`.
   En `astro.config.mjs`: `output: 'server'` y adaptador de Vercel. Confirma en la documentación vigente la sintaxis para tu versión de Astro.
2. **Base de datos con Drizzle:**
   - `src/db/schema.ts`: tabla `respuestas` con `sqliteTable` (`drizzle-orm/sqlite-core`), columnas, `primaryKey` en `id` e índices en `hash`, `carrera` y `creado_en`, exactamente como `contracts/API.md`.
   - `src/lib/db.ts`: `createClient` de `@libsql/client` con `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`, envuelto con `drizzle(client, { schema })` de `drizzle-orm/libsql`.
   - `drizzle.config.ts` con dialecto `turso` y las credenciales desde variables de entorno. Scripts en `package.json`: `db:generate` (`drizzle-kit generate`) y `db:migrate` (`drizzle-kit migrate`).
     Confirma en la documentación vigente de Drizzle la sintaxis para tu versión. Commitea la carpeta de migraciones generada.
3. **Inserción idempotente:** `db.insert(respuestas).values(...).onConflictDoNothing({ target: respuestas.id })`. Calcula `hash` (SHA-256 de `normalizarParaHash(respuesta)`) en el servidor con `crypto`;
   si ya existe otro `id` con el mismo `hash`, guarda con `posible_duplicado=1`. Calcula `posible_pii` con `detectarPosiblePii`. **No modifiques el texto.**
4. **Endpoints** (`src/pages/api/*.ts`, `export const prerender = false`): valida con los esquemas de `src/shared/schema.ts`; respuestas JSON con códigos de `contracts/API.md`.
   Auth por `Authorization: Bearer`, comparación en tiempo constante (`crypto.timingSafeEqual`). Limita el tamaño del body (≈ 300 KB para lotes).
   Rate limit sencillo en `/api/respuestas` (ventana en memoria por instancia es aceptable; documenta la limitación). No guardes ni registres IP.
5. **Exportación:** consulta ordenada por `creado_en`, asigna folio `R001…` en el código, excluye duplicados por defecto.
   CSV con BOM UTF-8 y escape correcto de comillas y saltos de línea; XLSX con `exceljs` (`wrapText` en la columna de respuesta, encabezado en negritas).
   Verifica con datos que tengan acentos, ñ, comas, comillas y saltos de línea.
6. **Admin (`/admin`):** pide el token (guárdalo solo en `sessionStorage`), llama `/api/resumen` y descarga con `fetch` + `Blob` (el token **no** va en la URL).
   Aplica `noindex` y `Cache-Control: no-store`.
7. **Despliegue:** `.env.example` con las variables; instrucciones para `vercel` (importar repo, definir variables en el panel, `npm run build` ok).
   Después de desplegar prueba con `curl` los endpoints contra la URL pública.

## Verificaciones
- Enviar el mismo `id` dos veces → una sola fila.
- Exportar sin token → `401`. Con token → archivo que abre en Excel con acentos correctos.
- `astro check` y `npm run build` sin errores; `npm run db:generate` no produce cambios pendientes (el esquema Drizzle coincide con `contracts/API.md`).
- La web no hace peticiones a dominios de terceros (revisa la pestaña Network).

## Salida esperada
Código completo en `web/`, `README` breve con comandos (`dev`, `migrate`, `build`), `.env.example`, y lista de pasos para Turso/Vercel.
