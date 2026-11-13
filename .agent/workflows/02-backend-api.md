---
description: Fase 2 — Base de datos Turso y API (respuestas, sincronizar, resumen, exportar)
---

# /02-backend-api

Objetivo: backend completo y probado con `curl`, sin UI todavía. Trabaja en `web/`.

1. Lee `contracts/API.md` y el skill `astro-vercel-turso` (pasos 2–5).
2. **Agrega Drizzle ORM** (`drizzle-orm`, y `drizzle-kit` como dependencia de desarrollo) y crea `src/db/schema.ts`, `src/lib/db.ts`, `drizzle.config.ts`
   y los scripts `db:generate` / `db:migrate`, siguiendo el paso 2 del skill `astro-vercel-turso`. Crea también `.env.example`
   (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SYNC_TOKEN`, `ADMIN_TOKEN`).
   Indica al usuario cómo crear la base en Turso (CLI o panel) y pedirle que llene `.env`. **No inventes credenciales.** Genera y aplica la migración inicial.
3. Con Drizzle (sin SQL suelto), implementa `POST /api/respuestas`, `POST /api/sincronizar`, `GET /api/resumen`, `GET /api/exportar` según el contrato
   (hash, duplicados, PII marcada, upsert idempotente, folio al exportar, CSV con BOM y XLSX).
4. Escribe `scripts/prueba-api.mjs` que: valida casos de error (TI sin TSU, texto corto, token malo), inserta 120 registros por lotes de 50,
   repite el envío (sin duplicados), y descarga el CSV y el XLSX comprobando el BOM, el folio `R001` y los acentos.
5. Ejecuta el skill `api-sincronizacion` (auditoría, puntos 3 y 4) y corrige lo necesario.
6. Verifica: `astro check`, `npm run build`, y que `prueba-api` pase al 100 %.
7. Commit: `feat(web): API y base de datos`.

Termina con la tabla de endpoints probados (✅/❌) y los comandos para repetir las pruebas. Detente.
