// Copia las imágenes de imgs/ a public/marks y genera los íconos PWA.
import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

const marks = ['cycle', 'cycleEnds', 'keep', 'hope'];
await mkdir('public/marks', { recursive: true });
await mkdir('public/icons', { recursive: true });

for (const m of marks) {
  await copyFile(`imgs/${m}.jpg`, `public/marks/${m}.jpg`);
}

for (const size of [192, 512]) {
  await sharp('imgs/cycleEnds.jpg')
    .resize(size, size, { fit: 'contain', background: '#ffffff' })
    .png()
    .toFile(`public/icons/icon-${size}.png`);
}
console.log('assets listos');
