import type { APIRoute } from 'astro';
import ExcelJS from 'exceljs';
import { eq, and, asc } from 'drizzle-orm';
import { getDb, asegurarEsquema } from '../../lib/db.ts';
import { respuestas } from '../../db/schema.ts';
import { verificarBearerToken, obtenerAdminToken } from '../../lib/auth.ts';
import { etiquetaCarrera, etiquetaTsu } from '../../shared/carreras.ts';

export const prerender = false;

function escaparCsvCampo(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

export const GET: APIRoute = async ({ request, url }) => {
  const authHeader = request.headers.get('authorization');
  const adminToken = obtenerAdminToken();

  if (!verificarBearerToken(authHeader, adminToken)) {
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const parsedUrl = url || new URL(request.url);
  const formato = (parsedUrl.searchParams.get('formato') || 'csv').toLowerCase();
  const carreraFiltro = parsedUrl.searchParams.get('carrera');
  const incluirDuplicados = parsedUrl.searchParams.get('duplicados') === '1';

  try {
    await asegurarEsquema();
    const db = getDb();

    const condiciones = [];
    if (!incluirDuplicados) {
      condiciones.push(eq(respuestas.posibleDuplicado, 0));
    }
    if (carreraFiltro && carreraFiltro.trim() !== '') {
      condiciones.push(eq(respuestas.carrera, carreraFiltro.trim()));
    }

    let baseQuery = db.select().from(respuestas);
    if (condiciones.length > 0) {
      baseQuery = baseQuery.where(and(...condiciones)) as any;
    }

    const resultados = await baseQuery.orderBy(asc(respuestas.creadoEn));

    // Preparar filas con folio R001...
    const filas = resultados.map((row, index) => {
      const folio = 'R' + String(index + 1).padStart(3, '0');
      const carreraLegible = etiquetaCarrera(String(row.carrera));
      const tsuLegible = row.tsu ? etiquetaTsu(String(row.tsu)) : '';
      const cuatrimestre = Number(row.cuatrimestre);
      const respuesta = String(row.respuesta);
      const fuente = String(row.fuente);
      const fecha = String(row.creadoEn);

      const marcas: string[] = [];
      if (Number(row.posibleDuplicado) === 1) marcas.push('posible_duplicado');
      if (row.posiblePii) marcas.push(`posible_pii:${row.posiblePii}`);
      const revision = marcas.join(',');

      return {
        folio,
        carrera: carreraLegible,
        tsu: tsuLegible,
        cuatrimestre,
        respuesta,
        fuente,
        fecha,
        revision,
      };
    });

    const fechaHoy = new Date().toISOString().slice(0, 10);
    const sufijoCarrera = carreraFiltro ? carreraFiltro.toLowerCase() : 'todas';

    // 1. Exportación CSV con BOM UTF-8
    if (formato === 'csv') {
      const encabezados = [
        'ID',
        'Carrera',
        'TSU_Especialidad',
        'Cuatrimestre',
        'Respuesta abierta',
        'Fuente',
        'Fecha',
        'Revision',
      ];

      const lineasCsv: string[] = [];
      lineasCsv.push(encabezados.map(escaparCsvCampo).join(','));

      for (const f of filas) {
        const filaStr = [
          escaparCsvCampo(f.folio),
          escaparCsvCampo(f.carrera),
          escaparCsvCampo(f.tsu),
          escaparCsvCampo(f.cuatrimestre),
          escaparCsvCampo(f.respuesta),
          escaparCsvCampo(f.fuente),
          escaparCsvCampo(f.fecha),
          escaparCsvCampo(f.revision),
        ].join(',');
        lineasCsv.push(filaStr);
      }

      // BOM UTF-8 (0xEF, 0xBB, 0xBF) binario explícito para compatibilidad universal con Excel
      const bom = Buffer.from([0xef, 0xbb, 0xbf]);
      const cuerpoCsv = Buffer.from(lineasCsv.join('\r\n'), 'utf-8');
      const csvBuffer = Buffer.concat([bom, cuerpoCsv]);
      const filename = `respuestas_${sufijoCarrera}_${fechaHoy}.csv`;

      return new Response(csvBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // 2. Exportación Excel XLSX
    if (formato === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Recolector UPTlax';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Respuestas', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      worksheet.columns = [
        { header: 'ID', key: 'folio', width: 12 },
        { header: 'Carrera', key: 'carrera', width: 36 },
        { header: 'TSU_Especialidad', key: 'tsu', width: 30 },
        { header: 'Cuatrimestre', key: 'cuatrimestre', width: 14 },
        { header: 'Respuesta abierta', key: 'respuesta', width: 65 },
        { header: 'Fuente', key: 'fuente', width: 14 },
        { header: 'Fecha', key: 'fecha', width: 24 },
        { header: 'Revision', key: 'revision', width: 22 },
      ];

      // Estilo de encabezados
      const filaEncabezado = worksheet.getRow(1);
      filaEncabezado.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
      filaEncabezado.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A2336' },
      };
      filaEncabezado.alignment = { vertical: 'middle', horizontal: 'center' };
      filaEncabezado.height = 28;

      // Filas de datos
      for (const f of filas) {
        const row = worksheet.addRow({
          folio: f.folio,
          carrera: f.carrera,
          tsu: f.tsu,
          cuatrimestre: f.cuatrimestre,
          respuesta: f.respuesta,
          fuente: f.fuente,
          fecha: f.fecha,
          revision: f.revision,
        });

        row.alignment = { vertical: 'top', wrapText: true };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `respuestas_${sufijoCarrera}_${fechaHoy}.xlsx`;

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    return new Response(
      JSON.stringify({ ok: false, mensaje: 'Formato no soportado. Usa csv o xlsx' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error al exportar:', error);
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'Error al generar archivo de exportación' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
