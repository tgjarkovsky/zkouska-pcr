import { useEffect, useState, type ReactNode } from 'react';
import { useProgress } from '../lib/store';
import { LINES, pick } from '../lib/lines';
import { confetti, play } from '../lib/fx';
import { NanynkaSays } from './Nanynka';

export function SessionHead({ index, total, good, bad }: { index: number; total: number; good: number; bad: number }) {
  const combo = useProgress().game.combo;
  const pct = total ? (index / total) * 100 : 0;
  return (
    <div className="session-head">
      <div className="track">
        <span style={{ width: `${pct}%` }} />
        <i className="runner" style={{ left: `${pct}%` }} aria-hidden>
          🚓
        </i>
      </div>
      <div className="session-meta">
        <span>
          {Math.min(index + 1, total)} / {total}
        </span>
        <span className="score">
          {combo >= 3 && <span className="combo">🔥 {combo}</span>}
          <span className="good">✓ {good}</span> <span className="bad">✗ {bad}</span>
        </span>
      </div>
    </div>
  );
}

/** Záznam XP na začátku kola, aby šlo ukázat, kolik se získalo. */
export function useXpStart() {
  const xp = useProgress().game.xp;
  const [start, setStart] = useState(xp);
  return [start, () => setStart(xp)] as const;
}

export function SessionDone({
  good,
  bad,
  partial = 0,
  xpStart,
  onRestart,
  extra,
}: {
  good: number;
  bad: number;
  partial?: number;
  xpStart: number;
  onRestart: () => void;
  extra?: ReactNode;
}) {
  const total = good + bad + partial;
  const pct = total ? Math.round(((good + partial / 2) / total) * 100) : 0;
  const xp = useProgress().game.xp;
  const [line] = useState(() => pick(pct >= 80 ? LINES.doneGreat : pct >= 50 ? LINES.doneOk : LINES.donePoor));
  useEffect(() => {
    if (pct >= 80) {
      confetti();
      play('fanfare');
    }
  }, [pct]);

  return (
    <div className="card done pop-in">
      <NanynkaSays mood={pct >= 80 ? 'cheer' : pct >= 50 ? 'happy' : 'sad'} size={96}>
        {line}
      </NanynkaSays>
      <div className="done-ring" style={{ ['--p' as string]: pct }}>
        <span>{pct} %</span>
      </div>
      <div className="done-stats">
        <span className="pill ok">✓ {good}</span>
        {partial > 0 && <span className="pill warn">≈ {partial}</span>}
        <span className="pill bad">✗ {bad}</span>
        <span className="pill xp">+{xp - xpStart} XP</span>
      </div>
      <div className="stack">
        <button className="btn primary block" onClick={onRestart}>
          Další kolo 💪
        </button>
        {extra}
        <a className="btn ghost block" href="#/">
          Zpět na přehled
        </a>
      </div>
    </div>
  );
}
