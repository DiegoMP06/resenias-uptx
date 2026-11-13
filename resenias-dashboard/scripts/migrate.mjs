import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`🔌 Conectando a Turso / libSQL: ${url.startsWith('file:') ? 'archivo local' : url}`);

const client = createClient({ url, authToken });

async function migrate() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS respuestas (
        id TEXT PRIMARY KEY,
        carrera TEXT NOT NULL,
        tsu TEXT,
        cuatrimestre INTEGER NOT NULL,
        respuesta TEXT NOT NULL,
        fuente TEXT NOT NULL,
        hash TEXT NOT NULL,
        posible_duplicado INTEGER DEFAULT 0,
        posible_pii TEXT,
        creado_en TEXT NOT NULL,
        recibido_en TEXT NOT NULL
      );
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_respuestas_hash ON respuestas(hash);
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_respuestas_carrera ON respuestas(carrera);
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_respuestas_creado_en ON respuestas(creado_en);
    `);

    console.log('✅ Migración ejecutada con éxito: tabla respuestas e índices listos.');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
