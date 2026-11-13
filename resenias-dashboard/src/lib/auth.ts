import crypto from 'node:crypto';

export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verificarBearerToken(
  authHeader: string | null | undefined,
  expectedToken: string | undefined,
): boolean {
  if (!authHeader || !expectedToken) return false;
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return false;
  return timingSafeEqualString(parts[1], expectedToken);
}

export function obtenerSyncToken(): string {
  return (
    process.env.SYNC_TOKEN ||
    (import.meta as any).env?.SYNC_TOKEN ||
    'secreto-sync-dev'
  );
}

export function obtenerAdminToken(): string {
  return (
    process.env.ADMIN_TOKEN ||
    (import.meta as any).env?.ADMIN_TOKEN ||
    'secreto-admin-dev'
  );
}
