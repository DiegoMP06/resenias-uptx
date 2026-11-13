---
trigger: always_on
description: Reglas permanentes del proyecto Recolector UPTlax
---

# Reglas permanentes

- Lee `AGENTS.md`, `docs/SPEC.md` y `contracts/` al iniciar cualquier tarea. Esos archivos mandan sobre cualquier suposición tuya.
- Trabaja **solo la fase pedida**. Al terminar, resume y detente.
- La pregunta del formulario es `PREGUNTA_OFICIAL` (`contracts/pregunta.ts`), literal. No la edites, no la acortes, no agregues ejemplos.
- Prohibido recolectar o guardar: nombre, matrícula, teléfono, correo, IP, user-agent, ID de dispositivo. Sin analytics ni scripts de terceros.
- El texto del alumno solo se `trim()`ea. Nunca se corrige.
- Sin dependencias de pago ni servicios que pidan tarjeta. Si algo lo requiere, propón alternativa gratuita.
- Consulta la documentación vigente de Astro, Expo, NativeWind, Tailwind, Turso y Vercel antes de configurar; no uses APIs de memoria si dudas.
- Escribe archivos completos, en TypeScript estricto, con nombres en español para dominio (`respuesta`, `carrera`, `sincronizar`) e inglés para técnica (`handler`, `client`).
- Interfaz en español de México. Cumple `docs/DISENO.md` (tokens de color, tipografías, motivos).
- Verifica antes de declarar terminado: build, typecheck y la prueba manual descrita en el workflow. Reporta lo que NO pudiste verificar.
- No expongas secretos en código, logs ni capturas. Usa `.env` (ignorado por git) y `.env.example` con placeholders.
