/**
 * Catálogo de carreras, TSU y cuatrimestres. ÚNICA fuente de verdad para web y app.
 *
 * 7 ingenierías de la Universidad Politécnica de Tlaxcala (UPTlax).
 */
export interface Carrera {
  id: string;
  etiqueta: string;
  corta: string;
  /** Meta de respuestas a recolectar (para la barra de progreso). 0 = sin meta. */
  meta: number;
  /** Si es true, el formulario pide TSU/especialidad. */
  pideTsu?: boolean;
}

export const CARRERAS: Carrera[] = [
  { id: 'INDUSTRIAL', etiqueta: 'Ingeniería Industrial', corta: 'Industrial', meta: 600 },
  {
    id: 'TI',
    etiqueta: 'Ingeniería en Tecnologías de la Información e Innovación Digital',
    corta: 'TI',
    meta: 100,
    pideTsu: true,
  },
  { id: 'MECATRONICA', etiqueta: 'Ingeniería Mecatrónica', corta: 'Mecatrónica', meta: 0 },
  { id: 'QUIMICA', etiqueta: 'Ingeniería Química', corta: 'Química', meta: 0 },
  { id: 'BIOTECNOLOGIA', etiqueta: 'Ingeniería en Biotecnología', corta: 'Biotecnología', meta: 0 },
  { id: 'AUTOMOTRIZ', etiqueta: 'Ingeniería en Sistemas Automotrices', corta: 'Automotriz', meta: 0 },
  { id: 'FINANCIERA', etiqueta: 'Ingeniería Financiera', corta: 'Financiera', meta: 0 },
];

export const TSU_OPCIONES = [
  { id: 'IA', etiqueta: 'Inteligencia Artificial' },
  { id: 'CIENCIA_DATOS', etiqueta: 'Ciencia de Datos' },
  { id: 'INFRAESTRUCTURA_REDES', etiqueta: 'Infraestructura de Redes' },
] as const;

export const CUATRIMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export const CARRERA_IDS = CARRERAS.map((c) => c.id);
export const TSU_IDS = TSU_OPCIONES.map((t) => t.id as string);

export const carreraPideTsu = (id: string) => !!CARRERAS.find((c) => c.id === id)?.pideTsu;
export const etiquetaCarrera = (id: string) => CARRERAS.find((c) => c.id === id)?.etiqueta ?? id;
export const etiquetaTsu = (id: string | null | undefined) =>
  TSU_OPCIONES.find((t) => t.id === id)?.etiqueta ?? '';
