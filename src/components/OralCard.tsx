import { useState } from 'react';
import type { OralQ } from '../lib/types';
import type { Grade } from '../lib/progress';
import { Markdown } from './Markdown';
import { Refs, SourceBadge } from './ui';

interface Props {
  q: OralQ;
  topicTitle?: string;
  onGrade: (g: Grade) => void;
}

/** Kartička k ústní zkoušce: otázka → odkrýt odpověď → sebehodnocení. */
export function OralCard({ q, topicTitle, onGrade }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <article className="card oral">
      {topicTitle && <div className="kicker">{topicTitle}</div>}
      <h2 className="q-text">{q.question}</h2>
      {!open ? (
        <>
          <p className="muted hint">Zkus si odpověď nejdřív říct nahlas, pak si ji odkryj.</p>
          <button className="btn primary block" onClick={() => setOpen(true)} autoFocus>
            Ukázat odpověď
          </button>
        </>
      ) : (
        <>
          <div className="answer">
            <Markdown text={q.answer} />
          </div>
          <div className="meta-row">
            <Refs refs={q.refs} />
            <SourceBadge source={q.source} />
          </div>
          <p className="muted center small">Jak ti to šlo?</p>
          <div className="grade-row">
            <button className="btn grade bad" onClick={() => onGrade('bad')}>
              Neuměl/a
            </button>
            <button className="btn grade partial" onClick={() => onGrade('partial')}>
              Částečně
            </button>
            <button className="btn grade good" onClick={() => onGrade('good')}>
              Uměl/a
            </button>
          </div>
        </>
      )}
    </article>
  );
}
