---
description: Fase 3 — Formulario web público (Astro + React Hook Form) con el diseño Blueprint
---

# /03-web-formulario

Objetivo: la página `/` lista para que los alumnos respondan desde el celular. Trabaja en `web/`.

1. Lee `docs/DISENO.md` (pantallas clave), `contracts/pregunta.ts` y `contracts/schema.ts`.
2. Crea la isla de React `FormularioRespuesta` (`client:load`) con React Hook Form + `zodResolver(formularioSchema)`:
   consentimiento (texto de `TEXTO_CONSENTIMIENTO`, checkbox con `ETIQUETA_CONSENTIMIENTO`) → carrera → TSU (aparece y es obligatorio solo si `carreraPideTsu`)
   → cuatrimestre → `PREGUNTA_OFICIAL` con área de texto y contador. Honeypot `sitio` oculto accesiblemente.
3. Al enviar: genera `id` con `crypto.randomUUID()`, `fuente: 'web'`, `creadoEn` ISO; construye el registro con `formularioARegistro`; `POST /api/respuestas`.
   Estados: enviando (botón deshabilitado), error de red (conserva lo escrito y permite reintentar con el mismo `id`), `400` (muestra errores por campo), éxito.
4. Pantalla de gracias con botón "Responder de nuevo" que reinicia el formulario (uso en dispositivo compartido).
5. Aplica el skill `diseno-blueprint`: rejilla de plano, tarjetas con esquinas de registro, indicador de pasos tipo traza de circuito, botón fijo inferior en móvil.
6. Metadatos: `<title>`, `lang="es-MX"`, `noindex` (es un instrumento de recolección, no una página para buscadores), favicon con el glifo del proyecto.
7. Verifica en viewport de 360 px y 1280 px: sin scroll horizontal, teclado y botón usables, foco visible, contraste AA. Compara la pregunta mostrada con `PREGUNTA_OFICIAL`
   (prueba automática que falle si difieren). Prueba que el envío llega a Turso.
8. Commit: `feat(web): formulario público`.

Termina con cómo probarlo y capturas/descripción móvil. Detente.
