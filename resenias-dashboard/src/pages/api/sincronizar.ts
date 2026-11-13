import type { APIRoute } from 'astro';
import { loteSchema, registroSchema, type Registro } from '../../shared/schema.ts';
import { guardarRespuesta } from '../../lib/respuestas.ts';
import { verificarBearerToken, obtenerSyncToken } from '../../lib/auth.ts';

export const prerender = false;

const MAX_BODY_BYTES = 350 * 1024; // 350 KB aprox para lotes de 50

export const POST: APIRoute = async ({ request }) => {
  // 1. Verificación de autenticación
  const authHeader = request.headers.get('authorization');
  const syncToken = obtenerSyncToken();

  if (!verificarBearerToken(authHeader, syncToken)) {
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 2. Límite de tamaño de body
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'El lote excede el tamaño máximo permitido' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 3. Parsear JSON
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'JSON inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 4. Validar formato general de lote (debe ser un arreglo de 1 a 50 elementos)
  if (!body || !Array.isArray(body.registros) || body.registros.length < 1 || body.registros.length > 50) {
    return new Response(
      JSON.stringify({
        ok: false,
        mensaje: 'Estructura de lote inválida. Debe incluir un arreglo "registros" de 1 a 50 elementos.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const aceptados: string[] = [];
  const rechazados: { id: string; motivo: string }[] = [];

  // 5. Procesar registros uno a uno
  for (const item of body.registros) {
    const valReg = registroSchema.safeParse(item);
    if (!valReg.success) {
      rechazados.push({
        id: item.id || 'sin-id',
        motivo: valReg.error.issues.map((i) => i.message).join('; '),
      });
      continue;
    }

    try {
      const res = await guardarRespuesta(valReg.data);
      // Tanto si se guardó como si ya existía (repetido), cuenta como aceptado
      // para que la app lo marque como 'enviado' y no lo reintente indefinidamente.
      aceptados.push(res.id);
    } catch (err: any) {
      rechazados.push({
        id: item.id,
        motivo: err?.message || 'Error al persistir registro en la base de datos',
      });
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      aceptados,
      rechazados,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
