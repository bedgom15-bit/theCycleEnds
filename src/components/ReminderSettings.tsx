import { useEffect, useState } from 'react';
import type { Reminder } from '../lib/storage';
import {
  checkExactAlarms,
  checkPermission,
  isNative,
  openExactAlarmSettings,
  requestPermission,
  type ExactState,
  type PermissionState,
} from '../lib/reminders';

const pad = (n: number) => String(n).padStart(2, '0');

interface Props {
  reminder: Reminder;
  onChange: (r: Reminder) => void;
}

export function ReminderSettings({ reminder, onChange }: Props) {
  const [perm, setPerm] = useState<PermissionState>('prompt');

  const [exact, setExact] = useState<ExactState>('unsupported');

  useEffect(() => {
    checkPermission().then(setPerm).catch(() => setPerm('unsupported'));
    const refreshExact = () => checkExactAlarms().then(setExact);
    refreshExact();
    // Al volver de los ajustes del sistema, vuelve a consultar el permiso.
    const onVisible = () => document.visibilityState === 'visible' && refreshExact();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const toggle = async () => {
    if (reminder.enabled) return onChange({ ...reminder, enabled: false });
    const p = perm === 'granted' ? perm : await requestPermission().catch(() => 'unsupported' as const);
    setPerm(p);
    if (p === 'granted') onChange({ ...reminder, enabled: true });
  };

  const setTime = (value: string) => {
    const [h, m] = value.split(':').map(Number);
    if (Number.isInteger(h) && Number.isInteger(m)) onChange({ ...reminder, hour: h, minute: m });
  };

  return (
    <div className="reminder">
      <div className="reminder-row">
        <div>
          <p className="reminder-title">Recordatorio diario</p>
          <p className="muted small-text">Te avisaremos si aún no registraste tu día.</p>
        </div>
        <button
          role="switch"
          aria-checked={reminder.enabled}
          aria-label="Recordatorio diario"
          className={`switch ${reminder.enabled ? 'on' : ''}`}
          onClick={toggle}
          disabled={perm === 'unsupported'}
        >
          <span />
        </button>
      </div>
      {reminder.enabled && (
        <label className="reminder-row">
          <span className="eyebrow">Hora</span>
          <input
            type="time"
            className="time-input"
            value={`${pad(reminder.hour)}:${pad(reminder.minute)}`}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      )}
      {reminder.enabled && exact === 'denied' && (
        <div className="reminder-row">
          <p className="muted small-text">
            Android puede retrasar el aviso varios minutos. Permite «Alarmas y recordatorios» para que llegue a la hora
            exacta.
          </p>
          <button className="btn small" onClick={() => openExactAlarmSettings().then(setExact)}>
            Hora exacta
          </button>
        </div>
      )}
      {perm === 'denied' && (
        <p className="muted small-text">
          Las notificaciones están bloqueadas. Actívalas en los ajustes de tu {isNative() ? 'teléfono' : 'navegador'}.
        </p>
      )}
      {perm === 'unsupported' && <p className="muted small-text">Este navegador no admite notificaciones.</p>}
      {!isNative() && perm !== 'unsupported' && (
        <p className="muted small-text">En la web solo llegan con la app abierta. En la app móvil llegan siempre.</p>
      )}
    </div>
  );
}
