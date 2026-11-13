/**
 * Esquemas Zod compartidos por web (Astro), app (Expo) y servidor (API).
 * Copiar este archivo (junto con carreras.ts y pregunta.ts) a `web/src/shared/` y `app/src/shared/`.
 * Nunca editar una copia sin editar la otra: mantener idénticas con `scripts/sync-contracts.mjs`.
 */
import { z } from 'zod';
import { CARRERA_IDS, TSU_IDS, CUATRIMESTRES, carreraPideTsu } from './carreras.ts';

export const MIN_RESPUESTA = 40;
export const MAX_RESPUESTA = 4000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Regla cruzada: TSU obligatorio solo para carreras que lo piden; vacío para las demás. */
function validarTsu(
  v: { carrera: string; tsu: string | null },
  ctx: z.RefinementCtx,
) {
  const pide = carreraPideTsu(v.carrera);
  const tsu = v.tsu ?? '';
  if (pide && !TSU_IDS.includes(tsu)) {
    ctx.addIssue({ code: 'custom', path: ['tsu'], message: 'Selecciona tu TSU / especialidad' });
  }
  if (!pide && tsu !== '') {
    ctx.addIssue({ code: 'custom', path: ['tsu'], message: 'Esta carrera no usa TSU' });
  }
}

/** Formulario (lo que captura la persona). Valores de select llegan como string. */
export const formularioSchema = z
  .object({
    consentimiento: z.boolean().refine((v) => v === true, { message: 'Debes aceptar para participar' }),
    carrera: z.string().refine((v) => CARRERA_IDS.includes(v), { message: 'Selecciona tu carrera' }),
    tsu: z.string(),
    cuatrimestre: z
      .string()
      .refine((v) => (CUATRIMESTRES as readonly number[]).includes(Number(v)), {
        message: 'Selecciona tu cuatrimestre',
      }),
    // trim() solo quita espacios en los extremos; NO se corrige redacción (lo exige la actividad).
    respuesta: z
      .string()
      .trim()
      .min(MIN_RESPUESTA, `Cuéntanos un poco más (mínimo ${MIN_RESPUESTA} caracteres)`)
      .max(MAX_RESPUESTA, `Máximo ${MAX_RESPUESTA} caracteres`),
    // Honeypot: debe ir vacío (en la app se omite).
    sitio: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => validarTsu({ carrera: v.carrera, tsu: v.tsu }, ctx));

export type FormularioValores = z.infer<typeof formularioSchema>;

/** Registro que viaja al servidor (web y app). El id (UUID v4) lo genera el CLIENTE. */
export const registroSchema = z
  .object({
    id: z.string().regex(UUID_RE, 'id inválido'),
    carrera: z.string().refine((v) => CARRERA_IDS.includes(v)),
    tsu: z.string().nullable(),
    cuatrimestre: z.number().int().min(1).max(11),
    respuesta: z.string().trim().min(MIN_RESPUESTA).max(MAX_RESPUESTA),
    fuente: z.string().min(1).max(40), // 'web' | 'app-1' | 'app-2' ... (nunca identifica personas)
    creadoEn: z.string().min(10).max(40), // ISO 8601, hora del dispositivo al capturar
  })
  .superRefine((v, ctx) => validarTsu({ carrera: v.carrera, tsu: v.tsu }, ctx));

export type Registro = z.infer<typeof registroSchema>;

export const loteSchema = z.object({
  registros: z.array(registroSchema).min(1).max(50),
});

/** Convierte los valores del formulario en un Registro listo para enviar/guardar. */
export function formularioARegistro(
  v: FormularioValores,
  extra: { id: string; fuente: string; creadoEn: string },
): Registro {
  return {
    id: extra.id,
    carrera: v.carrera,
    tsu: carreraPideTsu(v.carrera) ? v.tsu : null,
    cuatrimestre: Number(v.cuatrimestre),
    respuesta: v.respuesta.trim(),
    fuente: extra.fuente,
    creadoEn: extra.creadoEn,
  };
}

/** Detector simple de datos personales (solo MARCA para revisión; nunca modifica el texto). */
export function detectarPosiblePii(texto: string): string[] {
  const hallazgos: string[] = [];
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(texto)) hallazgos.push('correo');
  if (/(?<!\d)(?:\+?52\s?)?(?:\d[\s-]?){10}(?!\d)/.test(texto)) hallazgos.push('telefono');
  if (/(?<!\d)\d{8,12}(?!\d)/.test(texto)) hallazgos.push('matricula_posible');
  return hallazgos;
}

/** Normaliza para detectar duplicados de contenido (el hash se calcula sobre esto). */
export function normalizarParaHash(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
