import crypto from 'node:crypto';
import { eq, and, ne } from 'drizzle-orm';
import { getDb, asegurarEsquema } from './db.ts';
import { respuestas } from '../db/schema.ts';
import { normalizarParaHash, detectarPosiblePii, type Registro } from '../shared/schema.ts';

export interface ResultadoInsercion {
  id: string;
  guardado: boolean;
  repetido: boolean;
}

export function calcularHash(texto: string): string {
  const norm = normalizarParaHash(texto);
  return crypto.createHash('sha256').update(norm).digest('hex');
}

export async function guardarRespuesta(
  registro: Registro,
): Promise<ResultadoInsercion> {
  await asegurarEsquema();
  const db = getDb();

  // 1. Verificar si el id ya existía (idempotencia)
  const existe = await db
    .select({ id: respuestas.id })
    .from(respuestas)
    .where(eq(respuestas.id, registro.id))
    .limit(1);

  if (existe.length > 0) {
    return {
      id: registro.id,
      guardado: false,
      repetido: true,
    };
  }

  // 2. Calcular hash y detectar duplicado de contenido
  const hash = calcularHash(registro.respuesta);
  const duplicadoRes = await db
    .select({ id: respuestas.id })
    .from(respuestas)
    .where(and(eq(respuestas.hash, hash), ne(respuestas.id, registro.id)))
    .limit(1);

  const posibleDuplicado = duplicadoRes.length > 0 ? 1 : 0;

  // 3. Detectar PII
  const hallazgosPii = detectarPosiblePii(registro.respuesta);
  const posiblePii = hallazgosPii.length > 0 ? hallazgosPii.join(',') : null;

  // 4. Recibido en servidor
  const recibidoEn = new Date().toISOString();

  // 5. Inserción con Drizzle onConflictDoNothing
  await db
    .insert(respuestas)
    .values({
      id: registro.id,
      carrera: registro.carrera,
      tsu: registro.tsu,
      cuatrimestre: registro.cuatrimestre,
      respuesta: registro.respuesta,
      fuente: registro.fuente,
      hash,
      posibleDuplicado,
      posiblePii,
      creadoEn: registro.creadoEn,
      recibidoEn,
    })
    .onConflictDoNothing({ target: respuestas.id });

  return {
    id: registro.id,
    guardado: true,
    repetido: false,
  };
}
