import { daysToHope } from '../lib/streak';

interface Props {
  streak: number;
  best: number;
  clean: number;
}

export function Stats({ streak, best, clean }: Props) {
  const toHope = daysToHope(streak);
  const progress = ((streak % 7) / 7) * 100;
  return (
    <section className="stats">
      <div className="stat-row">
        <div className="stat">
          <span className="value">{streak}</span>
          <span className="label">Racha</span>
        </div>
        <div className="stat">
          <span className="value">{best}</span>
          <span className="label">Mejor</span>
        </div>
        <div className="stat">
          <span className="value">{clean}</span>
          <span className="label">Días limpios</span>
        </div>
      </div>
      <div className="hope-progress" aria-label={`Faltan ${toHope} días para hope`}>
        <div className="bar"><div className="fill" style={{ width: `${progress}%` }} /></div>
        <span className="label">Hope en {toHope} {toHope === 1 ? 'día' : 'días'}</span>
      </div>
    </section>
  );
}
