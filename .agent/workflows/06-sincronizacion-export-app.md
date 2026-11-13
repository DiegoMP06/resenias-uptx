---
description: Fase 6 — Sincronización por lotes app→servidor y exportación CSV local desde la app
---

# /06-sincronizacion-export-app

Objetivo: subir los registros pendientes sin duplicar y poder respaldar en CSV. Trabaja en `resenias-app/` (y ajusta `resenias-dashboard/` solo si la auditoría lo exige).

1. Lee `contracts/API.md` (sección `/api/sincronizar`) y el skill `expo-offline-sqlite` (pasos 4 y 5).
2. Implementa `sincronizar()`: lotes de 50, `Authorization: Bearer`, timeout 20 s, 3 reintentos con espera creciente, candado anti-doble ejecución,
   progreso (`x de y`), marca `enviado` solo los `aceptados`, `error` con motivo en los `rechazados`. Nunca borra registros locales.
3. Pantalla/botón **Sincronizar ahora** (en Resumen) con barra de progreso y resultado claro. Opción de sincronización automática al recuperar red.
4. Exportar CSV local (UTF-8 con BOM, columnas del skill) y abrir la hoja de compartir. Botón en Resumen.
5. Ejecuta el skill `api-sincronizacion` (auditoría completa) y la prueba de idempotencia con la API desplegada o local (`resenias-dashboard` en `npm run dev` + IP de tu red).
6. Verifica manualmente: 20 registros en modo avión → reconectar → sincronizar → verlos en `/admin`; sincronizar de nuevo → sin duplicados; cortar el Wi-Fi a mitad → reintento → sin pérdidas ni duplicados.
7. Commit: `feat(app): sincronización y exportación local`.

Termina con el reporte de la auditoría (✅/❌). Detente.
