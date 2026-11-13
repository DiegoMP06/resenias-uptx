---
name: expo-offline-sqlite
description: Construye la app Expo con NativeWind, formulario RHF+Zod, cola offline en expo-sqlite, sincronización por lotes idempotente y exportación CSV local. Úsalo para tareas en la carpeta app/.
---

# Skill: Expo + SQLite offline

## Cuándo usarlo
Al crear `app/`, la persistencia local, la sincronización, el resumen o la exportación desde el celular.

## Pasos
1. **Proyecto:** crea la app Expo con TypeScript y Expo Router (plantilla vigente). Agrega NativeWind (sigue la guía oficial para tu versión de Expo/Tailwind),
   `react-hook-form`, `zod`, `@hookform/resolvers`, `expo-sqlite`, `@react-native-community/netinfo`, `expo-crypto`, `expo-file-system`,
   `expo-sharing`, `lucide-react-native` + `react-native-svg`, fuentes con `@expo-google-fonts/*`.
2. **SQLite (`src/db/`):** abre la base con `expo-sqlite`, migraciones versionadas (`PRAGMA user_version`). Tablas:
   - `registros(id TEXT PK, carrera, tsu, cuatrimestre, respuesta, fuente, creado_en, estado TEXT CHECK in ('pendiente','enviado','error'), intentos INTEGER, error TEXT, enviado_en)`
   - `ajustes(clave TEXT PK, valor TEXT)` → `api_url`, `sync_token`, `fuente`, `sync_auto`.
   Repositorio con funciones tipadas: `crear`, `listar(filtros)`, `contarPorEstado`, `contarPorCarrera`, `pendientes(limite)`, `marcarEnviados(ids)`, `marcarError(id, msg)`, `borrarPendiente(id)`.
3. **Captura:** `expo-crypto` `randomUUID()` para el `id`; `creadoEn = new Date().toISOString()`; usa `formularioSchema` y `formularioARegistro` de `src/shared`.
   Guarda como `pendiente`. Modo entrevista: tras guardar muestra "¡Gracias!" ~2 s y reinicia el formulario vacío.
4. **Sincronización (`src/sync/`):** `NetInfo` para saber si hay red. `sincronizar()` toma pendientes/error en lotes de 50 → `POST {api_url}/api/sincronizar`
   con `Authorization: Bearer <sync_token>` → marca como `enviado` **solo** `aceptados`; los `rechazados` pasan a `error` con el motivo.
   Timeout de 20 s por lote, 3 reintentos con espera creciente, y se detiene si no hay red. Un candado evita dos sincronizaciones simultáneas.
   Sincronización automática opcional al recuperar red (si `sync_auto`). **Nunca borra registros locales.**
5. **Exportación local:** genera CSV UTF-8 con BOM (columnas: `ID_local, Carrera, TSU_Especialidad, Cuatrimestre, Respuesta abierta, Fuente, Fecha, Estado`),
   lo guarda con `expo-file-system` y abre la hoja de compartir con `expo-sharing`. Escapa comillas y saltos de línea.
6. **UI:** tabs `Capturar · Registros · Resumen · Ajustes`, `IndicadorConexion` en el encabezado, estados vacíos/errores. Aplica el skill `diseno-blueprint`.
7. **Pruebas manuales:** modo avión → capturar 20 → reconectar → sincronizar → verificar en `/admin`; sincronizar otra vez → sin duplicados;
   cortar la red a mitad → ningún registro se pierde ni se duplica; cerrar y reabrir la app → los datos siguen ahí.

## Notas
- Funciona en **Expo Go** durante el desarrollo. Para instalar la app "de verdad" sin costo: build de desarrollo local o `eas build --profile preview` (revisar límites del plan gratuito).
- El `sync_token` se captura en Ajustes (no va en el código). Aviso en pantalla: no compartir capturas de Ajustes.
- La exportación en `.xlsx` se hace en la web; la app exporta CSV (Excel lo abre).

## Salida esperada
Código completo en `app/`, `README` con comandos (`npx expo start`, build), y la lista de pruebas manuales ejecutadas con su resultado.
