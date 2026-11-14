import type { Mark } from '../lib/streak';
import { MARK_INFO } from '../lib/messages';

export function MarkImage({ mark, className = '' }: { mark: Mark; className?: string }) {
  return (
    <img
      className={`mark ${className}`}
      src={`${import.meta.env.BASE_URL}marks/${mark}.jpg`}
      alt={MARK_INFO[mark].label}
      draggable={false}
    />
  );
}
