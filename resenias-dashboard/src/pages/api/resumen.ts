import type { APIRoute } from 'astro';
import { getDb, asegurarEsquema } from '../../lib/db.ts';
import { verificarBearerToken, obtenerAdminToken } from '../../lib/auth.ts';
import { CARRERAS, TSU_OPCIONES, CUATRIMESTRES } from '../../shared/carreras.ts';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  const adminToken = obtenerAdminToken();

  if (!verificarBearerToken(authHeader, adminToken)) {
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    await asegurarEsquema();
    const db = getDb();

    // 1. Conteo total y estados
    const [totalesRes, validosRes, dupRes, piiRes] = await Promise.all([
      db.execute('SELECT COUNT(*) as c FROM respuestas'),
      db.execute('SELECT COUNT(*) as c FROM respuestas WHERE posible_duplicado = 0'),
      db.execute('SELECT COUNT(*) as c FROM respuestas WHERE posible_duplicado = 1'),
      db.execute('SELECT COUNT(*) as c FROM respuestas WHERE posible_pii IS NOT NULL'),
    ]);

    const total = Number(totalesRes.rows[0]?.c ?? 0);
    const validos = Number(validosRes.rows[0]?.c ?? 0);
    const posiblesDuplicados = Number(dupRes.rows[0]?.c ?? 0);
    const posiblePii = Number(piiRes.rows[0]?.c ?? 0);

    // 2. Conteo por carrera
    const carreraRows = await db.execute(
      'SELECT carrera, COUNT(*) as c FROM respuestas GROUP BY carrera',
    );
    const conteoCarreraMap = new Map<string, number>();
    for (const row of carreraRows.rows) {
      conteoCarreraMap.set(String(row.carrera), Number(row.c));
    }

    const porCarrera = CARRERAS.map((c) => ({
      carrera: c.id,
      etiqueta: c.etiqueta,
      corta: c.corta,
      total: conteoCarreraMap.get(c.id) ?? 0,
      meta: c.meta,
    }));

    // 3. Conteo por cuatrimestre
    const cuatriRows = await db.execute(
      'SELECT cuatrimestre, COUNT(*) as c FROM respuestas GROUP BY cuatrimestre ORDER BY cuatrimestre ASC',
    );
    const conteoCuatriMap = new Map<number, number>();
    for (const row of cuatriRows.rows) {
      conteoCuatriMap.set(Number(row.cuatrimestre), Number(row.c));
    }
    const porCuatrimestre = CUATRIMESTRES.map((cuat) => ({
      cuatrimestre: cuat,
      total: conteoCuatriMap.get(cuat) ?? 0,
    }));

    // 4. Conteo por TSU
    const tsuRows = await db.execute(
      'SELECT tsu, COUNT(*) as c FROM respuestas WHERE tsu IS NOT NULL GROUP BY tsu',
    );
    const conteoTsuMap = new Map<string, number>();
    for (const row of tsuRows.rows) {
      conteoTsuMap.set(String(row.tsu), Number(row.c));
    }
    const porTsu = TSU_OPCIONES.map((t) => ({
      tsu: t.id,
      etiqueta: t.etiqueta,
      total: conteoTsuMap.get(t.id) ?? 0,
    }));

    // 5. Conteo por fuente
    const fuenteRows = await db.execute(
      'SELECT fuente, COUNT(*) as c FROM respuestas GROUP BY fuente',
    );
    const porFuente = fuenteRows.rows.map((r) => ({
      fuente: String(r.fuente),
      total: Number(r.c),
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        total,
        validos,
        posiblesDuplicados,
        posiblePii,
        porCarrera,
        porCuatrimestre,
        porTsu,
        porFuente,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    console.error('Error al generar resumen:', error);
    return new Response(
      JSON.stringify({ ok: false, mensaje: 'Error al consultar métricas' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
