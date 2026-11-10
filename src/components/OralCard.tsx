import { useState } from 'react';
import type { OralQ } from '../lib/types';
import type { Grade } from '../lib/progress';
import { LINES, pick } from '../lib/lines';
import { play } from '../lib/fx';
import { Markdown } from './Markdown';
import { NanynkaSays } from './Nanynka';
import { Refs, SourceBadge } from './ui';

interface Props {
  q: OralQ;
  topicTitle?: string;
  onGrade: (g: Grade) => void;
}

/** Kartička k ústní zkoušce: otázka → odkrýt odpověď → sebehodnocení. */
export function OralCard({ q, topicTitle, onGrade }: Props) {
  const [open, setOpen] = useState(false);
  const [hint] = useState(() => pick(LINES.oralHint));
  return (
    <article className="card oral pop-in">
      {topicTitle && <div className="kicker">{topicTitle}</div>}
      <h2 className="q-text">{q.question}</h2>
      {!open ? (
        <>
          <NanynkaSays mood="think" size={60} className="hint">
            {hint}
          </NanynkaSays>
          <button
            className="btn primary block"
            onClick={() => {
              setOpen(true);
              play('pop');
            }}
            autoFocus
          >
            Ukázat odpověď 👀
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
            <button className="btn grade bad" onClick={() => (play('bad'), onGrade('bad'))}>
              <span className="grade-emoji">😬</span>Neuměl/a
            </button>
            <button className="btn grade partial" onClick={() => (play('pop'), onGrade('partial'))}>
              <span className="grade-emoji">🤏</span>Částečně
            </button>
            <button className="btn grade good" onClick={() => (play('good'), onGrade('good'))}>
              <span className="grade-emoji">😎</span>Uměl/a
            </button>
          </div>
        </>
      )}
    </article>
  );
}
