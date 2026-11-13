import type { APIRoute } from 'astro';
import { count, eq, isNotNull, asc, desc, or } from 'drizzle-orm';
import { getDb, asegurarEsquema } from '../../lib/db.ts';
import { respuestas } from '../../db/schema.ts';
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

    // 1. Conteo total y estados con Drizzle
    const [totalesRes, validosRes, dupRes, piiRes] = await Promise.all([
      db.select({ c: count() }).from(respuestas),
      db
        .select({ c: count() })
        .from(respuestas)
        .where(eq(respuestas.posibleDuplicado, 0)),
      db
        .select({ c: count() })
        .from(respuestas)
        .where(eq(respuestas.posibleDuplicado, 1)),
      db
        .select({ c: count() })
        .from(respuestas)
        .where(isNotNull(respuestas.posiblePii)),
    ]);

    const total = Number(totalesRes[0]?.c ?? 0);
    const validos = Number(validosRes[0]?.c ?? 0);
    const posiblesDuplicados = Number(dupRes[0]?.c ?? 0);
    const posiblePii = Number(piiRes[0]?.c ?? 0);

    // 2. Conteo por carrera
    const carreraRows = await db
      .select({
        carrera: respuestas.carrera,
        c: count(),
      })
      .from(respuestas)
      .groupBy(respuestas.carrera);

    const conteoCarreraMap = new Map<string, number>();
    for (const row of carreraRows) {
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
    const cuatriRows = await db
      .select({
        cuatrimestre: respuestas.cuatrimestre,
        c: count(),
      })
      .from(respuestas)
      .groupBy(respuestas.cuatrimestre)
      .orderBy(asc(respuestas.cuatrimestre));

    const conteoCuatriMap = new Map<number, number>();
    for (const row of cuatriRows) {
      conteoCuatriMap.set(Number(row.cuatrimestre), Number(row.c));
    }
    const porCuatrimestre = CUATRIMESTRES.map((cuat) => ({
      cuatrimestre: cuat,
      total: conteoCuatriMap.get(cuat) ?? 0,
    }));

    // 4. Conteo por TSU
    const tsuRows = await db
      .select({
        tsu: respuestas.tsu,
        c: count(),
      })
      .from(respuestas)
      .where(isNotNull(respuestas.tsu))
      .groupBy(respuestas.tsu);

    const conteoTsuMap = new Map<string, number>();
    for (const row of tsuRows) {
      if (row.tsu) {
        conteoTsuMap.set(String(row.tsu), Number(row.c));
      }
    }
    const porTsu = TSU_OPCIONES.map((t) => ({
      tsu: t.id,
      etiqueta: t.etiqueta,
      total: conteoTsuMap.get(t.id) ?? 0,
    }));

    // 5. Conteo por fuente
    const fuenteRows = await db
      .select({
        fuente: respuestas.fuente,
        c: count(),
      })
      .from(respuestas)
      .groupBy(respuestas.fuente);

    const porFuente = fuenteRows.map((r) => ({
      fuente: String(r.fuente),
      total: Number(r.c),
    }));

    // 6. Registros marcados para revisión manual (duplicados o con posible PII)
    const marcados = await db
      .select({
        id: respuestas.id,
        carrera: respuestas.carrera,
        tsu: respuestas.tsu,
        cuatrimestre: respuestas.cuatrimestre,
        respuesta: respuestas.respuesta,
        fuente: respuestas.fuente,
        posibleDuplicado: respuestas.posibleDuplicado,
        posiblePii: respuestas.posiblePii,
        creadoEn: respuestas.creadoEn,
      })
      .from(respuestas)
      .where(
        or(
          eq(respuestas.posibleDuplicado, 1),
          isNotNull(respuestas.posiblePii),
        ),
      )
      .orderBy(desc(respuestas.creadoEn))
      .limit(100);

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
        marcados,
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
