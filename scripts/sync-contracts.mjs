import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const contractsDir = path.join(rootDir, 'contracts');
const filesToSync = ['carreras.ts', 'pregunta.ts', 'schema.ts'];

const destinations = [
  path.join(rootDir, 'resenias-dashboard', 'src', 'shared'),
  path.join(rootDir, 'resenias-app', 'src', 'shared'),
];

console.log('🔄 Sincronizando contratos compartidos...');

for (const dest of destinations) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  for (const file of filesToSync) {
    const srcPath = path.join(contractsDir, file);
    const destPath = path.join(dest, file);
    copyFileSync(srcPath, destPath);
    console.log(`  ✓ Copiado ${file} -> ${path.relative(rootDir, destPath)}`);
  }
}

console.log('✅ Contratos sincronizados exitosamente.');
