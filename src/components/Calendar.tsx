import { useState } from 'react';
import { MONTHS, WEEKDAYS, fromKey, monthGrid, type DateKey } from '../lib/dates';
import type { Mark } from '../lib/streak';
import { MarkImage } from './MarkImage';

interface Props {
  marks: Map<DateKey, Mark>;
  today: DateKey;
  onPick: (day: DateKey) => void;
}

export function Calendar({ marks, today, onPick }: Props) {
  const t = fromKey(today);
  const [view, setView] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const cells = monthGrid(view.y, view.m);
  const isCurrent = view.y === t.getFullYear() && view.m === t.getMonth();

  const move = (delta: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <section className="calendar">
      <header className="cal-head">
        <button className="icon-btn" onClick={() => move(-1)} aria-label="Mes anterior">‹</button>
        <button
          className="cal-title"
          onClick={() => setView({ y: t.getFullYear(), m: t.getMonth() })}
          title="Volver a hoy"
        >
          {MONTHS[view.m]} <span className="muted">{view.y}</span>
        </button>
        <button className="icon-btn" onClick={() => move(1)} disabled={isCurrent} aria-label="Mes siguiente">›</button>
      </header>
      <div className="grid weekdays">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="grid days">
        {cells.map((key, i) => {
          if (!key) return <span key={`e${i}`} className="day empty" />;
          const mark = marks.get(key);
          const future = key > today;
          return (
            <button
              key={key}
              className={`day ${key === today ? 'today' : ''} ${mark ? 'marked' : ''}`}
              disabled={future}
              onClick={() => onPick(key)}
              aria-label={`${fromKey(key).getDate()}${mark ? ` ${mark}` : ''}`}
            >
              {mark && <MarkImage mark={mark} />}
              <span className="num">{fromKey(key).getDate()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
