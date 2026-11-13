---
description: Fase 2b — Migrar el backend ya construido (SQL directo) a Drizzle ORM, sin perder datos ni cambiar el comportamiento
---

# /02b-migrar-a-drizzle

Úsalo **solo si ya ejecutaste `/02-backend-api` con SQL directo** y quieres Drizzle de aquí en adelante. Es un refactor: la API debe comportarse exactamente igual.
Trabaja en `web/`. **No toques `app/`, el formulario ni el diseño.**

1. Lee el estado actual: `src/lib/db.ts`, `scripts/migrate.mjs`, todos los endpoints de `src/pages/api/`, `contracts/API.md` y `scripts/prueba-api.mjs`.
   Antes de cambiar nada, ejecuta `node scripts/prueba-api.mjs` y guarda el resultado como línea base (debe estar en verde).
2. Instala `drizzle-orm` y, como dependencia de desarrollo, `drizzle-kit`. Consulta la documentación vigente de Drizzle para libSQL/Turso antes de configurar.
3. Crea `src/db/schema.ts` con la tabla `respuestas` (`sqliteTable`) **idéntica** a la que ya existe en Turso (mismas columnas, tipos, `NOT NULL`, defaults, clave primaria e índices
   de `hash`, `carrera`, `creado_en`). Crea `drizzle.config.ts` (dialecto `turso`, credenciales desde `.env`) y el script `db:push` (`drizzle-kit push`).
4. **No recrees ni borres la tabla:** ya tiene datos. Ejecuta `drizzle-kit push` en modo de comparación: debe reportar **"sin cambios"**.
   Si detecta diferencias, muéstramelas y **detente a preguntarme** antes de aplicar nada.
   (Para cambios futuros del esquema usa `db:push`; no generes una migración inicial `CREATE TABLE` porque chocaría con la tabla existente.)
5. Reescribe `src/lib/db.ts` con `drizzle(client, { schema })` sobre el `@libsql/client` actual y reemplaza las consultas de los endpoints por el query builder de Drizzle:
   `insert(...).onConflictDoNothing({ target: respuestas.id })`, `select`, `where`, `orderBy` y agregaciones con `count()`. Se permite la plantilla `sql` para casos puntuales.
   Mantén la lógica de hash, duplicados, PII y folio **sin cambios**.
6. Verifica que nada cambió: `node scripts/prueba-api.mjs` igual que la línea base, `astro check`, `npm run build`, y el skill `api-sincronizacion` (puntos 3 y 4).
   Descarga el CSV y el XLSX y confirma BOM, acentos y folio `R001`.
7. Si todo pasa, elimina `scripts/migrate.mjs` y los usos del SQL suelto que ya no se necesiten. Commit: `refactor(web): migrar acceso a datos a Drizzle`.

Termina con: qué archivos cambiaron, resultado de pruebas antes/después y confirmación de que `drizzle-kit push` no detecta cambios. Detente (la siguiente fase es `/03-web-formulario`).
