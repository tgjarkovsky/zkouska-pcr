import type { ReactNode } from 'react';
import { ProgressBar } from './ui';

export function SessionHead({ index, total, good, bad }: { index: number; total: number; good: number; bad: number }) {
  return (
    <div className="session-head">
      <div className="session-meta">
        <span>
          {Math.min(index + 1, total)} / {total}
        </span>
        <span className="score">
          <span className="good">✓ {good}</span> <span className="bad">✗ {bad}</span>
        </span>
      </div>
      <ProgressBar value={index} total={total} />
    </div>
  );
}

export function SessionDone({
  good,
  bad,
  partial = 0,
  onRestart,
  extra,
}: {
  good: number;
  bad: number;
  partial?: number;
  onRestart: () => void;
  extra?: ReactNode;
}) {
  const total = good + bad + partial;
  const pct = total ? Math.round((good / total) * 100) : 0;
  return (
    <div className="card done">
      <div className="done-ring" style={{ ['--p' as string]: pct }}>
        <span>{pct} %</span>
      </div>
      <h2>Kolo dokončeno</h2>
      <p className="muted">
        Správně {good}
        {partial ? `, částečně ${partial}` : ''}, špatně {bad}. Chybné otázky se ti v opakování vrátí dřív.
      </p>
      <div className="stack">
        <button className="btn primary block" onClick={onRestart}>
          Další kolo
        </button>
        {extra}
        <a className="btn ghost block" href="#/">
          Zpět na přehled
        </a>
      </div>
    </div>
  );
}
