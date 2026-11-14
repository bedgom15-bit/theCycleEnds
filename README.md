# The Cycle Ends Here

Calendario minimalista para registrar el proceso de dejar un mal hábito o adicción.

| Marca | Cuándo |
|---|---|
| `cycle` | Caíste ese día |
| `cycleEnds` | Primer día sin caer |
| `keep` | Días siguientes de la racha |
| `hope` | Cada 7 días de racha (7, 14, 21…) |

## Recordatorios

Ajustes → *Recordatorio diario* (o la invitación bajo el registro de hoy). Se elige la hora;
el aviso se omite si ese día ya registraste todos tus hábitos.

- **Android**: notificaciones locales programadas para los próximos 14 días; se reprograman
  cada vez que abres la app o registras un día. Llegan aunque la app esté cerrada.
- **Web**: solo con la app abierta (los navegadores no permiten programar avisos sin servidor).

## Web / PWA

```bash
npm install
npm run dev        # desarrollo en http://localhost:5173
npm test           # tests de la lógica de rachas
npm run build      # genera dist/ (PWA instalable, funciona offline)
```

## Android (Capacitor)

Requisito: **Android Studio** (incluye el Android SDK y el JDK 21 que necesita Gradle;
el JDK 27 del sistema es demasiado nuevo para Gradle 8.11).

```bash
npm run android:sync   # build web + copia a android/
npm run android:open   # abre el proyecto en Android Studio
```

En Android Studio: *Build → Build App Bundle(s) / APK(s) → Build APK(s)*, o ▶ Run con un
teléfono conectado (depuración USB activada) o un emulador.

Por línea de comandos, sin Android Studio: necesitas un JDK 21 y el Android SDK, indicados en
`android/local.properties` (archivo local, no versionado):

```properties
sdk.dir=C\:\\Users\\<usuario>\\AppData\\Local\\Android\\Sdk
java.home=C\:\\Users\\<usuario>\\.jdks\\jdk-21
```

```powershell
npm run android:apk    # APK en android/app/build/outputs/apk/debug/app-debug.apk
```

Si Gradle dice "SDK location not found" aunque la carpeta exista, detén los daemons y
reintenta: `node scripts/build-apk.mjs --stop`.

Instalar en MuMu Player (con MuMu abierto; el puerto adb de MuMu 12 suele ser 16384):

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb connect 127.0.0.1:16384
& $adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

O arrastra el `.apk` a la ventana de MuMu.

Tras cambiar el código web, vuelve a ejecutar `npm run android:sync`.
Para regenerar íconos y splash de Android desde `imgs/cycleEnds.jpg`: `npm run android:assets`.

## APK para compartir (release firmado)

```powershell
npm run android:release   # android/app/build/outputs/apk/release/app-release.apk
```

Se firma con la clave de release:

- Archivo de la clave (`.jks`), fuera del proyecto: `%USERPROFILE%\.keystores\`
- Ruta, contraseñas y alias: `android/keystore.properties` (no versionado)

> **Guarda copia de seguridad de los dos archivos** (por ejemplo, en un USB o un gestor de
> contraseñas). Android solo acepta una actualización del APK si está firmada con la misma
> clave: si se pierde, los usuarios tendrían que desinstalar la app y perderían sus registros.

Cada APK nuevo que repartas debe subir `versionCode` (y normalmente `versionName`) en
`android/app/build.gradle`. Al instalarlo, la app descarta las actualizaciones en vivo
anteriores y arranca con la versión incluida en el APK.

## Actualizaciones en vivo (OTA)

La app Android puede actualizar su parte web sin reinstalar el APK (plugin
`@capgo/capacitor-updater` en modo autoalojado, sin servicio de Capgo ni estadísticas).

La web y las actualizaciones se publican en **GitHub Pages** con GitHub Actions
(`.github/workflows/deploy.yml`) en cada push a `main`:

- Web: https://bedgom15-bit.github.io/theCycleEnds/
- Actualizaciones: https://bedgom15-bit.github.io/theCycleEnds/ota/latest.json
  (definida en `.env` como `VITE_UPDATE_URL`)

**Configuración (una vez):** en GitHub, *Settings → Pages → Build and deployment → Source:*
**GitHub Actions**. Luego genera y reparte el APK: `npm run android:release`.

**Publicar una actualización:**

1. Sube la versión en `package.json` (p. ej. `0.1.0` → `0.1.1`).
2. `git commit -am "Versión 0.1.1"` y `git push`.
3. GitHub Actions compila, empaqueta (`npm run ota:bundle`) y publica. Revisa la pestaña
   *Actions* del repositorio. GitHub Pages guarda caché unos 10 min.

Para empaquetar a mano (otro hosting): `npm run ota:bundle` y publica la carpeta `dist/`.

Al abrir la app (o volver a ella, como mucho cada 30 min), se descarga la versión nueva en
segundo plano; se aplica la próxima vez que la app pase a segundo plano o se reinicie.
La versión en curso se ve en Ajustes. Si una versión nueva no arranca, se revierte sola.

**Límites:** sirve para cambios de la parte web (pantallas, textos, estilos, lógica). Cambios
nativos (plugins nuevos, permisos, íconos, `capacitor.config.ts`) necesitan un APK nuevo; en
ese caso sube `versionName` y `latest.json` incluirá esa versión como `minNative`, para que los
APK antiguos no descarguen un paquete incompatible.

Probar contra un servidor local: las compilaciones de depuración permiten HTTP
(`android/app/src/debug/AndroidManifest.xml`); con `VITE_UPDATE_URL=http://localhost:8000/ota`,
`python -m http.server 8000` sirviendo una carpeta con `ota/` y `adb reverse tcp:8000 tcp:8000`.
