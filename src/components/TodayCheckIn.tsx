import type { Mark, Status } from '../lib/streak';
import { MARK_INFO } from '../lib/messages';
import { MarkImage } from './MarkImage';

interface Props {
  status: Status | undefined;
  mark: Mark | undefined;
  message: string;
  onSet: (s: Status) => void;
}

export function TodayCheckIn({ status, mark, message, onSet }: Props) {
  return (
    <section className="checkin">
      {status && mark ? (
        <div className="checkin-done">
          <MarkImage mark={mark} className="checkin-img" />
          <div>
            <p className="eyebrow">Hoy · {MARK_INFO[mark].label}</p>
            <p className="message">{message}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="eyebrow">Hoy</p>
          <p className="question">¿Resististe hoy?</p>
          <p className="message muted">{message}</p>
          <div className="actions">
            <button className="btn solid" onClick={() => onSet('clean')}>Sí, resistí</button>
            <button className="btn" onClick={() => onSet('fall')}>Caí</button>
          </div>
        </>
      )}
    </section>
  );
}
