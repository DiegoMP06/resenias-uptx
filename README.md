# 📡 Recolector UPTlax — Voz Politécnica
> **Herramienta académica de recolección y análisis de texto**  
> Proyecto Final de **Minería de Textos** · Grupo **7C** · Universidad Politécnica de Tlaxcala (UPTlax)  
> **Tema de Investigación:** *Pertinencia de la formación académica ante las demandas del campo laboral actual.*

---

## 🎯 1. Metas de Recolección Oficiales

| Ingeniería | Meta de Respuestas | Requisito Especial | Cuatrimestres |
|---|:---:|---|:---:|
| **Ingeniería Industrial** | **≈ 600** | Sin TSU | 1° al 10° |
| **Ingeniería en Tecnologías de la Información** | **≈ 100** | TSU obligatorio (IA / Ciencia de Datos / Infraestructura de Redes) | 1° al 10° |

**Pregunta oficial intacta:**
> *"¿Consideras que la formación que estás recibiendo en la UPTlax es pertinente y adecuada para las demandas y retos del campo laboral actual? ¿Por qué?"*

---

## 🏛️ 2. Arquitectura del Sistema

```
                      ┌──────────────────────────────────────────────┐
                      │             ALUMNO EN EL CAMPUS              │
                      └──────────────────────┬───────────────────────┘
                                             │
                        ┌────────────────────┴──────────────────┐
                        │ Escaneo de Código QR                  │ Celular de encuestador
                        ▼                                       ▼
       ┌────────────────────────────────┐       ┌────────────────────────────────┐
       │      resenias-dashboard        │       │          resenias-app          │
       │    (Astro SSR 5 en Vercel)     │       │     (Expo / React Native)      │
       │  • Formulario público (PWA)    │       │  • Captura 100% offline        │
       │  • Panel administrativo /admin │       │  • SQLite local (WAL)          │
       │  • API REST + Drizzle ORM      │       │  • Sincronización por lotes    │
       └────────────────┬───────────────┘       └───────────────┬────────────────┘
                        │                                       │
                        │ POST /api/respuestas                  │ POST /api/sincronizar
                        │                                       │ (Lotes de 50 + Bearer token)
                        ▼                                       ▼
       ┌─────────────────────────────────────────────────────────────────────────┐
       │                    BASE DE DATOS CENTRAL (TURSO)                        │
       │                        (libSQL en la nube)                              │
       │   • Tabla `respuestas` indexada por UUID v4 (idempotencia absoluta)     │
       │   • Detección de duplicados por hash SHA-256                            │
       │   • Marcado de revisión manual si el alumno incluye correo/teléfono     │
       └───────────────────────────────────┬─────────────────────────────────────┘
                                           │
                                           ▼
       ┌─────────────────────────────────────────────────────────────────────────┐
       │                      DESCARGA Y MINERÍA DE DATOS                        │
       │   • Exportación CSV UTF-8 con BOM (\uFEFF) para Excel                   │
       │   • Exportación Excel nativo (.xlsx con ExcelJS)                        │
       │   • Asignación automática de folios consecutivos (R001, R002...)       │
       └─────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 3. Pila Tecnológica (100% Costo Cero)

- **Web & API (`resenias-dashboard/`):**
  - Astro 5 (modo `server` con `@astrojs/vercel`).
  - React 19 (islas interactivas con React Hook Form y Zod).
  - Tailwind CSS v4 con identidad **Blueprint Industrial-Tech**.
  - **Drizzle ORM** sobre `@libsql/client` contra **Turso** (plan Free).
  - Generación de hojas de cálculo con `exceljs`.
- **App Móvil (`resenias-app/`):**
  - Expo SDK 58 con Expo Router.
  - NativeWind v4 (Tailwind en React Native).
  - `expo-sqlite` (modo WAL con migraciones estructuradas).
  - `@react-native-community/netinfo` (detección reactiva de red).
  - `expo-file-system/legacy` y `expo-sharing` (respaldo CSV local).
- **Contratos Compartidos (`contracts/`):**
  - Esquemas Zod, catálogo de carreras y pregunta oficial sincronizados con `node scripts/sync-contracts.mjs`.

---

## ⚙️ 4. Variables de Entorno

Copia el archivo `.env.example` a `resenias-dashboard/.env`:

```env
# Conexión a Turso (libSQL)
TURSO_DATABASE_URL="libsql://tu-base-de-datos.turso.io"
TURSO_AUTH_TOKEN="tu-token-secreto-de-turso"

# Token secreto para la app móvil (POST /api/sincronizar)
SYNC_TOKEN="clave-secreta-para-sincronizar-app"

# Token secreto para el panel administrativo (/admin) y exportación
ADMIN_TOKEN="clave-secreta-para-acceder-al-panel"
```

---

## 🚀 5. Comandos de Desarrollo y Verificación

### Sincronizar contratos entre proyectos
```bash
node scripts/sync-contracts.mjs
```

### Servidor Web (Dashboard y API)
```bash
cd resenias-dashboard
pnpm install
pnpm dev             # Iniciar en http://localhost:4321
pnpm build           # Compilar para producción (Vercel)
```

### App Móvil (Expo)
```bash
cd resenias-app
npm install
npm start            # Iniciar Metro Bundler y código QR de Expo Go
npx tsc --noEmit     # Verificación de tipos de TypeScript
```

### Suites de Pruebas Automatizadas
```bash
node scripts/prueba-api.mjs        # 44 pruebas de API, Turso, CSV y XLSX
node scripts/prueba-formulario.mjs # 17 pruebas de validación y PII en formulario web
node scripts/prueba-admin.mjs      # 18 pruebas de seguridad y métricas del admin
node scripts/prueba-app-db.mjs     # 7 pruebas de SQLite local en Expo
node scripts/prueba-sync.mjs       # 23 pruebas de carga (120 registros), idempotencia y corte
```

---

## ☁️ 6. Guía de Despliegue en Vercel (Paso a Paso)

1. Sube este repositorio a tu cuenta de **GitHub** (repositorio privado o público).
2. Entra a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New..." $\rightarrow$ "Project"** y selecciona tu repositorio.
4. En la configuración del proyecto:
   - **Framework Preset:** Selecciona `Astro`.
   - **Root Directory:** Haz clic en *Edit* y selecciona `resenias-dashboard`.
5. En la sección **Environment Variables**, agrega las 4 variables de tu `.env`:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `SYNC_TOKEN`
   - `ADMIN_TOKEN`
6. Haz clic en **Deploy**. Vercel desplegará tu backend y frontend en menos de 1 minuto bajo una URL gratuita (ej. `https://recolector-uptlax.vercel.app`).
7. Ejecuta la prueba de verificación contra la URL pública:
   ```bash
   node scripts/generar-qr.mjs https://tu-proyecto.vercel.app
   ```

---

## 📱 7. Guía de Uso de la Aplicación Móvil (App Expo)

### Opción A: Uso con Expo Go (Recomendado para salir a campo)
1. Instala **Expo Go** en los celulares de las brigadas (Android o iOS) desde Google Play Store o Apple App Store.
2. En tu computadora, ejecuta:
   ```bash
   cd resenias-app
   npx expo start
   ```
3. Escanea el código QR desde la app Expo Go.
4. Entra a la pestaña **Ajustes**:
   - Ingresa la URL de Vercel desplegada (o la IP local si están en la misma red Wi-Fi).
   - Ingresa el `SYNC_TOKEN`.
   - Asigna un identificador de encuestador (ej. `app-brigada-1`, `app-brigada-2`).
   - Toca **GUARDAR AJUSTES**.
5. ¡Listo! Puedes apagar el Wi-Fi o activar **Modo Avión** y encuestar todo el día. Al regresar con internet, toca **SINCRONIZAR AHORA** en la pestaña **Resumen**.

### Opción B: Generar un instalable APK independiente (EAS Build)
Si deseas instalar el archivo `.apk` directamente en teléfonos Android sin depender de Expo Go:
1. Crea una cuenta gratuita en [expo.dev](https://expo.dev).
2. En la terminal dentro de `resenias-app`:
   ```bash
   npx eas-cli login
   npx eas-cli build:configure
   npx eas-cli build -p android --profile preview
   ```
   *(El plan gratuito de Expo incluye builds mensuales suficientes para pruebas de campo).*

---

## 🖨️ 8. Código QR y Cartel Imprimible para Difusión

Para generar el código QR con tu URL de Vercel y el cartel oficial:
```bash
node scripts/generar-qr.mjs https://tu-dominio.vercel.app
```
Archivos generados en `resenias-dashboard/public/`:
- `qr.png`: Código QR en alta resolución (1024x1024) para proyectar o imprimir.
- `qr.svg`: Formato vectorial escalable.
- `cartel.html`: Hoja imprimible tamaño Carta con diseño Blueprint Industrial-Tech, titular, pregunta oficial y código QR listo para colocar en pasillos y laboratorios de la universidad (abre en Chrome y presiona `Ctrl + P`).

---

## 🔒 9. Reglas de Privacidad y Ética Académica

- **Cero Datos Personales (PII):** No se almacena nombre, matrícula, teléfono, correo, dirección IP, user-agent ni identificadores de hardware.
- **Consentimiento Previo:** Visible y obligatorio antes de habilitar la captura.
- **Respuesta Íntegra:** El texto de los alumnos jamás se modifica ni se autocorrige; únicamente se aplica `.trim()`.
- **Idempotencia:** El UUID v4 nace en el cliente; un reenvío jamás duplica registros en la base de datos.
- **Folios:** El folio `R001...` se asigna exclusivamente al momento de exportar, manteniendo la privacidad durante el almacenamiento.

---

## ✅ 10. Lista de Verificación Previa a la Salida a Campo

Antes de iniciar la jornada de recolección en las instalaciones de la UPTlax, confirma:

- [ ] **Acceso Web:** Abre la URL de Vercel en un celular con datos móviles (4G/5G) y envía una respuesta de prueba.
- [ ] **Modo Avión en App:** Abre la app móvil en Expo Go, activa modo avión, captura 3 registros y confirma que queden en estado `PENDIENTE`.
- [ ] **Sincronización:** Reconecta internet, pulsa **SINCRONIZAR AHORA** y verifica que pasen a estado `ENVIADO`.
- [ ] **Panel Admin:** Abre `/admin`, ingresa tu `ADMIN_TOKEN` y confirma que las respuestas se visualicen en los contadores de avance.
- [ ] **Prueba de Exportación:** Descarga el archivo `.csv` y el archivo `.xlsx` desde `/admin`, ábrelos en Excel y confirma que los acentos, caracteres `ñ` y folios `R001...` se lean sin fallas.
- [ ] **Respaldo Local:** En la app móvil, prueba el botón **EXPORTAR CSV (RESPALDO LOCAL)** en la pestaña Resumen para tener un respaldo directo en caso de emergencia.
- [ ] **Batería y Carteles:** Lleva tus carteles impresos desde `cartel.html` y una batería portátil para los teléfonos de las brigadas.
