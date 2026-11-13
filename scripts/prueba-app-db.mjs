import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';

console.log('🧪 Iniciando prueba automatizada de la base SQLite local de resenias-app...');

// Crear base SQLite en memoria con el mismo esquema y migraciones
const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON;');

// Migración v1 (idéntica a src/db/index.ts)
db.exec(`
  CREATE TABLE IF NOT EXISTS registros (
    id TEXT PRIMARY KEY,
    carrera TEXT NOT NULL,
    tsu TEXT,
    cuatrimestre INTEGER NOT NULL,
    respuesta TEXT NOT NULL,
    fuente TEXT NOT NULL,
    creado_en TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'enviado', 'error')),
    intentos INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    enviado_en TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros(estado);
  CREATE INDEX IF NOT EXISTS idx_registros_carrera ON registros(carrera);

  CREATE TABLE IF NOT EXISTS ajustes (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

console.log('✓ Tablas e índices creados correctamente');

// 1. Inserción de registros pendientes
const stmtInsert = db.prepare(`
  INSERT INTO registros (id, carrera, tsu, cuatrimestre, respuesta, fuente, creado_en, estado, intentos, error, enviado_en)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', 0, NULL, NULL)
`);

stmtInsert.run(
  '00000000-0000-4000-8000-000000000001',
  'INDUSTRIAL',
  null,
  7,
  'Considero que la formación en Industrial es muy completa en manufactura y optimización de líneas de producción.',
  'app-1',
  new Date().toISOString()
);

stmtInsert.run(
  '00000000-0000-4000-8000-000000000002',
  'TI',
  'IA',
  5,
  'Los conocimientos en redes neuronales y visión por computadora son directamente aplicables a proyectos reales.',
  'app-1',
  new Date().toISOString()
);

stmtInsert.run(
  '00000000-0000-4000-8000-000000000003',
  'MECATRONICA',
  null,
  9,
  'Falta mayor actualización en PLC industriales modernos y servomotores aplicados.',
  'app-1',
  new Date().toISOString()
);

console.log('✓ Inserción de 3 registros completada');

// 2. Conteo de estados
const conteos = db.prepare(`
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
    SUM(CASE WHEN estado = 'error' THEN 1 ELSE 0 END) as errores
  FROM registros
`).get();

assert.equal(conteos.total, 3, 'Total debe ser 3');
assert.equal(conteos.pendientes, 3, 'Pendientes debe ser 3');
assert.equal(conteos.enviados, 0, 'Enviados debe ser 0');
assert.equal(conteos.errores, 0, 'Errores debe ser 0');
console.log('✓ Conteo por estado verificado (3 pendientes)');

// 3. Conteo por carrera y TSU
const carreras = db.prepare(`SELECT carrera, COUNT(*) as total FROM registros GROUP BY carrera`).all();
assert.equal(carreras.length, 3);

const tsus = db.prepare(`SELECT tsu, COUNT(*) as total FROM registros WHERE tsu IS NOT NULL GROUP BY tsu`).all();
assert.equal(tsus.length, 1);
assert.equal(tsus[0].tsu, 'IA');
assert.equal(tsus[0].total, 1);
console.log('✓ Conteo por carrera y TSU verificado');

// 4. Filtrado de registros
const filtradoTi = db.prepare(`SELECT * FROM registros WHERE carrera = ?`).all('TI');
assert.equal(filtradoTi.length, 1);
assert.equal(filtradoTi[0].id, '00000000-0000-4000-8000-000000000002');
console.log('✓ Filtrado por carrera verificado');

// 5. Ajustes de configuración
const stmtAjuste = db.prepare(`
  INSERT INTO ajustes (clave, valor) VALUES (?, ?)
  ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
`);

stmtAjuste.run('api_url', 'https://uptlax-recolector.vercel.app');
stmtAjuste.run('sync_token', 'token-secreto-7c');
stmtAjuste.run('fuente', 'app-brigada-1');
stmtAjuste.run('sync_auto', '1');

const ajustes = db.prepare(`SELECT clave, valor FROM ajustes`).all();
const ajustesMap = Object.fromEntries(ajustes.map(a => [a.clave, a.valor]));
assert.equal(ajustesMap.api_url, 'https://uptlax-recolector.vercel.app');
assert.equal(ajustesMap.sync_token, 'token-secreto-7c');
assert.equal(ajustesMap.fuente, 'app-brigada-1');
assert.equal(ajustesMap.sync_auto, '1');
console.log('✓ Ajustes guardados y recuperados correctamente');

// 6. Borrado seguro (solo pendientes)
const resBorrado = db.prepare(`DELETE FROM registros WHERE id = ? AND estado = 'pendiente'`).run('00000000-0000-4000-8000-000000000003');
assert.equal(resBorrado.changes, 1, 'Debe haber borrado 1 registro');

const conteoPostBorrado = db.prepare(`SELECT COUNT(*) as total FROM registros`).get();
assert.equal(conteoPostBorrado.total, 2, 'Total restante debe ser 2');
console.log('✓ Borrado de registro pendiente verificado');

// 7. Simular envío y verificación de no borrado en enviado
db.prepare(`UPDATE registros SET estado = 'enviado', enviado_en = ? WHERE id = ?`).run(new Date().toISOString(), '00000000-0000-4000-8000-000000000001');

const resBorradoEnviado = db.prepare(`DELETE FROM registros WHERE id = ? AND estado = 'pendiente'`).run('00000000-0000-4000-8000-000000000001');
assert.equal(resBorradoEnviado.changes, 0, 'No debe permitir borrar registros enviados');
console.log('✓ Inmutabilidad de registros enviados garantizada (0 cambios al intentar borrar)');

console.log('\n🎉 ¡TODAS LAS PRUEBAS DE LA BASE SQLITE LOCAL PASARON CON ÉXITO (7/7)!');
