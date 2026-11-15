// Exportar / importar el respaldo, en web y en la app nativa.
//
// Web: descarga/lee el archivo con las API del navegador.
// Android/iOS: el WebView no tiene "descargas", así que se escribe el archivo con Filesystem
// y se abre el menú de compartir para que el usuario lo guarde (Drive, Archivos, WhatsApp…).

import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { exportJson, type AppData } from './storage';

const fileName = () => `cycle-ends-here-${new Date().toISOString().slice(0, 10)}.json`;

export type ExportResult = 'shared' | 'downloaded' | 'cancelled' | 'error';

export async function exportBackup(data: AppData): Promise<ExportResult> {
  const json = exportJson(data);

  if (!Capacitor.isNativePlatform()) {
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName();
      a.click();
      URL.revokeObjectURL(url);
      return 'downloaded';
    } catch {
      return 'error';
    }
  }

  try {
    const name = fileName();
    // Cache: carpeta propia de la app, no necesita permisos de almacenamiento.
    await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
    const { uri } = await Filesystem.getUri({ path: name, directory: Directory.Cache });
    await Share.share({
      title: 'Respaldo de The Cycle Ends Here',
      dialogTitle: 'Guardar o enviar tu respaldo',
      url: uri,
    });
    return 'shared';
  } catch (e) {
    // El usuario puede cerrar el menú de compartir: eso no es un error.
    const msg = e instanceof Error ? e.message.toLowerCase() : '';
    if (msg.includes('cancel') || msg.includes('abort') || msg.includes('dismiss')) return 'cancelled';
    console.warn('[backup] No se pudo exportar', e);
    return 'error';
  }
}
