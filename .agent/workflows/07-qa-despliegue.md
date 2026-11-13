---
description: Fase 7 — QA final, despliegue en Vercel y distribución de la app
---

# /07-qa-despliegue

Objetivo: dejar todo listo para salir a recolectar.

1. Revisa los criterios de aceptación globales de `docs/SPEC.md` uno por uno y marca ✅/❌ con evidencia (comando, salida o captura).
2. Auditoría de privacidad: busca en el código y en la base cualquier campo o log con IP, user-agent, device id, nombre, correo o matrícula; revisa que no haya scripts de terceros en la web.
3. Revisa que `.env` no esté en git y que `.env.example` esté completo. Genera `README.md` raíz con: arquitectura, variables, comandos, cómo exportar, cómo sincronizar.
4. **Despliegue web:** guía paso a paso (importar el repo en Vercel con raíz `resenias-dashboard/`, variables `TURSO_*`, `SYNC_TOKEN`, `ADMIN_TOKEN`, redeploy) y ejecuta `prueba-api` contra la URL pública.
5. **Código QR:** genera `resenias-dashboard/public/qr.png` (o un script `scripts/generar-qr.mjs`) con la URL pública, y una hoja imprimible (`resenias-dashboard/public/cartel.html`) con el QR, el título y una línea de "2 minutos · anónimo", usando el diseño Blueprint.
6. **App:** instrucciones para (a) usar Expo Go y (b) generar un APK/instalable de prueba con el método gratuito vigente (EAS preview o build local), indicando límites.
7. Lista de verificación previa a la recolección (copiar al `README`): probar web desde un celular real con datos móviles, probar app en modo avión, hacer una exportación de prueba y abrirla en Excel, respaldar el CSV al final de cada día.
8. Commit: `chore: QA y despliegue`.

Termina con el estado final (✅/❌), URLs y lo pendiente para el usuario. Detente.
