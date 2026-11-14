import { describe, expect, it } from 'vitest';
import { planReminders, DAYS_AHEAD, idsToCancel, LEGACY_IDS } from './reminderPlan';
import type { Habit, Reminder } from './storage';

const on: Reminder = { enabled: true, hour: 21, minute: 0 };
const habit = (entries: Habit['entries'] = {}, name = 'Fumar'): Habit => ({ id: name, name, createdAt: '', entries });

describe('planReminders', () => {
  it('nada si está desactivado o no hay hábitos', () => {
    const now = new Date(2026, 10, 13, 10);
    expect(planReminders([habit()], { ...on, enabled: false }, now)).toEqual([]);
    expect(planReminders([], on, now)).toEqual([]);
  });

  it('incluye hoy si falta registrar y aún no es la hora', () => {
    const plan = planReminders([habit()], on, new Date(2026, 10, 13, 10));
    expect(plan).toHaveLength(DAYS_AHEAD);
    expect(plan[0].at).toEqual(new Date(2026, 10, 13, 21, 0));
  });

  it('omite hoy si ya pasó la hora', () => {
    const plan = planReminders([habit()], on, new Date(2026, 10, 13, 22));
    expect(plan[0].at).toEqual(new Date(2026, 10, 14, 21, 0));
  });

  it('omite hoy si todos los hábitos están registrados', () => {
    const plan = planReminders([habit({ '2026-11-13': 'clean' })], on, new Date(2026, 10, 13, 10));
    expect(plan[0].at.getDate()).toBe(14);
    expect(plan).toHaveLength(DAYS_AHEAD - 1);
  });

  it('nombra los hábitos pendientes de hoy', () => {
    const plan = planReminders(
      [habit({ '2026-11-13': 'clean' }, 'Fumar'), habit({}, 'Redes')],
      on,
      new Date(2026, 10, 13, 10),
    );
    expect(plan[0].body).toContain('Redes');
    expect(plan[0].body).not.toContain('Fumar');
  });

  it('usa un id por fecha', () => {
    const plan = planReminders([habit()], on, new Date(2026, 10, 13, 10));
    expect(plan[0].id).toBe(20261113);
    expect(plan[1].id).toBe(20261114);
  });

  it('menciona la racha con un solo hábito', () => {
    const plan = planReminders([habit({ '2026-11-12': 'clean', '2026-11-11': 'clean' })], on, new Date(2026, 10, 13, 10));
    expect(plan[0].body).toContain('2 días');
  });
});

describe('idsToCancel', () => {
  const now = new Date(2026, 10, 13, 20, 28);
  const overdueToday = { id: 20261113, at: new Date(2026, 10, 13, 20, 27) };
  const tomorrow = { id: 20261114, at: new Date(2026, 10, 14, 20, 27) };
  const plan = planReminders([habit()], { enabled: true, hour: 20, minute: 27 }, now);

  it('conserva el aviso de hoy aún no entregado si falta registrar', () => {
    const cancel = idsToCancel([overdueToday, tomorrow], plan, now, false);
    expect(cancel).not.toContain(20261113);
    expect(cancel).toContain(20261114);
    expect(cancel).toEqual(expect.arrayContaining(LEGACY_IDS));
  });

  it('lo cancela si el día ya está registrado', () => {
    expect(idsToCancel([overdueToday], [], now, true)).toContain(20261113);
  });

  it('lo cancela si es de un día anterior', () => {
    const old = { id: 20261112, at: new Date(2026, 10, 12, 20, 27) };
    expect(idsToCancel([old], plan, now, false)).toContain(20261112);
  });

  it('ignora notificaciones ajenas', () => {
    expect(idsToCancel([{ id: 5, at: null }], plan, now, false)).not.toContain(5);
  });
});
