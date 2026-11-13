import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const respuestas = sqliteTable(
  'respuestas',
  {
    id: text('id').primaryKey(),
    carrera: text('carrera').notNull(),
    tsu: text('tsu'),
    cuatrimestre: integer('cuatrimestre').notNull(),
    respuesta: text('respuesta').notNull(),
    fuente: text('fuente').notNull(),
    hash: text('hash').notNull(),
    posibleDuplicado: integer('posible_duplicado').default(0),
    posiblePii: text('posible_pii'),
    creadoEn: text('creado_en').notNull(),
    recibidoEn: text('recibido_en').notNull(),
  },
  (table) => [
    index('idx_respuestas_hash').on(table.hash),
    index('idx_respuestas_carrera').on(table.carrera),
    index('idx_respuestas_creado_en').on(table.creadoEn),
  ],
);

export type RespuestaItem = typeof respuestas.$inferSelect;
export type NuevaRespuesta = typeof respuestas.$inferInsert;
