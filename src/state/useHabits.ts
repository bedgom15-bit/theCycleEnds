import { useCallback, useEffect, useState } from 'react';
import { getReminder, load, newId, save, type AppData, type Habit, type Reminder } from '../lib/storage';
import { syncReminders } from '../lib/reminders';
import type { DateKey } from '../lib/dates';
import type { Status } from '../lib/streak';

export function useHabits() {
  const [data, setData] = useState<AppData>(load);
  const reminder = getReminder(data);

  useEffect(() => save(data), [data]);

  // Reprograma los recordatorios cuando cambian los registros o la configuración,
  // y al volver a la app (por si cambió el día).
  useEffect(() => {
    syncReminders(data.habits, reminder);
    const onVisible = () => document.visibilityState === 'visible' && syncReminders(data.habits, reminder);
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.habits, reminder.enabled, reminder.hour, reminder.minute]);

  const selected: Habit | null =
    data.habits.find((h) => h.id === data.selectedId) ?? data.habits[0] ?? null;

  const select = useCallback((id: string) => setData((d) => ({ ...d, selectedId: id })), []);

  const addHabit = useCallback((name: string) => {
    const habit: Habit = { id: newId(), name: name.trim(), createdAt: new Date().toISOString(), entries: {} };
    setData((d) => ({ ...d, habits: [...d.habits, habit], selectedId: habit.id }));
  }, []);

  const renameHabit = useCallback((id: string, name: string) => {
    setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, name: name.trim() } : h)) }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData((d) => {
      const habits = d.habits.filter((h) => h.id !== id);
      return { ...d, habits, selectedId: habits[0]?.id ?? null };
    });
  }, []);

  const setEntry = useCallback((id: string, day: DateKey, status: Status | null) => {
    setData((d) => ({
      ...d,
      habits: d.habits.map((h) => {
        if (h.id !== id) return h;
        const entries = { ...h.entries };
        if (status) entries[day] = status;
        else delete entries[day];
        return { ...h, entries };
      }),
    }));
  }, []);

  const setReminder = useCallback((r: Reminder) => setData((d) => ({ ...d, reminder: r })), []);

  const replaceAll = useCallback((next: AppData) => setData(next), []);

  return { data, selected, reminder, select, addHabit, renameHabit, deleteHabit, setEntry, setReminder, replaceAll };
}
