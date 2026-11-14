import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cycleendshere.app',
  appName: 'The Cycle Ends Here',
  webDir: 'dist',
  backgroundColor: '#000000',
  android: {
    backgroundColor: '#000000',
  },
  plugins: {
    // Actualizaciones en vivo (OTA) autoalojadas: la app las gestiona en src/lib/ota.ts.
    // Sin servicio de Capgo: nada de comprobaciones automáticas, canales ni estadísticas.
    CapacitorUpdater: {
      autoUpdate: false,
      statsUrl: '',
      channelUrl: '',
      updateUrl: '',
      appReadyTimeout: 10000,
      resetWhenUpdate: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#000000',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
  },
};

export default config;
