import { getDatabase } from './index.ts';

export type EstadoRegistro = 'pendiente' | 'enviado' | 'error';

export interface RegistroLocal {
  id: string;
  carrera: string;
  tsu: string | null;
  cuatrimestre: number;
  respuesta: string;
  fuente: string;
  creado_en: string;
  estado: EstadoRegistro;
  intentos: number;
  error: string | null;
  enviado_en: string | null;
}

export interface NuevaCaptura {
  id: string;
  carrera: string;
  tsu: string | null;
  cuatrimestre: number;
  respuesta: string;
  fuente: string;
  creadoEn: string;
}

export interface ConteoEstado {
  total: number;
  pendientes: number;
  enviados: number;
  errores: number;
}

export interface ConteoCarrera {
  carrera: string;
  total: number;
}

export interface ConteoTsu {
  tsu: string;
  total: number;
}

export const repositorio = {
  /**
   * Inserta un nuevo registro en estado 'pendiente'.
   */
  async crear(datos: NuevaCaptura): Promise<RegistroLocal> {
    const db = getDatabase();
    db.runSync(
      `
      INSERT INTO registros (
        id, carrera, tsu, cuatrimestre, respuesta, fuente, creado_en, estado, intentos, error, enviado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', 0, NULL, NULL)
    `,
      [
        datos.id,
        datos.carrera,
        datos.tsu,
        datos.cuatrimestre,
        datos.respuesta,
        datos.fuente,
        datos.creadoEn,
      ]
    );

    const creado = db.getFirstSync<RegistroLocal>(
      'SELECT * FROM registros WHERE id = ?',
      [datos.id]
    );
    if (!creado) throw new Error('No se pudo recuperar el registro recién creado');
    return creado;
  },

  /**
   * Lista registros con filtros opcionales de estado y carrera.
   */
  async listar(filtros?: {
    estado?: EstadoRegistro;
    carrera?: string;
  }): Promise<RegistroLocal[]> {
    const db = getDatabase();
    let sql = 'SELECT * FROM registros WHERE 1=1';
    const params: (string | number)[] = [];

    if (filtros?.estado) {
      sql += ' AND estado = ?';
      params.push(filtros.estado);
    }

    if (filtros?.carrera && filtros.carrera !== '') {
      sql += ' AND carrera = ?';
      params.push(filtros.carrera);
    }

    sql += ' ORDER BY creado_en DESC';

    return db.getAllSync<RegistroLocal>(sql, params);
  },

  /**
   * Obtiene un registro por su ID.
   */
  async obtenerPorId(id: string): Promise<RegistroLocal | null> {
    const db = getDatabase();
    return db.getFirstSync<RegistroLocal>(
      'SELECT * FROM registros WHERE id = ?',
      [id]
    );
  },

  /**
   * Conteo de registros por estado (total, pendientes, enviados, error).
   */
  async contarPorEstado(): Promise<ConteoEstado> {
    const db = getDatabase();
    const rows = db.getAllSync<{ estado: string; c: number }>(`
      SELECT estado, COUNT(*) as c FROM registros GROUP BY estado
    `);

    let pendientes = 0;
    let enviados = 0;
    let errores = 0;

    for (const r of rows) {
      if (r.estado === 'pendiente') pendientes = r.c;
      else if (r.estado === 'enviado') enviados = r.c;
      else if (r.estado === 'error') errores = r.c;
    }

    return {
      total: pendientes + enviados + errores,
      pendientes,
      enviados,
      errores,
    };
  },

  /**
   * Conteo agrupado por carrera.
   */
  async contarPorCarrera(): Promise<ConteoCarrera[]> {
    const db = getDatabase();
    return db.getAllSync<ConteoCarrera>(`
      SELECT carrera, COUNT(*) as total FROM registros GROUP BY carrera
    `);
  },

  /**
   * Conteo agrupado por TSU (para TI).
   */
  async contarPorTsu(): Promise<ConteoTsu[]> {
    const db = getDatabase();
    return db.getAllSync<ConteoTsu>(`
      SELECT tsu, COUNT(*) as total FROM registros WHERE tsu IS NOT NULL GROUP BY tsu
    `);
  },

  /**
   * Obtiene los registros pendientes o con error para sincronizar.
   */
  async obtenerPendientes(limite = 50): Promise<RegistroLocal[]> {
    const db = getDatabase();
    return db.getAllSync<RegistroLocal>(
      `
      SELECT * FROM registros 
      WHERE estado IN ('pendiente', 'error') 
      ORDER BY creado_en ASC 
      LIMIT ?
    `,
      [limite]
    );
  },

  /**
   * Marca como 'enviado' los IDs confirmados por el servidor.
   */
  async marcarEnviados(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    const ahora = new Date().toISOString();

    db.runSync(
      `
      UPDATE registros 
      SET estado = 'enviado', enviado_en = ?, error = NULL
      WHERE id IN (${placeholders})
    `,
      [ahora, ...ids]
    );
  },

  /**
   * Marca un registro con estado 'error' y mensaje de fallo.
   */
  async marcarError(id: string, motivo: string): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `
      UPDATE registros 
      SET estado = 'error', intentos = intentos + 1, error = ?
      WHERE id = ?
    `,
      [motivo, id]
    );
  },

  /**
   * REGLA ESTRICTA: Solo se pueden borrar registros con estado 'pendiente'.
   * Nunca se borran registros enviados ni consolidados.
   */
  async borrarPendiente(id: string): Promise<boolean> {
    const db = getDatabase();
    const reg = db.getFirstSync<RegistroLocal>(
      'SELECT estado FROM registros WHERE id = ?',
      [id]
    );

    if (!reg) return false;
    if (reg.estado !== 'pendiente') {
      throw new Error('Solo se permite eliminar registros que están pendientes de envío');
    }

    db.runSync('DELETE FROM registros WHERE id = ?', [id]);
    return true;
  },

  /**
   * Obtiene el mapa clave-valor de configuración local.
   */
  async obtenerAjustes(): Promise<Record<string, string>> {
    const db = getDatabase();
    const rows = db.getAllSync<{ clave: string; valor: string }>(
      'SELECT clave, valor FROM ajustes'
    );
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.clave] = r.valor;
    }
    return result;
  },

  /**
   * Guarda o actualiza un ajuste de configuración.
   */
  async guardarAjuste(clave: string, valor: string): Promise<void> {
    const db = getDatabase();
    db.runSync(
      `
      INSERT INTO ajustes (clave, valor) VALUES (?, ?)
      ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
    `,
      [clave, valor]
    );
  },
};

export async function obtenerRepositorio() {
  return repositorio;
}

