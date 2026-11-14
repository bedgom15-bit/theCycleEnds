export type Panel = 'legend' | 'settings';

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9.5" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6" strokeLinecap="round" />
    <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
      strokeLinejoin="round"
    />
  </svg>
);

/** Accesos a la leyenda y los ajustes: arriba a la derecha en móvil, abajo a la izquierda en PC. */
export function Toolbar({ onOpen }: { onOpen: (p: Panel) => void }) {
  return (
    <div className="toolbar">
      <button className="tool" onClick={() => onOpen('legend')} aria-label="Qué significa cada marca">
        <HelpIcon />
        <span className="tool-label">Qué significa cada marca</span>
      </button>
      <button className="tool" onClick={() => onOpen('settings')} aria-label="Ajustes">
        <GearIcon />
        <span className="tool-label">Ajustes</span>
      </button>
    </div>
  );
}
