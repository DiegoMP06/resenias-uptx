import NetInfo from '@react-native-community/netinfo';
import { repositorio, type RegistroLocal } from '@/db/repositorio';

export interface ProgresoSync {
  enviados: number;
  total: number;
  loteActual: number;
  totalLotes: number;
}

export interface ResultadoSync {
  ok: boolean;
  totalLotes: number;
  totalAceptados: number;
  totalRechazados: number;
  error?: string;
}

// Candado en memoria para evitar doble ejecución concurrente
let sincronizando = false;

/**
 * Espera los milisegundos especificados (para backoff exponencial).
 */
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ejecuta la sincronización de registros locales pendientes o con error contra la API remota.
 */
export async function sincronizar(
  onProgreso?: (progreso: ProgresoSync) => void
): Promise<ResultadoSync> {
  if (sincronizando) {
    return {
      ok: false,
      totalLotes: 0,
      totalAceptados: 0,
      totalRechazados: 0,
      error: 'Ya hay una sincronización en curso.',
    };
  }

  sincronizando = true;

  try {
    // 1. Verificar conectividad de red inicial
    const estadoRed = await NetInfo.fetch();
    if (!estadoRed.isConnected || estadoRed.isInternetReachable === false) {
      return {
        ok: false,
        totalLotes: 0,
        totalAceptados: 0,
        totalRechazados: 0,
        error: 'Sin conexión a internet disponible.',
      };
    }

    // 2. Obtener ajustes configurados
    const ajustes = await repositorio.obtenerAjustes();
    const apiUrl = ajustes.api_url?.trim().replace(/\/+$/, '');
    const syncToken = ajustes.sync_token?.trim();

    if (!apiUrl) {
      return {
        ok: false,
        totalLotes: 0,
        totalAceptados: 0,
        totalRechazados: 0,
        error: 'URL del servidor no configurada. Ve a Ajustes para ingresarla.',
      };
    }

    if (!syncToken) {
      return {
        ok: false,
        totalLotes: 0,
        totalAceptados: 0,
        totalRechazados: 0,
        error: 'Token de sincronización (SYNC_TOKEN) no configurado en Ajustes.',
      };
    }

    let totalAceptados = 0;
    let totalRechazados = 0;
    let loteNumero = 0;

    // Conteo inicial de registros por enviar
    const conteoEstados = await repositorio.contarPorEstado();
    const totalPorEnviar = conteoEstados.pendientes + conteoEstados.errores;

    if (totalPorEnviar === 0) {
      return {
        ok: true,
        totalLotes: 0,
        totalAceptados: 0,
        totalRechazados: 0,
      };
    }

    const totalLotesEstimados = Math.ceil(totalPorEnviar / 50);

    // 3. Procesar en lotes de hasta 50 registros
    while (true) {
      const lote: RegistroLocal[] = await repositorio.obtenerPendientes(50);
      if (lote.length === 0) {
        break;
      }

      loteNumero++;
      onProgreso?.({
        enviados: totalAceptados,
        total: totalPorEnviar,
        loteActual: loteNumero,
        totalLotes: totalLotesEstimados,
      });

      // Mapear al esquema esperado por la API (campo creadoEn en camelCase)
      const payloadRegistros = lote.map((reg) => ({
        id: reg.id,
        carrera: reg.carrera,
        tsu: reg.tsu,
        cuatrimestre: reg.cuatrimestre,
        respuesta: reg.respuesta,
        fuente: reg.fuente,
        creadoEn: reg.creado_en,
      }));

      // Intentar enviar el lote con hasta 3 reintentos y espera exponencial
      const maxReintentos = 3;
      let exitoLote = false;
      let ultimoError = '';

      for (let intento = 1; intento <= maxReintentos; intento++) {
        // Verificar red antes de cada intento
        const checkRed = await NetInfo.fetch();
        if (!checkRed.isConnected) {
          ultimoError = 'Conexión a internet perdida durante el envío.';
          break;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 s timeout

        try {
          const resp = await fetch(`${apiUrl}/api/sincronizar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${syncToken}`,
            },
            body: JSON.stringify({ registros: payloadRegistros }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (resp.status === 401) {
            return {
              ok: false,
              totalLotes: loteNumero,
              totalAceptados,
              totalRechazados,
              error: 'Token de sincronización inválido o no autorizado por el servidor.',
            };
          }

          if (!resp.ok) {
            const errorTxt = await resp.text().catch(() => '');
            throw new Error(`El servidor respondió con código ${resp.status}: ${errorTxt}`);
          }

          const resultadoJson = await resp.json();

          // El servidor devuelve { ok: true, aceptados: string[], rechazados: { id, motivo }[] }
          const aceptados: string[] = resultadoJson.aceptados || [];
          const rechazados: Array<{ id: string; motivo: string }> = resultadoJson.rechazados || [];

          // Marcar aceptados como enviados (NUNCA se borran)
          if (aceptados.length > 0) {
            await repositorio.marcarEnviados(aceptados);
            totalAceptados += aceptados.length;
          }

          // Marcar rechazados con su motivo de error
          if (rechazados.length > 0) {
            for (const item of rechazados) {
              await repositorio.marcarError(item.id, item.motivo);
            }
            totalRechazados += rechazados.length;
          }

          exitoLote = true;
          break; // Salir del ciclo de reintentos
        } catch (err: any) {
          clearTimeout(timeoutId);
          const esAbort = err?.name === 'AbortError';
          ultimoError = esAbort
            ? 'Tiempo de espera agotado (timeout 20s)'
            : err?.message || 'Error de red';

          if (intento < maxReintentos) {
            // Espera exponencial: 1s, 2s, 4s
            await esperar(Math.pow(2, intento - 1) * 1000);
          }
        }
      }

      // Si después de los 3 intentos falló el lote completo, marcar error a los registros y detener
      if (!exitoLote) {
        for (const reg of lote) {
          await repositorio.marcarError(reg.id, `Fallo de envío tras 3 intentos: ${ultimoError}`);
        }
        return {
          ok: false,
          totalLotes: loteNumero,
          totalAceptados,
          totalRechazados,
          error: `Error al sincronizar lote ${loteNumero}: ${ultimoError}`,
        };
      }
    }

    onProgreso?.({
      enviados: totalAceptados,
      total: totalPorEnviar,
      loteActual: totalLotesEstimados,
      totalLotes: totalLotesEstimados,
    });

    return {
      ok: true,
      totalLotes: loteNumero,
      totalAceptados,
      totalRechazados,
    };
  } finally {
    sincronizando = false;
  }
}
