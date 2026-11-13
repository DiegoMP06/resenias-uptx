---
description: Fase 4 — Panel /admin con resumen, medidores de avance y descarga CSV/Excel
---

# /04-admin-exportacion

Objetivo: que el usuario vea el avance y descargue el dataset. Trabaja en `resenias-dashboard/`.

1. Lee el skill `astro-vercel-turso` (paso 6) y `docs/DISENO.md` (pantalla `/admin`).
2. Página `/admin` (`noindex`, `no-store`): pide `ADMIN_TOKEN` (solo `sessionStorage`), llama `/api/resumen` con `Authorization: Bearer`.
3. Muestra: tarjetas KPI (total, válidos, posibles duplicados, posible PII), **medidor segmentado por carrera** contra su `meta`,
   desglose por TSU, por cuatrimestre y por fuente (`web`, `app-1`…), y tabla de revisión (registros marcados) con el texto truncado y su motivo.
4. Botones **Descargar CSV** y **Descargar Excel** con selector de carrera (Todas / una) y casilla "incluir posibles duplicados". La descarga usa
   `fetch` con el header de autorización y `Blob` (el token nunca va en la URL). Nombre de archivo del contrato.
5. Verifica: sin token no se ve nada; token incorrecto muestra error claro; los archivos descargados abren en Excel con acentos/ñ correctos y folios `R001…`.
6. Commit: `feat(web): panel admin y exportación`.

Termina con cómo entrar al panel y qué hace cada botón. Detente.
