// Ejecuta una tarea de Gradle (por defecto assembleDebug) con el JDK y el Android SDK
// definidos en android/local.properties (java.home y sdk.dir), sin depender del Java del sistema.
// android/local.properties es local de cada equipo y no se versiona.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const env = { ...process.env };

try {
  const local = readFileSync('android/local.properties', 'utf8');
  // Formato properties: '\:' y '\\' van escapados.
  const prop = (key) => local.match(new RegExp(`^${key.replace('.', '\\.')}=(.+)$`, 'm'))?.[1]?.trim().replace(/\\(.)/g, '$1');
  const sdk = prop('sdk.dir');
  const javaHome = prop('java.home');
  if (sdk) env.ANDROID_HOME = sdk;
  if (javaHome) env.JAVA_HOME = javaHome;
} catch {
  /* sin local.properties: se usan JAVA_HOME y ANDROID_HOME del entorno */
}

const task = process.argv[2] ?? 'assembleDebug';
const r = spawnSync('.\\gradlew.bat', [task], { cwd: 'android', env, stdio: 'inherit', shell: true });
process.exit(r.status ?? 1);
