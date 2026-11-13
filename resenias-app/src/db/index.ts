import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const SCHEMA_VERSION = 1;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (dbInstance) return dbInstance;

  dbInstance = SQLite.openDatabaseSync('recolector_uptlax.db');
  inicializarBaseDeDatos(dbInstance);
  return dbInstance;
}

function inicializarBaseDeDatos(db: SQLite.SQLiteDatabase): void {
  // Configuración de rendimiento y llaves foráneas
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

  const versionResult = db.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version;'
  );
  const currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion < 1) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS registros (
        id TEXT PRIMARY KEY,
        carrera TEXT NOT NULL,
        tsu TEXT,
        cuatrimestre INTEGER NOT NULL,
        respuesta TEXT NOT NULL,
        fuente TEXT NOT NULL,
        creado_en TEXT NOT NULL,
        estado TEXT CHECK (estado IN ('pendiente', 'enviado', 'error')) NOT NULL DEFAULT 'pendiente',
        intentos INTEGER NOT NULL DEFAULT 0,
        error TEXT,
        enviado_en TEXT
      );

      CREATE TABLE IF NOT EXISTS ajustes (
        clave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros(estado);
      CREATE INDEX IF NOT EXISTS idx_registros_carrera ON registros(carrera);
      CREATE INDEX IF NOT EXISTS idx_registros_creado_en ON registros(creado_en);

      INSERT OR IGNORE INTO ajustes (clave, valor) VALUES 
        ('api_url', 'http://192.168.1.100:4321'),
        ('sync_token', 'secreto-sync-dev'),
        ('fuente', 'app-1'),
        ('sync_auto', '1');

      PRAGMA user_version = 1;
    `);
  }
}
