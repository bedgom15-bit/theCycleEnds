import { useEffect } from 'react';
import { formatLong, type DateKey } from '../lib/dates';
import type { Mark, Status } from '../lib/streak';
import { MARK_INFO } from '../lib/messages';
import { MarkImage } from './MarkImage';

interface Props {
  day: DateKey;
  status: Status | undefined;
  mark: Mark | undefined;
  onSet: (status: Status | null) => void;
  onClose: () => void;
}

export function DaySheet({ day, status, mark, onSet, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">{formatLong(day)}</p>
        {mark && (
          <div className="sheet-mark">
            <MarkImage mark={mark} />
            <p>{MARK_INFO[mark].meaning}</p>
          </div>
        )}
        <div className="actions">
          <button className={`btn ${status === 'clean' ? 'solid' : ''}`} onClick={() => onSet('clean')}>
            No caí
          </button>
          <button className={`btn ${status === 'fall' ? 'solid' : ''}`} onClick={() => onSet('fall')}>
            Caí
          </button>
        </div>
        {status && (
          <button className="link" onClick={() => onSet(null)}>Borrar registro</button>
        )}
      </div>
    </div>
  );
}
