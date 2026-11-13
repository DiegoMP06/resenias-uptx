# SPEC — Recolector UPTlax

## Objetivo
Recolectar ~700 respuestas abiertas (≈600 de Ingeniería Industrial y ≈100 de Ingeniería en TI, con TSU) para el proyecto de
Minería de Textos del grupo 7C: *Pertinencia de la formación académica*. Dos puntos de captura que alimentan **una sola base**:
formulario web (Astro) y app móvil con modo sin internet (Expo).

## Usuarios
- **Alumno/a participante:** responde una vez, desde su celular (QR→web) o en el celular del recolector (app).
- **Recolector (el usuario, Diego):** captura en campo, sincroniza, revisa avance y exporta.

## Campos que se capturan (y solo estos)
`consentimiento` (no se guarda, solo se exige), `carrera`, `tsu` (solo TI: Inteligencia Artificial / Ciencia de Datos /
Infraestructura de Redes), `cuatrimestre`, `respuesta`, y metadatos técnicos: `id` (UUID), `fuente`, `creadoEn`.

## Alcance por parte

### Web (`resenias-dashboard/`)
- **Formulario público** `/` — mobile-first, un solo paso: consentimiento → carrera → (TSU si TI) → cuatrimestre → pregunta oficial.
  Contador de caracteres, validación en vivo (RHF + Zod), estado de envío, pantalla de gracias con opción "Responder otra vez" (para
  uso en tablet/celular compartido). Honeypot oculto.
- **API** (`/api/respuestas`, `/api/sincronizar`, `/api/resumen`, `/api/exportar`) según `contracts/API.md`.
- **Admin** `/admin` — protegido con `ADMIN_TOKEN`: tarjetas de resumen (total, por carrera, por TSU, por cuatrimestre, por fuente,
  posibles duplicados, posible PII), barras de avance contra la meta de cada carrera, botones **Descargar CSV** y **Descargar Excel**
  (con filtro por carrera) y tabla de revisión de registros marcados.
- **Despliegue** en Vercel (Hobby) con Turso.

### App (`resenias-app/`)
- **Nueva respuesta** (modo entrevista): mismo formulario; al guardar → pantalla "¡Gracias!" → vuelve al formulario en blanco listo
  para el siguiente alumno. Funciona 100 % sin internet (guarda en SQLite con estado `pendiente`).
- **Registros:** lista con estado (pendiente/enviado/error), filtro por estado y carrera; ver detalle; borrar solo registros *pendientes*
  con confirmación (por si se capturó mal).
- **Resumen:** total, pendientes, enviados, por carrera con barra de avance contra meta, por TSU.
- **Sincronizar:** botón manual + sincronización automática al detectar internet (opcional, activable en Ajustes). Lotes de 50, progreso,
  reintentos con espera, manejo de errores por registro.
- **Exportar local (respaldo):** CSV UTF-8 con BOM de todos los registros del dispositivo (pendientes y enviados) vía hoja de compartir.
- **Ajustes:** URL de la API, token de sincronización, nombre de fuente del dispositivo (`app-1`…), meta por carrera (solo lectura
  desde `carreras.ts`), versión.

## Fuera de alcance (no construir)
Cuentas de usuario, login de alumnos, analytics, notificaciones push, edición del texto de una respuesta, análisis de texto, evidencia
foto/video/audio (se toma con la cámara del celular fuera de la app), modo oscuro/claro conmutable (solo tema oscuro tecnológico).

## Criterios de aceptación globales
1. Enviar una respuesta desde la web la deja en Turso y se ve en `/admin` y en la exportación.
2. En la app, en modo avión se pueden capturar ≥ 20 respuestas; al volver el internet y pulsar Sincronizar, llegan **todas una sola vez**
   (probar sincronizar dos veces: sin duplicados).
3. Un corte de red a mitad de un lote no pierde ni duplica registros.
4. El CSV abre en Excel con acentos y ñ correctos; el XLSX abre sin advertencias; el folio va de `R001` consecutivo.
5. La pregunta del formulario coincide **carácter por carácter** con `PREGUNTA_OFICIAL`.
6. TSU aparece y es obligatorio solo cuando la carrera es TI; no aparece en las demás.
7. Nada de datos personales en la base, logs ni exportación (más allá de lo que el alumno escriba y quede marcado para revisión).
8. `npm run build` y `npm run typecheck` sin errores en `resenias-dashboard/` y `resenias-app/`; la web desplegada responde en < 2 s en 4G.
9. Misma identidad visual en web y app (ver `docs/DISENO.md`).
