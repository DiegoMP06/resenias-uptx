import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { repositorio, type RegistroLocal } from '@/db/repositorio';
import { etiquetaCarrera, etiquetaTsu } from '@/shared/carreras';

/**
 * Escapa un campo para CSV según la especificación RFC 4180.
 * Si contiene comillas, comas o saltos de línea, se encierra entre comillas dobles
 * y se duplican las comillas internas.
 */
function escaparCampoCsv(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) {
    return '""';
  }
  const str = String(valor);
  const escapado = str.replace(/"/g, '""');
  return `"${escapado}"`;
}

/**
 * Genera un archivo CSV con las respuestas locales guardadas en SQLite y abre el diálogo de compartir.
 */
export async function exportarCsvLocal(): Promise<boolean> {
  try {
    const registros: RegistroLocal[] = await repositorio.listar();

    if (registros.length === 0) {
      Alert.alert(
        'Sin registros',
        'No hay respuestas capturadas en este dispositivo para exportar.'
      );
      return false;
    }

    // Encabezados oficiales del skill:
    // ID_local, Carrera, TSU_Especialidad, Cuatrimestre, Respuesta abierta, Fuente, Fecha, Estado
    const encabezados = [
      'ID_local',
      'Carrera',
      'TSU_Especialidad',
      'Cuatrimestre',
      'Respuesta abierta',
      'Fuente',
      'Fecha',
      'Estado',
    ];

    const filasCsv: string[] = [encabezados.join(',')];

    for (const reg of registros) {
      const fila = [
        escaparCampoCsv(reg.id),
        escaparCampoCsv(etiquetaCarrera(reg.carrera)),
        escaparCampoCsv(reg.tsu ? `${etiquetaTsu(reg.tsu)} (${reg.tsu})` : ''),
        escaparCampoCsv(reg.cuatrimestre),
        escaparCampoCsv(reg.respuesta),
        escaparCampoCsv(reg.fuente),
        escaparCampoCsv(reg.creado_en),
        escaparCampoCsv(reg.estado.toUpperCase()),
      ];
      filasCsv.push(fila.join(','));
    }

    // UTF-8 con BOM (\uFEFF) para que Excel lo abra con acentos correctos
    const contenidoCsv = '\uFEFF' + filasCsv.join('\r\n');

    const fechaStr = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `respuestas_local_${fechaStr}.csv`;
    const rutaArchivo = `${FileSystem.cacheDirectory}${nombreArchivo}`;

    // Escribir archivo temporal
    await FileSystem.writeAsStringAsync(rutaArchivo, contenidoCsv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Compartir mediante expo-sharing
    const disponible = await Sharing.isAvailableAsync();
    if (!disponible) {
      Alert.alert(
        'Exportación guardada',
        `El archivo se generó en el dispositivo:\n${rutaArchivo}\n(La función de compartir no está disponible en este entorno).`
      );
      return true;
    }

    await Sharing.shareAsync(rutaArchivo, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportar respaldo de respuestas locales',
      UTI: 'public.comma-separated-values-text',
    });

    return true;
  } catch (err: any) {
    console.error('Error al exportar CSV local:', err);
    Alert.alert('Error al exportar', err?.message || 'No se pudo generar el archivo CSV.');
    return false;
  }
}
