import { useState } from 'react';
import type { Habit } from '../lib/storage';
import { currentStreak } from '../lib/streak';
import { todayKey } from '../lib/dates';

interface Props {
  habits: Habit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
}

export function HabitList({ habits, selectedId, onSelect, onAdd }: Props) {
  const [adding, setAdding] = useState(habits.length === 0);
  const [name, setName] = useState('');
  const today = todayKey();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName('');
    setAdding(false);
  };

  return (
    <nav className="habits" aria-label="Hábitos">
      <ul>
        {habits.map((h) => (
          <li key={h.id}>
            <button
              className={`habit ${h.id === selectedId ? 'active' : ''}`}
              onClick={() => onSelect(h.id)}
            >
              <span className="habit-name">{h.name}</span>
              <span className="habit-streak">{currentStreak(h.entries, today)}</span>
            </button>
          </li>
        ))}
        <li>
          {adding ? (
            <form className="add-form" onSubmit={submit}>
              <input
                autoFocus
                value={name}
                maxLength={40}
                placeholder="¿Qué quieres dejar?"
                onChange={(e) => setName(e.target.value)}
                onBlur={() => !name && habits.length > 0 && setAdding(false)}
              />
              <button type="submit" className="btn solid small">Añadir</button>
            </form>
          ) : (
            <button className="habit add" onClick={() => setAdding(true)}>+ Nuevo</button>
          )}
        </li>
      </ul>
    </nav>
  );
}
