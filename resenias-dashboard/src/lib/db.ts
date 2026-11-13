import { createClient, type Client } from '@libsql/client';

let dbClient: Client | null = null;
let initialized = false;

export function getDb(): Client {
  if (dbClient) return dbClient;

  const url =
    process.env.TURSO_DATABASE_URL ||
    (import.meta as any).env?.TURSO_DATABASE_URL ||
    'file:local.db';
  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    (import.meta as any).env?.TURSO_AUTH_TOKEN;

  dbClient = createClient({
    url,
    authToken,
  });

  return dbClient;
}

export async function asegurarEsquema(): Promise<void> {
  if (initialized) return;
  const client = getDb();

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

  initialized = true;
}
