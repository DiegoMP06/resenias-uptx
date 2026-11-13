---
name: diseno-blueprint
description: Aplica la identidad visual "Blueprint Industrial-Tech" (cuadrícula de plano, cian/ámbar, tipografía mono, medidores de planta) con Tailwind en la web y NativeWind en la app. Úsalo al crear o modificar cualquier pantalla, componente o estilo del proyecto.
---

# Skill: diseño Blueprint Industrial-Tech

## Cuándo usarlo
Cada vez que crees UI en `resenias-dashboard/` o `resenias-app/`: layouts, formularios, tarjetas, botones, tablas, estados vacíos, pantallas de carga/éxito/error.

## Pasos
1. Lee `docs/DISENO.md` completo (paleta, tipografía, motivos, componentes, tono).
2. Define **primero** los tokens (una sola vez por proyecto):
   - Web: variables CSS / `@theme` de Tailwind con los nombres `bg, surface, surface2, line, text, muted, cyan, amber, ok, danger`; fuentes `display, sans, mono`.
   - App: `tailwind.config.js` de NativeWind con **los mismos nombres**; fuentes cargadas con `expo-font`/`@expo-google-fonts` antes de ocultar el splash.
3. Construye los componentes base con **los mismos nombres y props** en ambos proyectos: `Pantalla, Tarjeta, Campo, Selector, AreaTexto, Boton, Chip, MedidorSegmentado, Cinta, EncabezadoSeccion, IndicadorConexion`.
4. Usa los motivos con moderación: una cuadrícula de fondo, esquinas de registro en tarjetas, un máximo de una "cinta de seguridad" por pantalla,
   medidores segmentados para progreso. Cian = acción/digital, ámbar = industrial/atención.
5. Estados obligatorios en cada pantalla: carga, vacío, error, éxito, sin red (app).
6. Verifica:
   - Contraste AA, objetivos táctiles ≥ 44 px, etiquetas en campos, foco visible.
   - Móvil primero: 360 px de ancho sin scroll horizontal (web); teclado no tapa el botón de enviar (app: `KeyboardAvoidingView`/scroll).
   - `prefers-reduced-motion` respetado.

## Qué evitar
- Gradientes morados genéricos, tarjetas redondísimas, sombras difusas pesadas, emojis como iconos principales, Lorem ipsum.
- Más de dos colores de acento por pantalla.
- Texto de interfaz que sugiera cómo contestar la pregunta o que valore la formación.
- Fuentes remotas en la web (autohospedar con `@fontsource`).

## Salida esperada
Componentes reutilizables + una pantalla de ejemplo funcional; capturas o descripción del resultado en móvil (360 px).
