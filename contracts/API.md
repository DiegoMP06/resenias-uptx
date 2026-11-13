# Contrato de la API (web ⇄ app ⇄ base de datos)

Base URL: la de Vercel (ej. `https://recolector-uptlax.vercel.app`). Todas las respuestas son JSON salvo la exportación.

## Tabla `respuestas` (Turso / libSQL)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | TEXT PK | UUID v4 generado en el cliente. Clave de idempotencia. |
| `carrera` | TEXT NOT NULL | id de `carreras.ts` |
| `tsu` | TEXT NULL | solo si la carrera lo pide |
| `cuatrimestre` | INTEGER NOT NULL | 1–11 |
| `respuesta` | TEXT NOT NULL | texto íntegro, solo `trim()` |
| `fuente` | TEXT NOT NULL | `web`, `app-1`, `app-2`… |
| `hash` | TEXT NOT NULL | SHA-256 del texto normalizado (`normalizarParaHash`) |
| `posible_duplicado` | INTEGER DEFAULT 0 | 1 si ya existía otro registro con el mismo hash |
| `posible_pii` | TEXT NULL | etiquetas separadas por coma (`correo,telefono`) para revisión manual |
| `creado_en` | TEXT NOT NULL | ISO 8601 de captura (dispositivo) |
| `recibido_en` | TEXT NOT NULL | ISO 8601 del servidor |

Índices: `hash`, `carrera`, `creado_en`.
**Nunca** guardar IP, user-agent, device id, correo, nombre ni matrícula.

## Endpoints

### `POST /api/respuestas` — formulario web (público)
Body: `Registro` (ver `schema.ts`) + `sitio` (honeypot, debe ir vacío o ausente).
- `201 {ok:true, id}` guardado · `200 {ok:true, id, repetido:true}` si el `id` ya existía (idempotente)
- `400 {ok:false, errores:[{campo,mensaje}]}` validación · `429` demasiadas solicitudes · honeypot lleno → responder `201` falso sin guardar.

### `POST /api/sincronizar` — app (requiere `Authorization: Bearer <SYNC_TOKEN>`)
Body: `{ registros: Registro[] }` (1–50).
- `200 {ok:true, aceptados:[id...], rechazados:[{id, motivo}]}`
- Upsert por `id` (`INSERT ... ON CONFLICT(id) DO NOTHING`). Un id repetido cuenta como **aceptado** (para que la app lo marque como enviado).
- La app marca `enviado` SOLO los ids de `aceptados`.
- `401` token inválido · `400` JSON inválido.

### `GET /api/resumen` (requiere `Authorization: Bearer <ADMIN_TOKEN>`)
`200 { total, validos, posiblesDuplicados, posiblePii, porCarrera:[{carrera,total,meta}], porCuatrimestre:[...], porTsu:[...], porFuente:[...] }`

### `GET /api/exportar?formato=csv|xlsx&carrera=<id>&duplicados=0|1` (requiere `Authorization: Bearer <ADMIN_TOKEN>`)
- Orden por `creado_en` ascendente; el **folio `R001…` se asigna aquí** (3 dígitos, 4 si pasa de 999).
- Por defecto excluye `posible_duplicado=1` (`duplicados=1` los incluye).
- Columnas: `ID, Carrera, TSU_Especialidad, Cuatrimestre, Respuesta abierta, Fuente, Fecha, Revision`.
  (`Revision` = `posible_duplicado` / `posible_pii:<tipos>` / vacío).
- CSV: UTF-8 **con BOM**, separador `,`, campos entrecomillados, saltos de línea del texto preservados.
- XLSX: hoja `Respuestas` con encabezado en negritas, ancho de columnas razonable, ajuste de texto en `Respuesta abierta`.
- `Content-Disposition: attachment; filename="respuestas_<carrera|todas>_<YYYY-MM-DD>.<ext>"`.

## Variables de entorno (Vercel y `.env` local)

| Variable | Uso |
|---|---|
| `TURSO_DATABASE_URL` | URL libSQL de la base |
| `TURSO_AUTH_TOKEN` | token de la base |
| `SYNC_TOKEN` | secreto que usa la app para `/api/sincronizar` |
| `ADMIN_TOKEN` | secreto para `/admin`, `/api/resumen`, `/api/exportar` |
| `PUBLIC_*` | solo valores no secretos |

Comparar tokens con comparación en tiempo constante. Nunca imprimir tokens en logs.
