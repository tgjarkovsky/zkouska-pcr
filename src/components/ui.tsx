import type { ReactNode } from 'react';
import type { Source, Topic } from '../lib/types';
import { Nanynka, type Mood } from './Nanynka';

export function SourceBadge({ source }: { source?: Source }) {
  if (!source) return null;
  const map: Record<Source, [string, string]> = {
    podklad: ['Z podkladu', 'badge-ok'],
    ai: ['Vypracováno AI – ověř', 'badge-warn'],
    mix: ['Podklad + doplněno AI', 'badge-info'],
  };
  const [label, cls] = map[source];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function Refs({ refs }: { refs?: string[] }) {
  if (!refs?.length) return null;
  return (
    <div className="refs">
      {refs.map((r) => (
        <span key={r} className="ref">
          {r}
        </span>
      ))}
    </div>
  );
}

export function ProgressBar({ value, total, tone = 'brand' }: { value: number; total: number; tone?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`bar bar-${tone}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TopicChips({
  topics,
  value,
  onChange,
}: {
  topics: Topic[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  if (topics.length < 2) return null;
  return (
    <div className="chips" role="tablist">
      <button className={`chip ${value === null ? 'on' : ''}`} onClick={() => onChange(null)}>
        Vše
      </button>
      {topics.map((t) => (
        <button key={t.id} className={`chip ${value === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}>
          {t.title}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, children, mood = 'think' }: { title: string; children?: ReactNode; mood?: Mood }) {
  return (
    <div className="empty pop-in">
      <Nanynka mood={mood} size={130} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function ScreenHeader({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="screen-header">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {right}
    </header>
  );
}
