import type { Mark } from './streak';

export const MARK_INFO: Record<Mark, { label: string; meaning: string }> = {
  cycle: { label: 'Cycle', meaning: 'Caíste. El ciclo se repitió.' },
  cycleEnds: { label: 'Cycle ends', meaning: 'Primer día limpio.' },
  keep: { label: 'Keep', meaning: 'Sigues empujando, día tras día.' },
  hope: { label: 'Hope', meaning: 'Una semana completa de racha.' },
};

export function motivation(streak: number, todayMark: Mark | undefined, registeredToday: boolean): string {
  if (todayMark === 'cycle') return 'Sacúdete el polvo y vuelve a empezar. No te rindas.';
  if (!registeredToday && streak === 0) return 'Hoy puede ser el día en que el ciclo termina.';
  if (!registeredToday) return `Llevas ${streak} ${streak === 1 ? 'día' : 'días'}. No sueltes la roca hoy.`;
  if (todayMark === 'cycleEnds') return 'El ciclo termina aquí. Primer día ganado.';
  if (todayMark === 'hope') return 'Una semana más. Esto es disciplina.';
  return 'Sigue empujando. La constancia lo es todo.';
}
