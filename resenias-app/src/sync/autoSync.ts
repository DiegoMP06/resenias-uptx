import NetInfo from '@react-native-community/netinfo';
import { repositorio } from '@/db/repositorio';
import { sincronizar } from './clienteSync';

let suscripcionActiva: (() => void) | null = null;
let ultimaEjecucion = 0;

/**
 * Inicia la escucha de eventos de red para auto-sincronizar cuando hay conexión disponible
 * y el usuario tiene activado 'sync_auto' en Ajustes.
 */
export function iniciarSincronizadorAutomatico(): () => void {
  if (suscripcionActiva) {
    return suscripcionActiva;
  }

  const unsubscribe = NetInfo.addEventListener(async (state) => {
    // Solo actuar si está conectado
    if (!state.isConnected || state.isInternetReachable === false) {
      return;
    }

    // Debounce de 10 segundos para evitar disparos múltiples rápidos
    const ahora = Date.now();
    if (ahora - ultimaEjecucion < 10000) {
      return;
    }

    try {
      const ajustes = await repositorio.obtenerAjustes();
      if (ajustes.sync_auto === '1') {
        const conteo = await repositorio.contarPorEstado();
        if (conteo.pendientes > 0 || conteo.errores > 0) {
          ultimaEjecucion = ahora;
          console.log('[AutoSync] Conexión detectada. Iniciando auto-sincronización...');
          await sincronizar();
        }
      }
    } catch (err) {
      console.warn('[AutoSync] Error al verificar auto-sincronización:', err);
    }
  });

  suscripcionActiva = unsubscribe;
  return unsubscribe;
}
