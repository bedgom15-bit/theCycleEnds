import { useRef, useState } from 'react';
import { parseImport, type AppData, type Habit } from '../lib/storage';
import { exportBackup } from '../lib/backup';
import { APP_VERSION } from '../lib/version';

interface Props {
  data: AppData;
  habit: Habit | null;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onImport: (d: AppData) => void;
}

export function Settings({ data, habit, onRename, onDelete, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');

  const doExport = async () => {
    const result = await exportBackup(data);
    if (result === 'error') setNote('No se pudo exportar el respaldo.');
    else if (result === 'downloaded') setNote('Respaldo descargado.');
    else setNote('');
  };

  const doImport = async (file: File) => {
    const parsed = parseImport(await file.text());
    if (!parsed) return setNote('Archivo no válido.');
    if (confirm('Esto reemplazará todos tus datos actuales. ¿Continuar?')) {
      onImport(parsed);
      setNote('Respaldo importado.');
    }
  };

  return (
    <section className="settings">
      {habit && (
        <div className="settings-group">
          <p className="eyebrow">Hábito</p>
          <div className="actions">
            <button
              className="btn small"
              onClick={() => {
                const n = prompt('Nuevo nombre', habit.name);
                if (n && n.trim()) onRename(habit.id, n);
              }}
            >
              Renombrar
            </button>
            <button
              className="btn small"
              onClick={() => confirm(`¿Eliminar "${habit.name}" y todo su historial?`) && onDelete(habit.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
      <div className="settings-group">
        <p className="eyebrow">Respaldo</p>
        <p className="muted small-text">Tus datos solo viven en este dispositivo.</p>
        <div className="actions">
          <button className="btn small" onClick={doExport}>Exportar</button>
          <button className="btn small" onClick={() => fileRef.current?.click()}>Importar</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) doImport(f);
            e.target.value = '';
          }}
        />
        {note && <p className="muted small-text">{note}</p>}
      </div>
      <p className="muted small-text">Versión {APP_VERSION}</p>
    </section>
  );
}
