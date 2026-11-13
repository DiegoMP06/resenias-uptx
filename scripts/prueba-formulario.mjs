import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Importar contratos oficiales desde el shared de dashboard donde están instaladas las dependencias
import {
  PREGUNTA_OFICIAL,
  TEXTO_CONSENTIMIENTO,
  ETIQUETA_CONSENTIMIENTO,
} from '../resenias-dashboard/src/shared/pregunta.ts';
import {
  formularioSchema,
  formularioARegistro,
} from '../resenias-dashboard/src/shared/schema.ts';

// Configurar entorno local de prueba
process.env.TURSO_DATABASE_URL = 'file:local-test-form.db';
const { POST: postRespuestas } = await import(
  '../resenias-dashboard/src/pages/api/respuestas.ts'
);
const { getDb, getDbClient, asegurarEsquema } = await import(
  '../resenias-dashboard/src/lib/db.ts'
);
const { respuestas } = await import(
  '../resenias-dashboard/src/db/schema.ts'
);
const { count, eq } = await import(
  '../resenias-dashboard/node_modules/drizzle-orm/index.js'
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
  console.log('   AUDITORÍA Y PRUEBAS DEL FORMULARIO WEB (/03-web-formulario)');
  console.log('========================================================\n');

  // 1. COMPARACIÓN ESTRICTA DE LA PREGUNTA OFICIAL
  console.log('--- 1. Integridad de la Pregunta Oficial ---');
  const archivoComponente = fs.readFileSync(
    path.join(
      rootDir,
      'resenias-dashboard',
      'src',
      'components',
      'FormularioRespuesta.tsx',
    ),
    'utf-8',
  );

  assert(
    archivoComponente.includes('{PREGUNTA_OFICIAL}'),
    'El componente FormularioRespuesta usa la constante {PREGUNTA_OFICIAL} directamente de contracts',
  );
  assert(
    archivoComponente.includes('{TEXTO_CONSENTIMIENTO}'),
    'El componente usa la constante {TEXTO_CONSENTIMIENTO} oficial',
  );
  assert(
    archivoComponente.includes('{ETIQUETA_CONSENTIMIENTO}'),
    'El componente usa la constante {ETIQUETA_CONSENTIMIENTO} oficial',
  );

  // Asegurar que no hay textos sugeridos o placeholders que induzcan ideas
  assert(
    !archivoComponente.toLowerCase().includes('por ejemplo:') &&
      !archivoComponente.toLowerCase().includes('ejemplo:'),
    'No se agregan ejemplos que induzcan respuestas en el formulario (requisito de la actividad)',
  );

  // 2. VALIDACIÓN DEL ESQUEMA DEL CLIENTE (RHF + Zod)
  console.log('\n--- 2. Validación de Entrada del Formulario ---');

  // Caso: Alumno de TI sin TSU
  const intentoTiSinTsu = formularioSchema.safeParse({
    consentimiento: true,
    carrera: 'TI',
    tsu: '',
    cuatrimestre: '7',
    respuesta:
      'Desde mi perspectiva la formación técnica es buena pero requiere más horas de laboratorio especializado.',
  });
  assert(
    !intentoTiSinTsu.success,
    'formularioSchema rechaza carrera TI si no se seleccionó TSU',
  );

  // Caso: Alumno de Industrial con TSU (no permitido)
  const intentoIndConTsu = formularioSchema.safeParse({
    consentimiento: true,
    carrera: 'INDUSTRIAL',
    tsu: 'IA',
    cuatrimestre: '7',
    respuesta:
      'Las materias de control de calidad y manufactura esbelta son de gran utilidad profesional.',
  });
  assert(
    !intentoIndConTsu.success,
    'formularioSchema rechaza carrera no-TI con TSU seleccionado',
  );

  // Caso: Sin consentimiento
  const intentoSinConsentimiento = formularioSchema.safeParse({
    consentimiento: false,
    carrera: 'INDUSTRIAL',
    tsu: '',
    cuatrimestre: '7',
    respuesta:
      'Las materias de control de calidad y manufactura esbelta son de gran utilidad profesional.',
  });
  assert(
    !intentoSinConsentimiento.success,
    'formularioSchema exige consentimiento obligatorio',
  );

  // Caso: Respuesta válida completa
  const intentoValido = formularioSchema.safeParse({
    consentimiento: true,
    carrera: 'TI',
    tsu: 'IA',
    cuatrimestre: '7',
    respuesta:
      'Considero que las materias de desarrollo y bases de datos están muy relacionadas con el trabajo, pero se debería profundizar en arquitecturas en la nube y despliegue real.',
    sitio: '',
  });
  assert(
    intentoValido.success,
    'formularioSchema acepta entrada de TI con TSU válido y > 40 caracteres',
  );

  // 3. ENVÍO REAL A LA BASE DE DATOS TURSO (Drizzle)
  console.log('\n--- 3. Flujo de Envío a la Base de Datos (/api/respuestas) ---');
  await asegurarEsquema();
  const db = getDb();
  const dbClient = getDbClient();
  await dbClient.execute('DELETE FROM respuestas');

  const nuevoUuid = crypto.randomUUID();
  const fechaIso = new Date().toISOString();
  const valoresForm = intentoValido.data;
  const registroParaApi = formularioARegistro(valoresForm, {
    id: nuevoUuid,
    fuente: 'web',
    creadoEn: fechaIso,
  });

  const reqEnvio = new Request('http://localhost:4321/api/respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registroParaApi),
  });

  const resEnvio = await postRespuestas({ request: reqEnvio });
  const dataEnvio = await resEnvio.json();

  assert(resEnvio.status === 201, 'POST /api/respuestas responde 201 Created');
  assert(dataEnvio.ok === true && dataEnvio.id === nuevoUuid, 'Respuesta retorna { ok: true, id }');

  // Comprobar que el registro existe en Turso/Drizzle
  const enDb = await db
    .select()
    .from(respuestas)
    .where(eq(respuestas.id, nuevoUuid));

  assert(enDb.length === 1, 'El registro fue persistido correctamente en la tabla respuestas');
  assert(enDb[0].fuente === 'web', 'La fuente registrada es exactamente "web"');
  assert(enDb[0].carrera === 'TI', 'Carrera coincide');
  assert(enDb[0].tsu === 'IA', 'TSU coincide');
  assert(enDb[0].hash.length === 64, 'Se generó un hash SHA-256 de 64 caracteres');

  // 4. REINTENTO IDEMPOTENTE (SIMULACIÓN DE REINTENTO POR RED)
  console.log('\n--- 4. Prueba de Reintento Idempotente ---');
  const reqReintento = new Request('http://localhost:4321/api/respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registroParaApi),
  });

  const resReintento = await postRespuestas({ request: reqReintento });
  const dataReintento = await resReintento.json();

  assert(
    resReintento.status === 200 && dataReintento.repetido === true,
    'Reenvío con el mismo UUID responde 200 con { repetido: true } sin fallar',
  );

  const conteoFilas = await db.select({ c: count() }).from(respuestas);
  assert(
    Number(conteoFilas[0].c) === 1,
    'La base de datos sigue teniendo 1 sola fila (cero duplicados por reintento de red)',
  );

  // ---------------------------------------------------------
  // RESULTADO
  // ---------------------------------------------------------
  console.log('\n========================================================');
  console.log(`TOTAL PRUEBAS: ${totalPruebas}`);
  console.log(`EXITOSAS:      ${exitosas}`);
  console.log(`FALLIDAS:      ${totalPruebas - exitosas}`);
  console.log('========================================================\n');

  if (totalPruebas === exitosas) {
    console.log('🎉 TODAS LAS VERIFICACIONES DEL FORMULARIO WEB PASARON AL 100%');
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
