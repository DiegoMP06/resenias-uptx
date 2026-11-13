import crypto from 'node:crypto';
import { getDb, asegurarEsquema } from './db.ts';
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
  const existe = await db.execute({
    sql: 'SELECT id FROM respuestas WHERE id = ? LIMIT 1',
    args: [registro.id],
  });

  if (existe.rows.length > 0) {
    return {
      id: registro.id,
      guardado: false,
      repetido: true,
    };
  }

  // 2. Calcular hash y detectar duplicado de contenido
  const hash = calcularHash(registro.respuesta);
  const duplicadoRes = await db.execute({
    sql: 'SELECT id FROM respuestas WHERE hash = ? AND id != ? LIMIT 1',
    args: [hash, registro.id],
  });
  const posibleDuplicado = duplicadoRes.rows.length > 0 ? 1 : 0;

  // 3. Detectar PII
  const hallazgosPii = detectarPosiblePii(registro.respuesta);
  const posiblePii = hallazgosPii.length > 0 ? hallazgosPii.join(',') : null;

  // 4. Recibido en servidor
  const recibidoEn = new Date().toISOString();

  // 5. Inserción con ON CONFLICT por si entra en condición de carrera
  await db.execute({
    sql: `
      INSERT INTO respuestas (
        id, carrera, tsu, cuatrimestre, respuesta, fuente, hash, posible_duplicado, posible_pii, creado_en, recibido_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `,
    args: [
      registro.id,
      registro.carrera,
      registro.tsu,
      registro.cuatrimestre,
      registro.respuesta,
      registro.fuente,
      hash,
      posibleDuplicado,
      posiblePii,
      registro.creadoEn,
      recibidoEn,
    ],
  });

  return {
    id: registro.id,
    guardado: true,
    repetido: false,
  };
}
