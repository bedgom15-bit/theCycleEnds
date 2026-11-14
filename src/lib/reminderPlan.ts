import { addDays, fromKey, type DateKey } from './dates';
import type { Habit, Reminder } from './storage';
import { currentStreak } from './streak';

export interface PlannedNotification {
  id: number;
  at: Date;
  title: string;
  body: string;
}

/** Cuántos días por adelantado se programan (se reprograma cada vez que cambian los datos). */
export const DAYS_AHEAD = 14;

/** IDs de versiones anteriores (1000–1013), se cancelan siempre. */
export const LEGACY_IDS = Array.from({ length: DAYS_AHEAD }, (_, i) => 1000 + i);

/** Un ID por día: 2026-11-14 → 20261114. Así un aviso de hoy nunca choca con el de otro día. */
export const dateId = (key: DateKey) => Number(key.replace(/-/g, ''));
const isOurId = (id: number) => id >= 20000000 && id < 30000000;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Decide qué avisos pendientes cancelar antes de reprogramar.
 * Un aviso de hoy cuya hora ya pasó pero que Android aún no entregó (alarma no exacta)
 * se conserva, salvo que el usuario ya haya registrado el día.
 */
export function idsToCancel(
  pending: { id: number; at: Date | null }[],
  plan: PlannedNotification[],
  now: Date,
  todayDone: boolean,
): number[] {
  const planned = new Set(plan.map((n) => n.id));
  const cancel = [...LEGACY_IDS];
  for (const p of pending) {
    if (!isOurId(p.id)) continue;
    const overdueToday = p.at !== null && p.at <= now && sameDay(p.at, now);
    const keep = overdueToday && !todayDone && !planned.has(p.id);
    if (!keep) cancel.push(p.id);
  }
  return cancel;
}

const BODIES = [
  'No sueltes la roca. Registra tu día.',
  'Un día más cuenta. Marca tu progreso.',
  'La constancia se construye hoy. ¿Resististe?',
  'El ciclo termina con disciplina. Registra tu día.',
  'Sigue empujando. Tu calendario te espera.',
];

/**
 * Planifica los recordatorios de los próximos días.
 * Hoy se omite si ya pasó la hora o si todos los hábitos ya están registrados.
 */
export function planReminders(habits: Habit[], reminder: Reminder, now: Date): PlannedNotification[] {
  if (!reminder.enabled || habits.length === 0) return [];
  const today: DateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const pendingToday = habits.filter((h) => !(today in h.entries));
  const out: PlannedNotification[] = [];

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const key = addDays(today, i);
    const at = fromKey(key);
    at.setHours(reminder.hour, reminder.minute, 0, 0);
    if (at <= now) continue;
    if (i === 0 && pendingToday.length === 0) continue;

    let body = BODIES[i % BODIES.length];
    // Mensaje personalizado para el próximo recordatorio, cuando la racha se conoce.
    if (i <= 1 && habits.length === 1) {
      const h = habits[0];
      const streak = currentStreak(h.entries, i === 0 ? today : key);
      if (streak > 0) body = `${h.name}: llevas ${streak} ${streak === 1 ? 'día' : 'días'}. No sueltes la roca.`;
    } else if (i === 0 && pendingToday.length < habits.length) {
      body = `Te falta registrar: ${pendingToday.map((h) => h.name).join(', ')}.`;
    }

    out.push({ id: dateId(key), at, title: '¿Resististe hoy?', body });
  }
  return out;
}
