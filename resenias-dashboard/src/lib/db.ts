import { createClient, type Client } from '@libsql/client';

let dbClient: Client | null = null;

export function getDb(): Client {
  if (dbClient) return dbClient;

  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  dbClient = createClient({
    url,
    authToken,
  });

  return dbClient;
}
