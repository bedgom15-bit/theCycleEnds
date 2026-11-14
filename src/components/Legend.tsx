import type { Mark } from '../lib/streak';
import { MARK_INFO } from '../lib/messages';
import { MarkImage } from './MarkImage';

const ORDER: Mark[] = ['cycle', 'cycleEnds', 'keep', 'hope'];

export function Legend() {
  return (
    <section className="legend">
      {ORDER.map((m) => (
        <div key={m} className="legend-item">
          <MarkImage mark={m} />
          <div>
            <p className="legend-label">{MARK_INFO[m].label}</p>
            <p className="muted">{MARK_INFO[m].meaning}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
