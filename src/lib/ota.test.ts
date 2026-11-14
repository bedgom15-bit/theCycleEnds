import { describe, expect, it, vi } from 'vitest';

// El módulo importa plugins nativos; en los tests solo se usa la función pura.
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false }, CapacitorHttp: {} }));
vi.mock('@capgo/capacitor-updater', () => ({ CapacitorUpdater: {} }));
vi.stubGlobal('__APP_VERSION__', '0.1.0');

const { shouldUpdate } = await import('./ota');
const { compareVersions } = await import('./version');

describe('compareVersions', () => {
  it('compara por partes numéricas', () => {
    expect(compareVersions('0.2.0', '0.1.9')).toBeGreaterThan(0);
    expect(compareVersions('0.10.0', '0.9.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
  });
});

describe('shouldUpdate', () => {
  const m = { version: '0.2.0', url: '0.2.0.zip' };
  it('solo si la versión es más nueva', () => {
    expect(shouldUpdate(m, '0.1.0', '1.0')).toBe(true);
    expect(shouldUpdate(m, '0.2.0', '1.0')).toBe(false);
    expect(shouldUpdate(m, '0.3.0', '1.0')).toBe(false);
  });
  it('respeta la versión nativa mínima', () => {
    expect(shouldUpdate({ ...m, minNative: '1.1' }, '0.1.0', '1.0')).toBe(false);
    expect(shouldUpdate({ ...m, minNative: '1.0' }, '0.1.0', '1.0')).toBe(true);
  });
  it('ignora manifiestos inválidos', () => {
    expect(shouldUpdate(null, '0.1.0', '1.0')).toBe(false);
    expect(shouldUpdate({ version: 1 } as never, '0.1.0', '1.0')).toBe(false);
  });
});
