import type { Entries } from './streak';

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  entries: Entries;
}

export interface Reminder {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface AppData {
  version: 1;
  habits: Habit[];
  selectedId: string | null;
  reminder?: Reminder;
}

export const DEFAULT_REMINDER: Reminder = { enabled: false, hour: 21, minute: 0 };

const KEY = 'cycleEndsHere.v1';

export const emptyData = (): AppData => ({ version: 1, habits: [], selectedId: null });

function isValid(d: unknown): d is AppData {
  if (!d || typeof d !== 'object') return false;
  const a = d as AppData;
  return (
    a.version === 1 &&
    Array.isArray(a.habits) &&
    a.habits.every(
      (h) =>
        typeof h.id === 'string' &&
        typeof h.name === 'string' &&
        h.entries !== null &&
        typeof h.entries === 'object' &&
        Object.values(h.entries).every((s) => s === 'clean' || s === 'fall'),
    )
  );
}

export function getReminder(d: AppData): Reminder {
  const r = d.reminder;
  if (
    r &&
    typeof r.enabled === 'boolean' &&
    Number.isInteger(r.hour) && r.hour >= 0 && r.hour < 24 &&
    Number.isInteger(r.minute) && r.minute >= 0 && r.minute < 60
  ) {
    return r;
  }
  return DEFAULT_REMINDER;
}

export function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : emptyData();
  } catch {
    return emptyData();
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function parseImport(text: string): AppData | null {
  try {
    const parsed = JSON.parse(text);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
