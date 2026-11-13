# Kit para Antigravity — Recolector UPTlax (Astro + Expo)

Este kit le da a Antigravity todo el contexto para construir tu web (Astro → Vercel) y tu app (Expo) **por fases**, con la misma estética
y sin gastar dinero.

## 1. Qué contiene

```
recolector-uptlax-kit/
├── LEEME-PRIMERO.md            ← esta guía
├── PROMPT-MAESTRO.md           ← el prompt que pegas UNA vez en Antigravity
├── AGENTS.md                   ← reglas permanentes, stack y forma de trabajo del agente
├── docs/
│   ├── SPEC.md                 ← qué se construye, alcance y criterios de aceptación
│   └── DISENO.md               ← identidad visual "Blueprint Industrial-Tech" (TI + Industrial)
├── contracts/                  ← FUENTE DE VERDAD compartida por web y app
│   ├── pregunta.ts             ← pregunta oficial (literal) y consentimiento
│   ├── carreras.ts             ← carreras, TSU (IA, Ciencia de Datos, Infra. de Redes), cuatrimestres, metas
│   ├── schema.ts               ← esquemas Zod, detección de PII y de duplicados
│   └── API.md                  ← tabla, endpoints, variables de entorno
└── .agent/
    ├── rules/00-reglas-proyecto.md        ← regla siempre activa
    ├── skills/
    │   ├── diseno-blueprint/SKILL.md      ← cómo aplicar el diseño (Tailwind + NativeWind)
    │   ├── astro-vercel-turso/SKILL.md    ← web, API, Turso, exportación, Vercel
    │   ├── expo-offline-sqlite/SKILL.md   ← app, SQLite, sincronización, CSV local
    │   └── api-sincronizacion/SKILL.md    ← auditoría de contrato e idempotencia
    └── workflows/                         ← una fase = un comando
        ├── 01-fundacion.md
        ├── 02-backend-api.md
        ├── 03-web-formulario.md
        ├── 04-admin-exportacion.md
        ├── 05-app-captura-offline.md
        ├── 06-sincronizacion-export-app.md
        └── 07-qa-despliegue.md
```

## 2. Qué necesitas antes de empezar (todo gratis)
- **Node.js** LTS y **Git** instalados.
- **Antigravity** instalado y con sesión iniciada.
- **Expo Go** en tu celular (Play Store / App Store) para probar la app.
- Cuenta en **Vercel** (Hobby) y en **Turso** (Free). Se crean con correo/GitHub, sin tarjeta en lo habitual; confirma los límites vigentes de cada plan.
- Una cuenta de **GitHub** (para conectar Vercel con tu repositorio).

## 3. Puesta en marcha

1. **Descomprime** el zip y renombra la carpeta como quieras (ej. `recolector-uptlax`).
2. En Antigravity: **File → Open Folder** y abre **la carpeta raíz** (la que contiene `AGENTS.md`). `web/` y `app/` se crean dentro en la Fase 1.
3. Comprueba que Antigravity reconoce los archivos: abre el panel de **Customizations / Rules / Workflows / Skills** (el nombre cambia entre versiones) y revisa que aparezcan
   la regla `00-reglas-proyecto`, los 4 skills y los 7 workflows. Si tu versión no los detecta, ver "Si algo no aparece" más abajo.
4. Abre el chat del Agente en modo **Planning** y **pega el contenido de `PROMPT-MAESTRO.md`**. El agente leerá todo, te hará preguntas (por ejemplo, las 2 ingenierías que faltan en `carreras.ts`)
   y ejecutará solo la **Fase 1**.
5. **Revisa y prueba** lo que hizo (la fase te dice cómo). Si está bien, avanza con el siguiente comando escribiéndolo en el chat:

| Orden | Comando | Qué obtienes | Cómo lo pruebas |
|---|---|---|---|
| 1 | *(prompt maestro)* o `/01-fundacion` | `web/` y `app/` creados, tokens y componentes de diseño | `npm run dev` en `web/`, `npx expo start` en `app/` |
| 2 | `/02-backend-api` | Base Turso + API + exportación | `node scripts/prueba-api.mjs` |
| 2b | `/02b-migrar-a-drizzle` | *(solo si ya hiciste el 2 sin Drizzle)* mismo backend, ahora con Drizzle | `prueba-api.mjs` igual que antes |
| 3 | `/03-web-formulario` | Formulario público listo | Abrirlo en tu celular (misma red) y enviar una respuesta |
| 4 | `/04-admin-exportacion` | `/admin` con avance y descargas CSV/Excel | Entrar con `ADMIN_TOKEN`, descargar y abrir en Excel |
| 5 | `/05-app-captura-offline` | App con captura sin internet | Modo avión → capturar 20 → cerrar y abrir |
| 6 | `/06-sincronizacion-export-app` | Sincronización sin duplicados + CSV local | Sincronizar dos veces: mismos totales |
| 7 | `/07-qa-despliegue` | Checklist final, Vercel, QR y cartel | URL pública + prueba con datos móviles |

**Una fase por conversación nueva** (así el agente no arrastra contexto viejo ni gasta tu cuota). Haz un `git commit` al terminar cada fase.

## 4. Preparar Turso y Vercel (se te pedirá en la Fase 2 y 7)
- **Turso:** crea una base (ej. `recolector`), copia su **URL** (`libsql://…`) y genera un **token**. Ponlos en `web/.env` como `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
- **Secretos propios:** inventa dos cadenas largas y aleatorias: `SYNC_TOKEN` (la usará la app) y `ADMIN_TOKEN` (para `/admin` y la exportación). No los subas a GitHub.
- **Vercel:** importa tu repositorio, define como **Root Directory** `web`, agrega las 4 variables y despliega. Pon la URL resultante en **Ajustes** de la app,
  junto con el `SYNC_TOKEN`.

## 5. Consejos para que salga bien
- Si el agente propone cambiar el stack o añadir algo fuera de `SPEC.md`, responde: *"ciñete a AGENTS.md y SPEC.md"*.
- Pide siempre **evidencia de pruebas** (salida de comandos), no solo "ya quedó".
- Antes de salir a recolectar: web probada desde un celular con datos móviles, app en modo avión, exportación abierta en Excel y **respaldo CSV al terminar cada día**.
- Completa en `contracts/carreras.ts` las ingenierías que faltan (la actividad menciona 7; el kit trae 5) y confirma el rango de cuatrimestres **antes** de la Fase 3.
- El **nombre "Voz Politécnica"** del `DISENO.md` es solo una sugerencia; cámbialo si prefieres otro.

## 6. Si algo no aparece o no funciona
- **Antigravity no detecta reglas/skills/workflows:** esas carpetas (`.agent/`) y el soporte de `AGENTS.md` han cambiado entre versiones. Revisa en su documentación
  o en el panel de personalización dónde se cargan, o crea la regla/workflow desde la interfaz pegando el contenido del archivo correspondiente.
  Como último recurso, el `PROMPT-MAESTRO.md` ya apunta a todo y puedes pegar el contenido de cada workflow directamente en el chat.
- **Versiones de librerías (NativeWind, Tailwind, Expo):** si hay conflicto, pide al agente seguir la guía oficial de instalación vigente y fijar versiones compatibles.
- **No cubierto por el kit:** la evidencia en foto/video/audio que pide la actividad (se hace con la cámara del celular) y el análisis de texto posterior (limpieza, TF-IDF, etc.).
  Cuando tengas los datos, se arma aparte.
