/** Versión de la parte web (package.json), inyectada por Vite al compilar. */
export const APP_VERSION: string = __APP_VERSION__;

/** Compara versiones tipo "1.2.3". Devuelve >0 si a es más nueva que b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}
