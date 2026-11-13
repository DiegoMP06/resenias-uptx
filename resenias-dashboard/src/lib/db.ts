import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '../db/schema.ts';

let client: Client | null = null;
let dbInstance: LibSQLDatabase<typeof schema> | null = null;
let initialized = false;

export function getDbClient(): Client {
  if (client) return client;

  const url =
    process.env.TURSO_DATABASE_URL ||
    (import.meta as any).env?.TURSO_DATABASE_URL ||
    'file:local.db';
  const authToken =
    process.env.TURSO_AUTH_TOKEN ||
    (import.meta as any).env?.TURSO_AUTH_TOKEN;

  client = createClient({
    url,
    authToken,
  });

  return client;
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (dbInstance) return dbInstance;
  const rawClient = getDbClient();
  dbInstance = drizzle(rawClient, { schema });
  return dbInstance;
}

export async function asegurarEsquema(): Promise<void> {
  if (initialized) return;
  const rawClient = getDbClient();

  await rawClient.execute(`
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

  await rawClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_respuestas_hash ON respuestas(hash);
  `);
  await rawClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_respuestas_carrera ON respuestas(carrera);
  `);
  await rawClient.execute(`
    CREATE INDEX IF NOT EXISTS idx_respuestas_creado_en ON respuestas(creado_en);
  `);

  initialized = true;
}
