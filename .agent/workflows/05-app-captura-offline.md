---
description: Fase 5 — App Expo: captura sin internet con SQLite, lista de registros, resumen y ajustes
---

# /05-app-captura-offline

Objetivo: capturar y consultar registros 100 % sin red. Trabaja en `resenias-app/`. **Aún sin sincronización.**

1. Lee el skill `expo-offline-sqlite` (pasos 2, 3 y 6) y `docs/DISENO.md`.
2. Base SQLite con migraciones y repositorio tipado (`registros`, `ajustes`).
3. Navegación con Expo Router: tabs `Capturar · Registros · Resumen · Ajustes` con `IndicadorConexion` (NetInfo) en el encabezado.
4. **Capturar:** mismo formulario que la web (RHF + `formularioSchema`, misma `PREGUNTA_OFICIAL`, mismo consentimiento). Guarda `pendiente` con UUID de `expo-crypto`.
   Modo entrevista: pantalla "¡Gracias!" ~2 s → formulario en blanco. TSU solo si TI.
5. **Registros:** lista (FlatList) con chip de estado, filtros por estado/carrera, detalle, borrar solo `pendiente` con confirmación.
6. **Resumen:** total, por estado, por carrera con `MedidorSegmentado` contra meta, por TSU.
7. **Ajustes:** `api_url`, `sync_token` (campo oculto con ojo), `fuente`, `sync_auto`.
8. Aplica el skill `diseno-blueprint` (mismos tokens y componentes que la web).
9. Verifica en Expo Go: modo avión → capturar 20 registros → cerrar y reabrir la app → todo sigue ahí; teclado no tapa el botón; fuentes cargan; `npx tsc --noEmit`.
10. Commit: `feat(app): captura offline`.

Termina con cómo probarlo en el celular y lista de pruebas hechas. Detente.
