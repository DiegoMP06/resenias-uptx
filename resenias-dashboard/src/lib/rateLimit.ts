/**
 * Rate limiter en memoria por instancia.
 * Protege el endpoint público contra ráfagas excesivas SIN registrar ni inspeccionar IPs ni datos del usuario.
 */
let peticionesEnVentana = 0;
let inicioVentana = Date.now();
const VENTANA_MS = 60 * 1000;
const LIMITE_MAX = 120;

export function checkRateLimit(): boolean {
  const ahora = Date.now();
  if (ahora - inicioVentana > VENTANA_MS) {
    inicioVentana = ahora;
    peticionesEnVentana = 0;
  }
  if (peticionesEnVentana >= LIMITE_MAX) {
    return false;
  }
  peticionesEnVentana++;
  return true;
}
