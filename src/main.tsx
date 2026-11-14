import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { initOta } from './lib/ota';
import './styles.css';

if (Capacitor.isNativePlatform()) {
  // App nativa: barra de estado negra con íconos claros.
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
  // Actualizaciones en vivo de la parte web.
  initOta();
} else {
  // Web/PWA: service worker para funcionar sin conexión.
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
