import crypto from 'node:crypto';
import ExcelJS from '../resenias-dashboard/node_modules/exceljs/dist/exceljs.js';

// Configuración de entorno
process.env.TURSO_DATABASE_URL = 'file:local-test-admin.db';
process.env.ADMIN_TOKEN = 'token-admin-secreto-uptlax-9999';

// Importar endpoints y DB
const { GET: getResumen } = await import(
  '../resenias-dashboard/src/pages/api/resumen.ts'
);
const { GET: getExportar } = await import(
  '../resenias-dashboard/src/pages/api/exportar.ts'
);
const { guardarRespuesta } = await import(
  '../resenias-dashboard/src/lib/respuestas.ts'
);
const { getDbClient, asegurarEsquema } = await import(
  '../resenias-dashboard/src/lib/db.ts'
);

let totalPruebas = 0;
let exitosas = 0;

function assert(condicion, descripcion) {
  totalPruebas++;
  if (condicion) {
    console.log(`  ✅ ${descripcion}`);
    exitosas++;
  } else {
    console.error(`  ❌ FALLÓ: ${descripcion}`);
  }
}

async function ejecutar() {
  console.log('\n🧪 ========================================================');
  console.log('   AUDITORÍA DEL PANEL ADMIN Y EXPORTACIÓN (/04-admin)');
  console.log('========================================================\n');

  await asegurarEsquema();
  const dbClient = getDbClient();
  await dbClient.execute('DELETE FROM respuestas');

  // 1. SEGURIDAD: CONTROL DE ACCESO SIN TOKEN O CON TOKEN MALO
  console.log('--- 1. Seguridad y Autenticación del Panel ---');

  // Sin header de autorización
  const reqSinAuth = new Request('http://localhost:4321/api/resumen');
  const resSinAuth = await getResumen({ request: reqSinAuth });
  assert(resSinAuth.status === 401, '/api/resumen sin token devuelve 401 Unauthorized');

  // Con token inválido
  const reqTokenMalo = new Request('http://localhost:4321/api/resumen', {
    headers: { Authorization: 'Bearer token-falso-xyz' },
  });
  const resTokenMalo = await getResumen({ request: reqTokenMalo });
  assert(resTokenMalo.status === 401, '/api/resumen con token falso devuelve 401 Unauthorized');

  // Con token válido
  const reqAuthValido = new Request('http://localhost:4321/api/resumen', {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resAuthValido = await getResumen({ request: reqAuthValido });
  assert(resAuthValido.status === 200, '/api/resumen con ADMIN_TOKEN válido responde 200 OK');

  // 2. INSERCIÓN DE DATOS DE PRUEBA (LIMPIOS, DUPLICADOS Y PII)
  console.log('\n--- 2. Registro de Datos y Detección de Alertas ---');

  const textoBase =
    'La formación recibida en materias técnicas y de procesos resulta pertinente para la industria del estado de Tlaxcala.';

  // Registro 1: Limpio (Industrial)
  await guardarRespuesta({
    id: crypto.randomUUID(),
    carrera: 'INDUSTRIAL',
    tsu: null,
    cuatrimestre: 7,
    respuesta: textoBase,
    fuente: 'web',
    creadoEn: '2026-11-10T10:00:00.000Z',
  });

  // Registro 2: Posible duplicado de contenido (mismo texto base)
  await guardarRespuesta({
    id: crypto.randomUUID(),
    carrera: 'INDUSTRIAL',
    tsu: null,
    cuatrimestre: 8,
    respuesta: textoBase,
    fuente: 'app-1',
    creadoEn: '2026-11-10T11:00:00.000Z',
  });

  // Registro 3: Con posible PII (correo electrónico de contacto)
  await guardarRespuesta({
    id: crypto.randomUUID(),
    carrera: 'TI',
    tsu: 'IA',
    cuatrimestre: 7,
    respuesta:
      'Considero que las materias de redes e inteligencia artificial son indispensables. Mi correo es diego@uptlax.edu.mx.',
    fuente: 'web',
    creadoEn: '2026-11-10T12:00:00.000Z',
  });

  // Registro 4: Limpio (TI - Ciencia de Datos)
  await guardarRespuesta({
    id: crypto.randomUUID(),
    carrera: 'TI',
    tsu: 'CIENCIA_DATOS',
    cuatrimestre: 4,
    respuesta:
      'Las prácticas de minería de datos y estadística matemática aportan mucho valor al perfil egresado.',
    fuente: 'web',
    creadoEn: '2026-11-10T13:00:00.000Z',
  });

  // 3. CONSULTA DE MÉTRICAS Y LISTA DE REVISIÓN EN /api/resumen
  console.log('\n--- 3. Métricas y Registros Marcados para Supervisión ---');

  const reqResumen = new Request('http://localhost:4321/api/resumen', {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resResumen = await getResumen({ request: reqResumen });
  const dataResumen = await resResumen.json();

  assert(dataResumen.total === 4, 'Resumen contabiliza 4 registros en total');
  assert(dataResumen.validos === 3, 'Resumen contabiliza 3 registros válidos (sin duplicado)');
  assert(dataResumen.posiblesDuplicados === 1, 'Resumen detectó 1 posible duplicado');
  assert(dataResumen.posiblePii === 1, 'Resumen detectó 1 registro con PII');
  assert(Array.isArray(dataResumen.marcados), 'Resumen incluye arreglo "marcados" para revisión');
  assert(dataResumen.marcados.length === 2, 'Hay exactamente 2 registros para revisión manual (1 dup, 1 pii)');

  const tieneAlertaDup = dataResumen.marcados.some((m) => m.posibleDuplicado === 1);
  const tieneAlertaPii = dataResumen.marcados.some((m) => m.posiblePii?.includes('correo'));
  assert(tieneAlertaDup, 'Lista de revisión contiene el registro marcado con DUPLICADO');
  assert(tieneAlertaPii, 'Lista de revisión contiene el registro marcado con PII:correo');

  // 4. EXPORTACIÓN SEGURA CSV
  console.log('\n--- 4. Exportación Segura de CSV (BOM, Folios, Acentos) ---');

  const urlCsv = new URL('http://localhost:4321/api/exportar?formato=csv&duplicados=0');
  const reqCsv = new Request(urlCsv.toString(), {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resCsv = await getExportar({ request: reqCsv, url: urlCsv });

  assert(resCsv.status === 200, 'Descarga CSV responde 200 OK con autorización');
  const bufCsv = await resCsv.arrayBuffer();
  const bytesCsv = new Uint8Array(bufCsv);
  assert(
    bytesCsv[0] === 0xef && bytesCsv[1] === 0xbb && bytesCsv[2] === 0xbf,
    'El archivo CSV inicia con BOM UTF-8 (0xEF, 0xBB, 0xBF)',
  );

  const textoCsv = Buffer.from(bufCsv).toString('utf-8');
  assert(
    textoCsv.includes('R001') && textoCsv.includes('formación') && textoCsv.includes('prácticas'),
    'El CSV contiene el folio inicial R001 y preserva acentos y caracteres UTF-8 en español',
  );

  // 5. EXPORTACIÓN SEGURA EXCEL XLSX
  console.log('\n--- 5. Exportación Segura de Excel XLSX ---');

  const urlXlsx = new URL('http://localhost:4321/api/exportar?formato=xlsx&duplicados=1');
  const reqXlsx = new Request(urlXlsx.toString(), {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resXlsx = await getExportar({ request: reqXlsx, url: urlXlsx });

  assert(resXlsx.status === 200, 'Descarga XLSX responde 200 OK con autorización');
  const bufXlsx = await resXlsx.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(bufXlsx));
  const sheet = wb.getWorksheet('Respuestas');

  assert(sheet !== undefined, 'El archivo Excel contiene la hoja "Respuestas"');
  assert(sheet.rowCount === 5, 'El archivo Excel contiene 5 filas (1 encabezado + 4 registros con duplicados incluidos)');
  assert(sheet.getCell('A2').value === 'R001', 'Primera fila de datos tiene folio R001');

  // Limpiar base de prueba
  await dbClient.execute('DELETE FROM respuestas');

  // ---------------------------------------------------------
  // RESULTADO FINAL
  // ---------------------------------------------------------
  console.log('\n========================================================');
  console.log(`TOTAL PRUEBAS: ${totalPruebas}`);
  console.log(`EXITOSAS:      ${exitosas}`);
  console.log(`FALLIDAS:      ${totalPruebas - exitosas}`);
  console.log('========================================================\n');

  if (totalPruebas === exitosas) {
    console.log('🎉 TODAS LAS VERIFICACIONES DEL PANEL ADMIN PASARON AL 100%');
    process.exit(0);
  } else {
    console.error('❌ HUBO FALLAS EN LA AUDITORÍA');
    process.exit(1);
  }
}

ejecutar().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
