import { useState } from 'react';
import type { Reminder } from '../lib/storage';
import { requestPermission } from '../lib/reminders';

const KEY = 'cycleEndsHere.nudgeDismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Invitación discreta a activar el recordatorio, visible hasta que se active o se descarte. */
export function ReminderNudge({ reminder, onChange }: { reminder: Reminder; onChange: (r: Reminder) => void }) {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [blocked, setBlocked] = useState(false);
  if (reminder.enabled || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* sin almacenamiento */
    }
    setDismissed(true);
  };

  const enable = async () => {
    const p = await requestPermission().catch(() => 'unsupported');
    if (p === 'granted') onChange({ ...reminder, enabled: true });
    else setBlocked(true);
  };

  return (
    <section className="nudge">
      <p>
        La disciplina necesita constancia. ¿Te recordamos registrar tu día a las{' '}
        {String(reminder.hour).padStart(2, '0')}:{String(reminder.minute).padStart(2, '0')}?
      </p>
      {blocked && <p className="muted small-text">No se pudo activar. Revisa el permiso de notificaciones.</p>}
      <div className="actions">
        <button className="btn small solid" onClick={enable}>Activar</button>
        <button className="btn small" onClick={dismiss}>Ahora no</button>
      </div>
    </section>
  );
}
