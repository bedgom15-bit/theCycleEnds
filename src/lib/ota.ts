// Actualizaciones en vivo (OTA) de la parte web dentro de la app Android.
//
// Flujo: al abrir o volver a la app se lee <VITE_UPDATE_URL>/latest.json. Si anuncia una versión
// más nueva que la que está corriendo, se descarga el .zip en segundo plano y se deja preparado;
// se aplica la próxima vez que la app pase a segundo plano o se reinicie.
// Si una versión nueva falla al arrancar (no llama a notifyAppReady en 10 s), Capgo vuelve sola
// a la anterior.

import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { APP_VERSION, compareVersions } from './version';

export interface LatestManifest {
  version: string;
  /** Ruta del .zip, relativa a latest.json o absoluta. */
  url: string;
  /** SHA-256 del .zip en hexadecimal. */
  checksum?: string;
  /** Versión nativa mínima (versionName del APK) que necesita este paquete. */
  minNative?: string;
}

const UPDATE_URL = (import.meta.env.VITE_UPDATE_URL ?? '').replace(/\/+$/, '');
const CHECK_EVERY_MS = 30 * 60 * 1000;
let lastCheck = 0;
let running = false;

/** Decide si un manifiesto merece descargarse. Función pura para poder probarla. */
export function shouldUpdate(m: LatestManifest | null, running: string, native: string): boolean {
  if (!m || typeof m.version !== 'string' || typeof m.url !== 'string') return false;
  if (compareVersions(m.version, running) <= 0) return false;
  if (m.minNative && compareVersions(native, m.minNative) < 0) return false;
  return true;
}

async function check(): Promise<void> {
  if (running || Date.now() - lastCheck < CHECK_EVERY_MS) return;
  running = true;
  lastCheck = Date.now();
  try {
    // HTTP nativo: evita los límites de CORS del WebView.
    const res = await CapacitorHttp.get({
      url: `${UPDATE_URL}/latest.json?t=${Date.now()}`,
      headers: { 'Cache-Control': 'no-cache' },
      responseType: 'json',
    });
    if (res.status !== 200) return;
    const latest: LatestManifest = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    const { native } = await CapacitorUpdater.current();
    if (!shouldUpdate(latest, APP_VERSION, native)) return;

    // Reutiliza el paquete si ya se descargó antes.
    const { bundles } = await CapacitorUpdater.list();
    let bundle = bundles.find((b) => b.version === latest.version && b.status !== 'error');
    if (!bundle) {
      bundle = await CapacitorUpdater.download({
        url: new URL(latest.url, `${UPDATE_URL}/`).toString(),
        version: latest.version,
        checksum: latest.checksum,
      });
    }
    await CapacitorUpdater.next({ id: bundle.id });
    console.info(`[OTA] Versión ${latest.version} lista; se aplicará al volver a abrir la app.`);
  } catch (e) {
    console.warn('[OTA] No se pudo comprobar o descargar la actualización', e);
  } finally {
    running = false;
  }
}

/** Llamar una vez al arrancar la app. */
export function initOta(): void {
  if (!Capacitor.isNativePlatform()) return;
  // Confirma que esta versión arrancó bien (si no, Capgo revierte a la anterior).
  CapacitorUpdater.notifyAppReady().catch(() => {});
  if (!UPDATE_URL) return;
  check();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
}
