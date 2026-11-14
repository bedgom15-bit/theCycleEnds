// Empaqueta la web compilada (dist/) como actualización en vivo (OTA) para la app Android.
// Genera dist/ota/<version>.zip y dist/ota/latest.json; al publicar dist/ en tu hosting,
// las apps instaladas descargan la versión nueva.
//
// Uso: npm run ota:bundle   (compila y empaqueta)
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { zipSync } from 'fflate';

const DIST = 'dist';
const OUT = join(DIST, 'ota');
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const minNative = readFileSync('android/app/build.gradle', 'utf8').match(/versionName\s+"([^"]+)"/)?.[1];

function collect(dir, files = {}) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (full === OUT) continue; // no meter paquetes anteriores
    if (statSync(full).isDirectory()) collect(full, files);
    else files[relative(DIST, full).split(sep).join('/')] = readFileSync(full);
  }
  return files;
}

const files = collect(DIST);
if (!files['index.html']) throw new Error('dist/index.html no existe: ejecuta primero npm run build');

const zip = zipSync(files, { level: 9 });
const checksum = createHash('sha256').update(zip).digest('hex');

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, `${version}.zip`), zip);
const latest = { version, url: `${version}.zip`, checksum, minNative, date: new Date().toISOString() };
writeFileSync(join(OUT, 'latest.json'), JSON.stringify(latest, null, 2));

console.log(`OTA ${version}: ${Object.keys(files).length} archivos, ${(zip.length / 1024).toFixed(0)} KB`);
console.log(`  dist/ota/${version}.zip`);
console.log('  dist/ota/latest.json');
