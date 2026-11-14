import { addDays, type DateKey } from './dates';

export type Status = 'clean' | 'fall';
export type Entries = Record<DateKey, Status>;
export type Mark = 'cycle' | 'cycleEnds' | 'keep' | 'hope';

export const HOPE_EVERY = 7;

/** Marca para un día limpio según la longitud de la racha (contando ese día). */
export function markForStreak(n: number): Mark {
  if (n === 1) return 'cycleEnds';
  if (n % HOPE_EVERY === 0) return 'hope';
  return 'keep';
}

/**
 * Calcula la marca de cada día registrado.
 * Un día sin registrar rompe la cadena de días limpios.
 */
export function computeMarks(entries: Entries): Map<DateKey, Mark> {
  const marks = new Map<DateKey, Mark>();
  const keys = Object.keys(entries).sort();
  let run = 0;
  let prev: DateKey | null = null;
  for (const key of keys) {
    if (entries[key] === 'fall') {
      marks.set(key, 'cycle');
      run = 0;
    } else {
      const continues = prev !== null && addDays(prev, 1) === key && entries[prev] === 'clean';
      run = continues ? run + 1 : 1;
      marks.set(key, markForStreak(run));
    }
    prev = key;
  }
  return marks;
}

function runEndingAt(entries: Entries, key: DateKey): number {
  let n = 0;
  let k = key;
  while (entries[k] === 'clean') {
    n++;
    k = addDays(k, -1);
  }
  return n;
}

/**
 * Racha actual. Si hoy aún no se registró, cuenta la racha que termina ayer
 * (el día todavía no se ha perdido).
 */
export function currentStreak(entries: Entries, today: DateKey): number {
  if (entries[today] === 'fall') return 0;
  if (entries[today] === 'clean') return runEndingAt(entries, today);
  return runEndingAt(entries, addDays(today, -1));
}

export function bestStreak(entries: Entries): number {
  let best = 0;
  let run = 0;
  let prev: DateKey | null = null;
  for (const key of Object.keys(entries).sort()) {
    if (entries[key] === 'clean') {
      run = prev !== null && addDays(prev, 1) === key && entries[prev] === 'clean' ? run + 1 : 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    prev = key;
  }
  return best;
}

export function totals(entries: Entries) {
  let clean = 0;
  let falls = 0;
  for (const s of Object.values(entries)) {
    if (s === 'clean') clean++;
    else falls++;
  }
  return { clean, falls };
}

/** Días que faltan para el próximo hope. */
export function daysToHope(streak: number): number {
  return HOPE_EVERY - (streak % HOPE_EVERY);
}
