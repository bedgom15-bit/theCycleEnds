import { MarkImage } from './MarkImage';

export function Celebration({ streak, onClose }: { streak: number; onClose: () => void }) {
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="celebration" role="dialog" aria-modal="true">
        <MarkImage mark="hope" />
        <p className="eyebrow">{streak} días</p>
        <p className="question">Hope.</p>
        <p className="muted">Una semana más sin caer. Esto ya no es suerte: es disciplina.</p>
        <button className="btn solid" onClick={onClose}>Seguir</button>
      </div>
    </div>
  );
}
