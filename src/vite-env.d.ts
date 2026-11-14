/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Carpeta pública con latest.json y los .zip de actualización (OTA). Vacío = OTA desactivado. */
  readonly VITE_UPDATE_URL?: string;
}
