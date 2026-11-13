---
name: api-sincronizacion
description: Garantiza que web, app y servidor respeten el mismo contrato (esquemas Zod, API, idempotencia por UUID, folios al exportar). Úsalo al tocar contracts/, endpoints, sincronización o exportación, y para auditar que no haya divergencias entre resenias-dashboard/ y resenias-app/.
---

# Skill: contrato y sincronización

## Cuándo usarlo
- Cuando cambies `contracts/*` o cualquier endpoint.
- Antes de cerrar las fases de backend, sincronización y QA (auditoría).

## Pasos
1. Fuente de verdad: `contracts/schema.ts`, `carreras.ts`, `pregunta.ts`, `API.md`. Cualquier cambio se hace ahí y luego se propaga con
   `node scripts/sync-contracts.mjs` (copia a `resenias-dashboard/src/shared/` y `resenias-app/src/shared/`).
2. Auditoría rápida (ejecútala y reporta):
   - `diff -r contracts resenias-dashboard/src/shared` y `diff -r contracts resenias-app/src/shared` (ignorando `API.md`) → sin diferencias.
   - La cadena de la pregunta en el formulario web y en la app es **idéntica** a `PREGUNTA_OFICIAL` (búscala con `grep` y compara).
   - Los códigos de estado y formas JSON de los endpoints coinciden con `API.md`.
   - La app marca `enviado` solo con `aceptados`; un `id` repetido se trata como aceptado.
   - El folio `R###` solo se genera en la exportación.
3. Prueba de idempotencia (script `scripts/prueba-sync.mjs`): genera 120 registros con UUID, envía por lotes de 50, repite el envío completo,
   y comprueba que `COUNT(*)` = 120. Después simula un lote cortado (cancelar la petición a la mitad) y reenvía: sigue 120.
4. Prueba de validación: carrera TI sin TSU → `400`; carrera Industrial con TSU → `400`; respuesta de 10 caracteres → `400`; honeypot lleno → `201` sin guardar.

## Salida esperada
Reporte corto: ✅/❌ por cada punto de la auditoría + cambios aplicados.
