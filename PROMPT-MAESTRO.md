# PROMPT MAESTRO (pégalo en Antigravity, en el chat del Agente)

> Úsalo **una sola vez**, al empezar. Después avanzas con los workflows `/01-fundacion`, `/02-backend-api`, etc.
> Recomendado: modo **Planning** para las fases 1, 2, 5 y 6; modo **Fast** para ajustes de UI.

---

Vas a construir, **por fases**, una herramienta académica de recolección de datos para un proyecto de Minería de Textos de la UPTlax
(grupo 7C, tema: *pertinencia de la formación académica*). Son **dos proyectos independientes** dentro de este workspace:

- `web/` → **Astro** (modo servidor, desplegado en **Vercel**) con isla de **React**, **Tailwind**, **React Hook Form + Zod**, base **Turso** (libSQL, plan gratis) con **Drizzle ORM** (se agrega en la Fase 2),
  API propia, panel `/admin` y exportación **CSV/XLSX**.
- `app/` → **Expo (React Native)** con **NativeWind**, **React Hook Form + Zod** y **SQLite local** (`expo-sqlite`) para capturar **sin internet** y
  sincronizar después a la API de `web/` sin duplicar registros (UUID generado en el cliente + upsert en el servidor).

Meta de recolección: ≈ 600 respuestas de Ingeniería Industrial y ≈ 100 de Ingeniería en TI. En TI se captura además el **TSU/especialidad**:
Inteligencia Artificial, Ciencia de Datos o Infraestructura de Redes. Todo debe correr en **planes gratuitos**.

**Diseño:** web y app comparten una misma estética tecnológica que mezcla **TI + Ingeniería Industrial** ("Blueprint Industrial-Tech": cuadrícula de plano,
cian/ámbar sobre azul pizarra, tipografía mono, medidores de planta, etiquetas de estado de máquina). El sistema completo está en `docs/DISENO.md` y se aplica
con el skill `diseno-blueprint`.

**Antes de escribir código, lee en este orden:**
1. `AGENTS.md` (reglas, stack, forma de trabajo)
2. `docs/SPEC.md` (alcance y criterios de aceptación)
3. `docs/DISENO.md` (identidad visual)
4. `contracts/` (pregunta oficial, carreras/TSU/cuatrimestres, esquema Zod y contrato de API: **fuente de verdad**)
5. Los skills de `.agent/skills/` y los workflows de `.agent/workflows/`

**Reglas críticas (resumen):** la pregunta del formulario es `PREGUNTA_OFICIAL` y no se modifica ni se acompaña de ejemplos; no se recolectan nombre, matrícula,
teléfono, correo ni datos del dispositivo; el texto del alumno solo se `trim()`ea; el folio `R001…` se asigna al exportar; la app nunca borra registros al sincronizar.

**Cómo trabajar:**
- Hoy ejecuta **únicamente la Fase 1** siguiendo `.agent/workflows/01-fundacion.md`.
- Primero muéstrame un plan corto (máx. 10 líneas) y las preguntas que necesites (por ejemplo, la lista completa de las 7 ingenierías: en `contracts/carreras.ts` hay 5 y falta confirmar el resto).
- Implementa, ejecuta build/typecheck, haz los commits indicados y cierra con un resumen: qué hiciste, cómo probarlo, qué falta y qué decisión necesitas de mí.
- **No avances a la Fase 2** hasta que yo ejecute `/02-backend-api`.
- Si una librería o configuración cambió, consulta su documentación vigente; no asumas versiones de memoria. Si algo no se puede verificar, dilo explícitamente.
