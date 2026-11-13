# DISENO — Identidad visual "Blueprint Industrial-Tech"

**Idea:** el plano técnico de una planta donde corre un sistema de software. Fusiona **Ing. en TI** (terminal, datos, circuitos,
tipografía mono) con **Ing. Industrial** (planos, cuadrícula de ingeniería, señalética de seguridad, flujos de proceso, medidores).
Debe sentirse como un panel de control de una fábrica inteligente: serio, preciso, con un toque lúdico para que dé gusto contestar.

## Paleta (tokens)
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0A0F1A` | fondo base (azul pizarra casi negro) |
| `surface` | `#111827` | tarjetas |
| `surface-2` | `#1A2336` | campos, elementos elevados |
| `line` | `#243049` | bordes y líneas de cuadrícula |
| `text` | `#E6EDF7` | texto principal |
| `muted` | `#8A97B1` | texto secundario |
| `cyan` (TI) | `#22D3EE` | acción principal, foco, datos |
| `amber` (Industrial) | `#FFB020` | acento secundario, advertencias, "pendiente" |
| `ok` | `#34D399` | enviado / correcto |
| `danger` | `#F87171` | error |

Regla: **cian = digital/acción**, **ámbar = industrial/atención**. Nunca más de dos acentos por pantalla.
Contraste mínimo AA (texto `#E6EDF7` sobre `#0A0F1A` ≈ 15:1; botones cian con texto `#04121A`).

## Tipografía
- Títulos y cifras: **Space Grotesk** (600/700). Cuerpo: **Inter** (400/500). Datos, etiquetas técnicas, folios: **JetBrains Mono**.
- Web: `@fontsource` (autohospedado, sin Google Fonts remotas). App: `@expo-google-fonts/*`.
- Etiquetas de sección en mono, mayúsculas, `tracking-widest`, tamaño pequeño: `// 01 · DATOS DEL PARTICIPANTE`.

## Lenguaje visual (motivos)
- **Cuadrícula de plano:** fondo con rejilla fina (líneas `line` al ~40 % de opacidad, celdas de 24 px) y una rejilla mayor cada 120 px.
  Web: `background-image` con `linear-gradient`. App: `<View>` con patrón SVG (`react-native-svg`) o `ImageBackground` con una imagen generada.
- **Marcas de registro** en las esquinas de las tarjetas (pequeños ángulos en cian) como esquinas de un plano/PCB.
- **Cinta de seguridad:** franja diagonal ámbar/oscuro (`repeating-linear-gradient 45°`) de 6 px, solo como separador o en estados de advertencia.
- **Trazas de circuito:** líneas finas con nodos que conectan los pasos del formulario (indicador de progreso tipo diagrama de flujo / PCB).
- **Medidores:** barras de avance segmentadas tipo "OEE / tablero de planta" (segmentos de 10 %), con valor en mono.
- **Etiquetas tipo estado de máquina:** chips con punto de color (● PENDIENTE ámbar, ● ENVIADO verde, ● ERROR rojo).
- **Iconos:** `lucide` (web: `lucide-react`; app: `lucide-react-native`) con trazo 1.5. Sugeridos: `Factory`, `Cpu`, `Workflow`, `Gauge`, `Wifi`, `WifiOff`,
  `DatabaseZap`, `ClipboardList`, `Cog`.
- **Movimiento:** sutil (entrada escalonada de 120 ms, barra que se llena, pulso en el punto de estado de conexión). Respetar `prefers-reduced-motion`.

## Componentes base (mismos nombres en web y app)
`Pantalla` (fondo + rejilla), `Tarjeta` (con esquinas de registro), `Campo` (etiqueta mono + control + error), `Selector`,
`AreaTexto` (con contador `0000/4000`), `Boton` (primario cian, secundario contorno, peligro), `Chip` de estado,
`MedidorSegmentado`, `Cinta`, `EncabezadoSeccion`, `IndicadorConexion` (● EN LÍNEA / ● SIN RED).

## Tailwind (tokens compartidos)
Web (`tailwind.config` o `@theme` en CSS) y app (`tailwind.config.js` de NativeWind) usan **los mismos nombres de color**:
`bg`, `surface`, `surface2`, `line`, `text`, `muted`, `cyan`, `amber`, `ok`, `danger`; fuentes `display`, `sans`, `mono`; radio base `6px`
(casi rectos: sensación industrial; nada de píldoras gigantes). Sombras: halos cian suaves en foco (`0 0 0 3px rgba(34,211,238,.25)`).

## Tono de los textos (ejemplos de estilo, no de la pregunta)
- Título: **"Voz Politécnica"** · subtítulo: *"Ayúdanos a conectar lo que estudias con lo que el trabajo te va a pedir."* (evitar inducir respuestas).
- Botón: **Enviar respuesta** · éxito: **"¡Registro recibido! Gracias por aportar."**
- Sin red (app): **"Sin red · guardado en este dispositivo"**.
- Nada de lenguaje que sugiera qué responder o que la formación "es buena/mala".

## Pantallas clave
- **Web `/`:** encabezado compacto con logo-glifo (engrane + circuito) y nombre; tarjeta de consentimiento; tarjeta de datos;
  tarjeta de la pregunta (texto oficial destacado en `sans` 17 px con `leading-relaxed`); botón fijo inferior en móvil.
- **Web `/admin`:** panel tipo tablero de planta (tarjetas KPI, medidores por carrera, tabla de revisión, botones de descarga).
- **App:** tabs inferiores `Capturar · Registros · Resumen · Ajustes`, con `IndicadorConexion` siempre visible en el encabezado.
