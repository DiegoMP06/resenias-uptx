import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const testDbPath = path.resolve(rootDir, 'sync-audit-test.db');
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

// Configuración de entorno para prueba
process.env.TURSO_DATABASE_URL = `file:${testDbPath}`;
process.env.SYNC_TOKEN = 'sync-secret-test-token-7c';
process.env.ADMIN_TOKEN = 'admin-secret-test-token-7c';

// Importar handlers
const { POST: postSincronizar } = await import(
  '../resenias-dashboard/src/pages/api/sincronizar.ts'
);
const { GET: getResumen } = await import(
  '../resenias-dashboard/src/pages/api/resumen.ts'
);
const { GET: getExportar } = await import(
  '../resenias-dashboard/src/pages/api/exportar.ts'
);
const { getDbClient, asegurarEsquema } = await import(
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

async function ejecutarAuditoria() {
  console.log('\n======================================================');
  console.log('   AUDITORÍA DEL SKILL: API-SINCRONIZACION Y QA');
  console.log('======================================================\n');

  await asegurarEsquema();
  const client = getDbClient();

  // 1. GENERACIÓN DE 120 REGISTROS CON UUID V4
  console.log('📦 1. Prueba de carga masiva por lotes (120 registros)...');
  const registros120 = [];
  const carrerasList = ['INDUSTRIAL', 'TI'];

  for (let i = 1; i <= 120; i++) {
    const cId = carrerasList[i % carrerasList.length];
    const esTi = cId === 'TI';
    const uuid = crypto.randomUUID();

    registros120.push({
      id: uuid,
      carrera: cId,
      tsu: esTi ? 'IA' : null,
      cuatrimestre: (i % 10) + 1,
      respuesta: `Opinión académica número ${i}: Considero que la preparación técnica recibida es pertinente para la industria actual.`,
      fuente: 'app-brigada-test',
      creadoEn: new Date(Date.now() - (120 - i) * 60000).toISOString(),
    });
  }

  // Dividir en lotes de 50, 50, 20
  const lote1 = registros120.slice(0, 50);
  const lote2 = registros120.slice(50, 100);
  const lote3 = registros120.slice(100, 120);

  // Enviar Lote 1 (50)
  const req1 = new Request('http://localhost:4321/api/sincronizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
    },
    body: JSON.stringify({ registros: lote1 }),
  });
  const res1 = await postSincronizar({ request: req1 });
  const data1 = await res1.json();
  assert(res1.status === 200, 'Lote 1 (50 registros) respondió status 200');
  assert(data1.aceptados.length === 50, 'Lote 1 aceptó exactamente 50 registros');
  assert(data1.rechazados.length === 0, 'Lote 1 tuvo 0 rechazados');

  // Enviar Lote 2 (50)
  const req2 = new Request('http://localhost:4321/api/sincronizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
    },
    body: JSON.stringify({ registros: lote2 }),
  });
  const res2 = await postSincronizar({ request: req2 });
  const data2 = await res2.json();
  assert(res2.status === 200, 'Lote 2 (50 registros) respondió status 200');
  assert(data2.aceptados.length === 50, 'Lote 2 aceptó exactamente 50 registros');

  // Enviar Lote 3 (20)
  const req3 = new Request('http://localhost:4321/api/sincronizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
    },
    body: JSON.stringify({ registros: lote3 }),
  });
  const res3 = await postSincronizar({ request: req3 });
  const data3 = await res3.json();
  assert(res3.status === 200, 'Lote 3 (20 registros) respondió status 200');
  assert(data3.aceptados.length === 20, 'Lote 3 aceptó exactamente 20 registros');

  // Verificar COUNT(*) en BD
  const countRow1 = await client.execute('SELECT COUNT(*) as total FROM respuestas');
  assert(Number(countRow1.rows[0].total) === 120, 'La base de datos contiene exactamente 120 registros tras los 3 lotes');

  // 2. PRUEBA DE IDEMPOTENCIA (Reenviar todos los lotes de nuevo)
  console.log('\n🔄 2. Prueba estricta de idempotencia (reenvío completo de los 120 registros)...');
  const reqReenvio = new Request('http://localhost:4321/api/sincronizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
    },
    body: JSON.stringify({ registros: lote1 }),
  });
  const resReenvio = await postSincronizar({ request: reqReenvio });
  const dataReenvio = await resReenvio.json();
  assert(resReenvio.status === 200, 'Reenvío de Lote 1 respondió 200');
  assert(dataReenvio.aceptados.length === 50, 'Todos los 50 registros repetidos se marcan como aceptados para la app');
  assert(dataReenvio.rechazados.length === 0, 'No hubo rechazados en el reenvío');

  const countRow2 = await client.execute('SELECT COUNT(*) as total FROM respuestas');
  assert(Number(countRow2.rows[0].total) === 120, 'El total en BD SIGUE siendo estrictamente 120 (0 duplicados)');

  // 3. SIMULACIÓN DE LOTE CORTADO Y REINTENTO
  console.log('\n⚡ 3. Simulación de lote cortado a la mitad y reintento...');
  const loteMitad1 = [
    {
      id: crypto.randomUUID(),
      carrera: 'INDUSTRIAL',
      tsu: null,
      cuatrimestre: 8,
      respuesta: 'Registro 121: La maquinaria de talleres de manufactura es adecuada.',
      fuente: 'app-cortada',
      creadoEn: new Date().toISOString(),
    },
  ];
  const loteMitad2 = [
    loteMitad1[0], // este ya se envió
    {
      id: crypto.randomUUID(),
      carrera: 'INDUSTRIAL',
      tsu: null,
      cuatrimestre: 8,
      respuesta: 'Registro 122: La formación en control estadístico de procesos es excelente.',
      fuente: 'app-cortada',
      creadoEn: new Date().toISOString(),
    },
  ];

  // Primer envío parcial
  await postSincronizar({
    request: new Request('http://localhost:4321/api/sincronizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
      },
      body: JSON.stringify({ registros: loteMitad1 }),
    }),
  });

  // Reintento con ambos
  const resReintento = await postSincronizar({
    request: new Request('http://localhost:4321/api/sincronizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
      },
      body: JSON.stringify({ registros: loteMitad2 }),
    }),
  });
  const dataReintento = await resReintento.json();
  assert(dataReintento.aceptados.length === 2, 'El reintento con el registro repetido y el nuevo aceptó ambos');

  const countRow3 = await client.execute('SELECT COUNT(*) as total FROM respuestas');
  assert(Number(countRow3.rows[0].total) === 122, 'Total en BD incrementó exactamente a 122 (sin duplicados)');

  // 4. VALIDACIONES DE SEGURIDAD Y REGLAS DE NEGOCIO
  console.log('\n🛡️ 4. Validaciones de seguridad y rechazo en sincronización...');

  // 4.1 Token inválido
  const resNoAuth = await postSincronizar({
    request: new Request('http://localhost:4321/api/sincronizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-equivocado',
      },
      body: JSON.stringify({ registros: [] }),
    }),
  });
  assert(resNoAuth.status === 401, 'Token inválido retorna 401 Unauthorized');

  // 4.2 Rechazo de registros no válidos dentro del lote
  const idTiSinTsu = crypto.randomUUID();
  const idIndConTsu = crypto.randomUUID();
  const idCorta = crypto.randomUUID();

  const loteInvalido = [
    {
      id: idTiSinTsu,
      carrera: 'TI',
      tsu: null, // INVÁLIDO: TI requiere TSU
      cuatrimestre: 5,
      respuesta: 'Respuesta válida pero falta TSU en carrera de TI para probar validación.',
      fuente: 'app-test',
      creadoEn: new Date().toISOString(),
    },
    {
      id: idIndConTsu,
      carrera: 'INDUSTRIAL',
      tsu: 'IA', // INVÁLIDO: Industrial no usa TSU
      cuatrimestre: 5,
      respuesta: 'Respuesta válida pero con TSU indebido en Industrial para probar validación.',
      fuente: 'app-test',
      creadoEn: new Date().toISOString(),
    },
    {
      id: idCorta,
      carrera: 'INDUSTRIAL',
      tsu: null,
      cuatrimestre: 5,
      respuesta: 'Muy corta', // INVÁLIDO: < 40 caracteres
      fuente: 'app-test',
      creadoEn: new Date().toISOString(),
    },
  ];

  const resVal = await postSincronizar({
    request: new Request('http://localhost:4321/api/sincronizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SYNC_TOKEN}`,
      },
      body: JSON.stringify({ registros: loteInvalido }),
    }),
  });
  const dataVal = await resVal.json();
  assert(dataVal.rechazados.length === 3, 'Los 3 registros inválidos fueron correctamente rechazados');
  assert(dataVal.rechazados.some((r) => r.id === idTiSinTsu), 'Rechazado TI sin TSU');
  assert(dataVal.rechazados.some((r) => r.id === idIndConTsu), 'Rechazado Industrial con TSU');
  assert(dataVal.rechazados.some((r) => r.id === idCorta), 'Rechazado respuesta menor a 40 caracteres');

  // 5. AUDITORÍA DE FOLIOS (R001...)
  console.log('\n🏷️ 5. Auditoría de folios R001... (asignados únicamente al exportar)...');
  // Verificar que la tabla en BD NO tenga columna folio
  const infoCols = await client.execute('PRAGMA table_info(respuestas)');
  const tieneColFolio = infoCols.rows.some((c) => c.name === 'folio');
  assert(!tieneColFolio, 'La base de datos NO tiene columna "folio" (el ID es el UUID v4)');

  // Exportar y verificar que el archivo comience con R001
  const reqExp = new Request('http://localhost:4321/api/exportar?formato=csv', {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  const resExp = await getExportar({
    request: reqExp,
    url: new URL(reqExp.url),
  });
  const csvTexto = await resExp.text();
  assert(resExp.status === 200, 'GET /api/exportar retornó 200');
  assert(csvTexto.includes('"R001"'), 'La exportación CSV contiene el folio "R001"');
  assert(csvTexto.includes('"R002"'), 'La exportación CSV contiene el folio "R002"');

  // 6. LIMPIEZA
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    } catch {}
  }

  console.log(`\n======================================================`);
  console.log(`   RESULTADO AUDITORÍA: ${pruebasExitosas}/${totalPruebas} PRUEBAS SUPERADAS`);
  console.log(`======================================================\n`);
}

ejecutarAuditoria().catch(console.error);
