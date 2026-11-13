import type { APIRoute } from 'astro';
import { registroSchema } from '../../shared/schema.ts';
import { guardarRespuesta } from '../../lib/respuestas.ts';
import { checkRateLimit } from '../../lib/rateLimit.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit()) {
    return new Response(
      JSON.stringify({
        ok: false,
        mensaje: 'Demasiadas solicitudes. Por favor espera un momento.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, errores: [{ campo: 'body', mensaje: 'JSON inválido' }] }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Honeypot: si el campo oculto "sitio" tiene valor, responder 201 silencioso sin guardar
  if (body?.sitio && typeof body.sitio === 'string' && body.sitio.trim() !== '') {
    return new Response(
      JSON.stringify({ ok: true, id: body.id || 'bot-trap' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const validacion = registroSchema.safeParse(body);
  if (!validacion.success) {
    const errores = validacion.error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensaje: issue.message,
    }));
    return new Response(
      JSON.stringify({ ok: false, errores }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const resultado = await guardarRespuesta(validacion.data);

    if (resultado.repetido) {
      return new Response(
        JSON.stringify({ ok: true, id: resultado.id, repetido: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, id: resultado.id }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
