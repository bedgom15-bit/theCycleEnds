import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { bestStreak, computeMarks, currentStreak, daysToHope, type Entries } from './streak';

const START = '2026-01-01';
const day = (i: number) => addDays(START, i);

function cleanDays(from: number, count: number, e: Entries = {}): Entries {
  for (let i = 0; i < count; i++) e[day(from + i)] = 'clean';
  return e;
}

describe('computeMarks', () => {
  it('una caída es cycle', () => {
    expect(computeMarks({ [day(0)]: 'fall' }).get(day(0))).toBe('cycle');
  });

  it('día 1 cycleEnds, 2-6 keep, 7 hope, 8-13 keep, 14 hope', () => {
    const m = computeMarks(cleanDays(0, 15));
    expect(m.get(day(0))).toBe('cycleEnds');
    for (let i = 1; i <= 5; i++) expect(m.get(day(i))).toBe('keep');
    expect(m.get(day(6))).toBe('hope');
    expect(m.get(day(7))).toBe('keep');
    expect(m.get(day(13))).toBe('hope');
    expect(m.get(day(14))).toBe('keep');
  });

  it('tras una caída la racha reinicia', () => {
    const e = cleanDays(0, 3);
    e[day(3)] = 'fall';
    cleanDays(4, 2, e);
    const m = computeMarks(e);
    expect(m.get(day(3))).toBe('cycle');
    expect(m.get(day(4))).toBe('cycleEnds');
    expect(m.get(day(5))).toBe('keep');
  });

  it('un día sin registrar rompe la cadena', () => {
    const e = cleanDays(0, 3);
    cleanDays(4, 1, e);
    expect(computeMarks(e).get(day(4))).toBe('cycleEnds');
  });

  it('cruza fin de mes', () => {
    const e: Entries = { '2026-01-31': 'clean', '2026-02-01': 'clean' };
    expect(computeMarks(e).get('2026-02-01')).toBe('keep');
  });
});

describe('rachas', () => {
  it('currentStreak cuenta hasta hoy o ayer si hoy no se registró', () => {
    const e = cleanDays(0, 5);
    expect(currentStreak(e, day(4))).toBe(5);
    expect(currentStreak(e, day(5))).toBe(5);
    expect(currentStreak(e, day(6))).toBe(0);
    e[day(5)] = 'fall';
    expect(currentStreak(e, day(5))).toBe(0);
  });

  it('bestStreak', () => {
    const e = cleanDays(0, 4);
    e[day(4)] = 'fall';
    cleanDays(5, 9, e);
    expect(bestStreak(e)).toBe(9);
  });

  it('daysToHope', () => {
    expect(daysToHope(0)).toBe(7);
    expect(daysToHope(6)).toBe(1);
    expect(daysToHope(7)).toBe(7);
  });
});
