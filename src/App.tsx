import { useMemo, useState } from 'react';
import { useHabits } from './state/useHabits';
import { todayKey, type DateKey } from './lib/dates';
import { bestStreak, computeMarks, currentStreak, totals, type Status } from './lib/streak';
import { motivation } from './lib/messages';
import { HabitList } from './components/HabitList';
import { TodayCheckIn } from './components/TodayCheckIn';
import { Stats } from './components/Stats';
import { Calendar } from './components/Calendar';
import { DaySheet } from './components/DaySheet';
import { Legend } from './components/Legend';
import { Settings } from './components/Settings';
import { Celebration } from './components/Celebration';
import { ReminderSettings } from './components/ReminderSettings';
import { ReminderNudge } from './components/ReminderNudge';
import { Toolbar, type Panel } from './components/Toolbar';
import { Modal } from './components/Modal';

export default function App() {
  const { data, selected, reminder, select, addHabit, renameHabit, deleteHabit, setEntry, setReminder, replaceAll } =
    useHabits();
  const [picked, setPicked] = useState<DateKey | null>(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const today = todayKey();

  const entries = selected?.entries ?? {};
  const marks = useMemo(() => computeMarks(entries), [entries]);
  const streak = currentStreak(entries, today);
  const best = bestStreak(entries);
  const { clean } = totals(entries);

  const set = (day: DateKey, status: Status | null) => {
    if (!selected) return;
    setEntry(selected.id, day, status);
    if (day === today && status === 'clean') {
      const after = computeMarks({ ...entries, [day]: 'clean' });
      if (after.get(day) === 'hope') setCelebrate(currentStreak({ ...entries, [day]: 'clean' }, today));
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">The cycle<br />ends here.</h1>
        <Toolbar onOpen={setPanel} />
        <HabitList habits={data.habits} selectedId={selected?.id ?? null} onSelect={select} onAdd={addHabit} />
      </aside>

      <main className="main">
        {selected ? (
          <>
            <h2 className="habit-title">{selected.name}</h2>
            <TodayCheckIn
              status={entries[today]}
              mark={marks.get(today)}
              message={motivation(streak, marks.get(today), today in entries)}
              onSet={(s) => set(today, s)}
            />
            <ReminderNudge reminder={reminder} onChange={setReminder} />
            <Stats streak={streak} best={best} clean={clean} />
            <Calendar marks={marks} today={today} onPick={setPicked} />
          </>
        ) : (
          <section className="empty-state">
            <p className="question">Todo ciclo puede romperse.</p>
            <p className="muted">
              Añade el hábito o la adicción que quieres dejar atrás. Cada día registrarás si resististe.
              La constancia hará el resto.
            </p>
            <Legend />
          </section>
        )}
      </main>

      {picked && selected && (
        <DaySheet
          day={picked}
          status={entries[picked]}
          mark={marks.get(picked)}
          onSet={(s) => {
            set(picked, s);
            setPicked(null);
          }}
          onClose={() => setPicked(null)}
        />
      )}
      {panel === 'legend' && (
        <Modal title="Qué significa cada marca" onClose={() => setPanel(null)}>
          <Legend />
        </Modal>
      )}
      {panel === 'settings' && (
        <Modal title="Ajustes" onClose={() => setPanel(null)}>
          <>
            {selected && <ReminderSettings reminder={reminder} onChange={setReminder} />}
            <Settings
              data={data}
              habit={selected}
              onRename={renameHabit}
              onDelete={(id) => {
                deleteHabit(id);
                setPanel(null);
              }}
              onImport={(d) => {
                replaceAll(d);
                setPanel(null);
              }}
            />
          </>
        </Modal>
      )}
      {celebrate !== null && <Celebration streak={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}
