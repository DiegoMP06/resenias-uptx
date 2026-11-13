import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from '../resenias-dashboard/node_modules/exceljs/dist/exceljs.js';

// Importar directamente los handlers de la API
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Asegurar variables de entorno para prueba local
process.env.TURSO_DATABASE_URL = 'file:local-test.db';
process.env.SYNC_TOKEN = 'test-sync-token-secret-1234';
process.env.ADMIN_TOKEN = 'test-admin-token-secret-5678';

// Importar módulos
const { POST: postRespuestas } = await import(
  '../resenias-dashboard/src/pages/api/respuestas.ts'
);
const { POST: postSincronizar } = await import(
  '../resenias-dashboard/src/pages/api/sincronizar.ts'
);
const { GET: getResumen } = await import(
  '../resenias-dashboard/src/pages/api/resumen.ts'
);
const { GET: getExportar } = await import(
  '../resenias-dashboard/src/pages/api/exportar.ts'
);
const { getDb, getDbClient, asegurarEsquema } = await import(
  '../resenias-dashboard/src/lib/db.ts'
);

let totalPruebas = 0;
let pruebasExitosas = 0;

function assert(condicion, descripcion) {
  totalPruebas++;
  if (condicion) {
    console.log(`  ✅ ${descripcion}`);
    pruebasExitosas++;
  } else {
    console.error(`  ❌ FALLÓ: ${descripcion}`);
  }
}

async function ejecutarPruebas() {
  console.log('\n🧪 ===================================================');
  console.log('   SUITE DE PRUEBAS AUTOMATIZADAS DE API Y TURSO');
  console.log('===================================================\n');

  // Limpiar base de datos de prueba
  await asegurarEsquema();
  const dbClient = getDbClient();
  await dbClient.execute('DELETE FROM respuestas');

  // -------------------------------------------------------------------
  // 1. CASOS DE ERROR Y VALIDACIÓN
  // -------------------------------------------------------------------
  console.log('--- 1. Validación de Errores y Seguridad ---');

  // 1.1 TI sin TSU
  const reqTiSinTsu = new Request('http://localhost:4321/api/respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      carrera: 'TI',
      tsu: null,
      cuatrimestre: 7,
      respuesta:
        'Mi formación en programación y redes ha sido útil pero faltan proyectos aplicados con empresas de la región.',
      fuente: 'web',
      creadoEn: new Date().toISOString(),
    }),
  });
  const resTiSinTsu = await postRespuestas({ request: reqTiSinTsu });
  assert(resTiSinTsu.status === 400, 'TI sin TSU debe responder 400 Bad Request');

  // 1.2 Industrial con TSU (regla cruzada)
  const reqIndConTsu = new Request('http://localhost:4321/api/respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      carrera: 'INDUSTRIAL',
      tsu: 'IA',
      cuatrimestre: 7,
      respuesta:
        'La formación en control estadístico de procesos y manufactura es pertinente y sólida para la industria automotriz.',
      fuente: 'web',
      creadoEn: new Date().toISOString(),
    }),
  });
  const resIndConTsu = await postRespuestas({ request: reqIndConTsu });
  assert(resIndConTsu.status === 400, 'Carrera Industrial con TSU debe responder 400');

  // 1.3 Respuesta con menos de 40 caracteres
  const reqCorto = new Request('http://localhost:4321/api/respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      carrera: 'INDUSTRIAL',
      tsu: null,
      cuatrimestre: 7,
      respuesta: 'Muy buena escuela.',
      fuente: 'web',
      creadoEn: new Date().toISOString(),
    }),
  });
  const resCorto = await postRespuestas({ request: reqCorto });
  assert(resCorto.status === 400, 'Respuesta menor a 40 caracteres debe responder 400');

  // 1.4 Honeypot lleno
  const idHoneypot = crypto.randomUUID();
  const reqHoneypot = new Request('http://localhost:4321/api/respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: idHoneypot,
      carrera: 'INDUSTRIAL',
      tsu: null,
      cuatrimestre: 7,
      respuesta:
        'Texto legítimo pero enviado por un bot malicioso con el campo trampa activado para la prueba.',
      fuente: 'web',
      creadoEn: new Date().toISOString(),
      sitio: 'http://spam-site.com',
    }),
  });
  const resHoneypot = await postRespuestas({ request: reqHoneypot });
  assert(
    resHoneypot.status === 201,
    'Honeypot lleno debe devolver 201 para engañar al bot',
  );
  const honeypotEnDb = await dbClient.execute({
    sql: 'SELECT COUNT(*) as c FROM respuestas WHERE id = ?',
    args: [idHoneypot],
  });
  assert(
    Number(honeypotEnDb.rows[0].c) === 0,
    'Honeypot NO debe guardar nada en la base de datos',
  );

  // 1.5 Tokens malos
  const reqSyncTokenMalo = new Request('http://localhost:4321/api/sincronizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-incorrecto-xyz',
    },
    body: JSON.stringify({ registros: [] }),
  });
  const resSyncTokenMalo = await postSincronizar({ request: reqSyncTokenMalo });
  assert(resSyncTokenMalo.status === 401, '/api/sincronizar con token malo debe responder 401');

  const reqResumenTokenMalo = new Request('http://localhost:4321/api/resumen', {
    method: 'GET',
    headers: { Authorization: 'Bearer token-incorrecto-xyz' },
  });
  const resResumenTokenMalo = await getResumen({ request: reqResumenTokenMalo });
  assert(resResumenTokenMalo.status === 401, '/api/resumen con token malo debe responder 401');

  const reqExportarTokenMalo = new Request(
    'http://localhost:4321/api/exportar?formato=csv',
    {
      method: 'GET',
      headers: { Authorization: 'Bearer token-incorrecto-xyz' },
    },
  );
  const resExportarTokenMalo = await getExportar({
    request: reqExportarTokenMalo,
    url: new URL('http://localhost:4321/api/exportar?formato=csv'),
  });
  assert(resExportarTokenMalo.status === 401, '/api/exportar con token malo debe responder 401');

  // -------------------------------------------------------------------
  // 2. INSERCIÓN DE 120 REGISTROS POR LOTES DE 50 (SINCRONIZACIÓN)
  // -------------------------------------------------------------------
  console.log('\n--- 2. Lotes de Sincronización (120 registros) ---');

  const registrosTotales = [];
  const carrerasDisponibles = [
    { c: 'INDUSTRIAL', tsu: null },
    { c: 'TI', tsu: 'IA' },
    { c: 'TI', tsu: 'CIENCIA_DATOS' },
    { c: 'MECATRONICA', tsu: null },
    { c: 'QUIMICA', tsu: null },
    { c: 'BIOTECNOLOGIA', tsu: null },
    { c: 'AUTOMOTRIZ', tsu: null },
    { c: 'FINANCIERA', tsu: null },
  ];

  for (let i = 1; i <= 120; i++) {
    const configCarrera = carrerasDisponibles[(i - 1) % carrerasDisponibles.length];
    const uuid = crypto.randomUUID();
    // Simular un alumno que dejó su correo para probar detección de PII en el registro 10
    const extraPii = i === 10 ? ' Mi correo de contacto es alumno10@uptlax.edu.mx' : '';

    registrosTotales.push({
      id: uuid,
      carrera: configCarrera.c,
      tsu: configCarrera.tsu,
      cuatrimestre: (i % 11) + 1,
      respuesta: `Respuesta de prueba #${i}: Considero que la formación académica en la UPTlax está altamente vinculada con el campo laboral industrial, aunque me gustaría mayor práctica en laboratorio.${extraPii}`,
      fuente: i % 2 === 0 ? 'web' : 'app-1',
      creadoEn: new Date(Date.now() - (120 - i) * 60000).toISOString(),
    });
  }

  // Dividir en lotes de 50 (50, 50, 20)
  const lotes = [
    registrosTotales.slice(0, 50),
    registrosTotales.slice(50, 100),
    registrosTotales.slice(100, 120),
  ];

  let totalAceptados = 0;
  for (let idx = 0; idx < lotes.length; idx++) {
    const lote = lotes[idx];
    const reqLote = new Request('http://localhost:4321/api/sincronizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
      },
      body: JSON.stringify({ registros: lote }),
    });

    const resLote = await postSincronizar({ request: reqLote });
    const dataLote = await resLote.json();

    assert(resLote.status === 200, `Lote ${idx + 1} (${lote.length} registros) respondió 200`);
    assert(dataLote.aceptados.length === lote.length, `Lote ${idx + 1} aceptó los ${lote.length} registros`);
    assert(dataLote.rechazados.length === 0, `Lote ${idx + 1} tuvo 0 rechazados`);
    totalAceptados += dataLote.aceptados.length;
  }
  assert(totalAceptados === 120, 'Total de 120 registros aceptados con éxito');

  // Verificar recuento en base de datos
  const countDb1 = await dbClient.execute('SELECT COUNT(*) as c FROM respuestas');
  assert(Number(countDb1.rows[0].c) === 120, 'La base de datos contiene exactamente 120 registros');

  // -------------------------------------------------------------------
  // 3. PRUEBA DE IDEMPOTENCIA (REENVÍO SIN DUPLICAR)
  // -------------------------------------------------------------------
  console.log('\n--- 3. Prueba de Idempotencia por UUID ---');

  for (let idx = 0; idx < lotes.length; idx++) {
    const lote = lotes[idx];
    const reqReenvio = new Request('http://localhost:4321/api/sincronizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
      },
      body: JSON.stringify({ registros: lote }),
    });

    const resReenvio = await postSincronizar({ request: reqReenvio });
    const dataReenvio = await resReenvio.json();
    assert(
      dataReenvio.aceptados.length === lote.length,
      `Reenvío lote ${idx + 1}: el servidor reporta aceptados los registros repetidos`,
    );
  }

  const countDb2 = await dbClient.execute('SELECT COUNT(*) as c FROM respuestas');
  assert(
    Number(countDb2.rows[0].c) === 120,
    'COUNT(*) sigue siendo exactamente 120 (cero duplicados por reenvío)',
  );

  // -------------------------------------------------------------------
  // 4. CONSULTA DE MÉTRICAS (/api/resumen)
  // -------------------------------------------------------------------
  console.log('\n--- 4. Métricas del Sistema (/api/resumen) ---');

  const reqResumen = new Request('http://localhost:4321/api/resumen', {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resResumen = await getResumen({ request: reqResumen });
  const dataResumen = await resResumen.json();

  assert(resResumen.status === 200, '/api/resumen respondió 200');
  assert(dataResumen.total === 120, 'Resumen total reporta 120 registros');
  assert(dataResumen.validos === 120, 'Resumen válidos reporta 120');
  assert(dataResumen.posiblePii >= 1, 'Resumen detectó el registro con posible PII (correo)');
  assert(Array.isArray(dataResumen.porCarrera), 'porCarrera es un arreglo con desglose');
  assert(Array.isArray(dataResumen.porCuatrimestre), 'porCuatrimestre es un arreglo');

  // -------------------------------------------------------------------
  // 5. EXPORTACIÓN CSV (BOM UTF-8, FOLIOS R001..., ACENTOS)
  // -------------------------------------------------------------------
  console.log('\n--- 5. Exportación CSV ---');

  const urlCsv = new URL('http://localhost:4321/api/exportar?formato=csv');
  const reqCsv = new Request(urlCsv.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resCsv = await getExportar({ request: reqCsv, url: urlCsv });

  assert(resCsv.status === 200, '/api/exportar?formato=csv respondió 200');
  assert(
    resCsv.headers.get('Content-Type')?.includes('text/csv'),
    'Content-Type es text/csv',
  );

  const bufferCsv = await resCsv.arrayBuffer();
  const bytesCsv = new Uint8Array(bufferCsv);
  assert(
    bytesCsv[0] === 0xef && bytesCsv[1] === 0xbb && bytesCsv[2] === 0xbf,
    'El archivo CSV inicia con los bytes BOM UTF-8 (0xEF, 0xBB, 0xBF) para compatibilidad con Excel',
  );

  const textoCsv = Buffer.from(bufferCsv).toString('utf-8');
  const lineasCsv = textoCsv.replace(/^\uFEFF/, '').trim().split('\r\n');
  assert(lineasCsv.length === 121, 'CSV contiene 121 líneas (1 encabezado + 120 datos)');

  const primeraFila = lineasCsv[1];
  assert(
    primeraFila.startsWith('R001') || primeraFila.startsWith('"R001"'),
    `Primer registro tiene folio R001 consecutivo (valor: ${primeraFila.slice(0, 10)})`,
  );

  const ultimaFila = lineasCsv[120];
  assert(
    ultimaFila.startsWith('R120') || ultimaFila.startsWith('"R120"'),
    `Último registro tiene folio R120 (valor: ${ultimaFila.slice(0, 10)})`,
  );

  assert(
    textoCsv.includes('formación') && textoCsv.includes('académica'),
    'CSV conserva acentos y caracteres UTF-8 en español íntegros',
  );

  // -------------------------------------------------------------------
  // 6. EXPORTACIÓN XLSX (EXCELJS)
  // -------------------------------------------------------------------
  console.log('\n--- 6. Exportación XLSX (ExcelJS) ---');

  const urlXlsx = new URL('http://localhost:4321/api/exportar?formato=xlsx');
  const reqXlsx = new Request(urlXlsx.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resXlsx = await getExportar({ request: reqXlsx, url: urlXlsx });

  assert(resXlsx.status === 200, '/api/exportar?formato=xlsx respondió 200');
  assert(
    resXlsx.headers
      .get('Content-Type')
      ?.includes(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    'Content-Type es OpenXML Spreadsheet',
  );

  const bufferXlsx = await resXlsx.arrayBuffer();
  assert(bufferXlsx.byteLength > 1000, `Tamaño del archivo XLSX generado: ${bufferXlsx.byteLength} bytes`);

  // Parsear XLSX con ExcelJS para verificar estructura
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bufferXlsx));
  const sheet = workbook.getWorksheet('Respuestas');

  assert(sheet !== undefined, 'El libro XLSX contiene la hoja "Respuestas"');
  assert(sheet.rowCount === 121, `La hoja contiene exactamente 121 filas (1 encabezado + 120 registros)`);

  const celdaA2 = sheet.getCell('A2').value;
  assert(celdaA2 === 'R001', `Celda A2 tiene el folio inicial 'R001' (obtenido: '${celdaA2}')`);

  const celdaA121 = sheet.getCell('A121').value;
  assert(celdaA121 === 'R120', `Celda A121 tiene el folio final 'R120' (obtenido: '${celdaA121}')`);

  const celdaResp = sheet.getCell('E2').value;
  assert(
    typeof celdaResp === 'string' && celdaResp.includes('formación'),
    'Celda de texto abierta conserva acentos en XLSX',
  );

  // -------------------------------------------------------------------
  // RESUMEN FINAL
  // -------------------------------------------------------------------
  console.log('\n===================================================');
  console.log(`TOTAL PRUEBAS: ${totalPruebas}`);
  console.log(`EXITOSAS:      ${pruebasExitosas}`);
  console.log(`FALLIDAS:      ${totalPruebas - pruebasExitosas}`);
  console.log('===================================================\n');

  if (totalPruebas === pruebasExitosas) {
    console.log('🎉 TODAS LAS PRUEBAS PASARON AL 100%');
    process.exit(0);
  } else {
    console.error('❌ HUBO FALLOS EN LA SUITE DE PRUEBAS');
    process.exit(1);
  }
}

ejecutarPruebas().catch((err) => {
  console.error('Error fatal ejecutando pruebas:', err);
  process.exit(1);
});
