import { useEffect } from 'react';
import { dismissCelebration, useCelebrations } from '../lib/celebrate';
import { confetti, play } from '../lib/fx';
import { LINES, pick } from '../lib/lines';
import { Nanynka } from './Nanynka';

/** Překryvné okno při povýšení nebo novém odznaku. */
export function Celebrations() {
  const queue = useCelebrations();
  const c = queue[0];
  useEffect(() => {
    if (!c) return;
    confetti();
    play('fanfare');
  }, [c?.id]);
  if (!c) return null;
  return (
    <div className="overlay" role="dialog" aria-modal="true" onClick={dismissCelebration}>
      <div className="card celebrate pop-in" onClick={(e) => e.stopPropagation()}>
        <Nanynka mood="cheer" size={150} />
        <div className="celebrate-kicker">{c.kind === 'rank' ? 'Povýšení!' : 'Nový odznak!'}</div>
        <div className="celebrate-icon">{c.icon}</div>
        <h2>{c.title}</h2>
        <p className="muted">{c.desc ?? pick(c.kind === 'rank' ? LINES.levelUp : LINES.badge)}</p>
        <button className="btn primary block" onClick={dismissCelebration} autoFocus>
          Paráda! 🎉
        </button>
      </div>
    </div>
  );
}
