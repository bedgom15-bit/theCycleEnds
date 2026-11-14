// Genera íconos y splash de Android a partir de imgs/cycleEnds.jpg.
// Ejecutar después de `npx cap add android`.
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'imgs/cycleEnds.jpg';
const RES = 'android/app/src/main/res';

// Tamaños base en mdpi: launcher 48px, adaptive foreground 108px.
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

for (const [d, s] of Object.entries(densities)) {
  const dir = join(RES, `mipmap-${d}`);
  const launcher = Math.round(48 * s);
  const fg = Math.round(108 * s);
  const inner = Math.round(fg * 0.62); // zona segura del ícono adaptativo

  const square = sharp(SRC).resize(launcher, launcher, { fit: 'contain', background: '#fff' });
  await square.clone().png().toFile(join(dir, 'ic_launcher.png'));

  const circle = Buffer.from(
    `<svg width="${launcher}" height="${launcher}"><circle cx="${launcher / 2}" cy="${launcher / 2}" r="${launcher / 2}"/></svg>`,
  );
  await square.clone().composite([{ input: circle, blend: 'dest-in' }]).png().toFile(join(dir, 'ic_launcher_round.png'));

  const art = await sharp(SRC).resize(inner, inner, { fit: 'contain', background: '#fff' }).png().toBuffer();
  await sharp({ create: { width: fg, height: fg, channels: 4, background: '#ffffff' } })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(join(dir, 'ic_launcher_foreground.png'));
}

// Ícono de notificación (24dp): versión simplificada en blanco sobre transparente, como exige Android.
// El dibujo original tiene líneas demasiado finas para verse a ese tamaño.
// El ojo se pinta en negro y luego se vuelve transparente usando la luminancia como alfa.
const notifySvg = await readFile('scripts/notify-icon.svg');
for (const [d, s] of Object.entries(densities)) {
  const size = Math.round(24 * s);
  const dir = join(RES, `drawable-${d}`);
  await mkdir(dir, { recursive: true });
  const alpha = await sharp(notifySvg, { density: 72 * (size / 24) * 4 })
    .resize(size, size)
    .flatten({ background: '#000' })
    .greyscale()
    .extractChannel(0)
    .raw()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: '#ffffff' } })
    .joinChannel(alpha, { raw: { width: size, height: size, channels: 1 } })
    .png()
    .toFile(join(dir, 'ic_stat_notify.png'));
}

// Splash: fondo negro con el logo centrado, conservando el tamaño de cada splash.png existente.
for (const entry of await readdir(RES, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith('drawable')) continue;
  const file = join(RES, entry.name, 'splash.png');
  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch {
    continue;
  }
  const { width, height } = meta;
  const size = Math.round(Math.min(width, height) * 0.4);
  const logo = await sharp(SRC).resize(size, size, { fit: 'contain', background: '#fff' }).png().toBuffer();
  const out = await sharp({ create: { width, height, channels: 4, background: '#000000' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
  await sharp(out).toFile(file);
}

console.log('assets de Android listos');
