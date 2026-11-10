import { useState } from 'react';
import { LETTERS, type QuizQ } from '../lib/types';
import { LINES, pick } from '../lib/lines';
import { progressStore } from '../lib/store';
import { buzz, play } from '../lib/fx';
import { Markdown } from './Markdown';
import { NanynkaSays } from './Nanynka';
import { Refs, SourceBadge } from './ui';

interface Props {
  q: QuizQ;
  topicTitle?: string;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
}

/** Klikací ABCD otázka: po výběru ukáže správnost, reakci Nanynky a vysvětlení ke všem možnostem. */
export function QuizCard({ q, topicTitle, onAnswer, onNext, nextLabel = 'Další otázka' }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [line, setLine] = useState('');
  const answered = picked !== null;
  const ok = picked === q.correct;

  const pick_ = (i: number) => {
    if (answered) return;
    const good = i === q.correct;
    setPicked(i);
    onAnswer(good);
    const combo = progressStore.get().game.combo;
    if (good) {
      setLine(combo >= 3 && combo % 3 === 0 ? `${pick(LINES.combo)} ${combo}× v řadě!` : pick(LINES.correct));
      play('good');
      buzz(30);
    } else {
      setLine(pick(LINES.wrong));
      play('bad');
      buzz([60, 40, 60]);
    }
  };

  return (
    <article className="card quiz pop-in">
      {topicTitle && <div className="kicker">{topicTitle}</div>}
      <h2 className="q-text">{q.question}</h2>
      <div className="options">
        {q.options.map((opt, i) => {
          let cls = 'option';
          if (answered) {
            if (i === q.correct) cls += ' correct';
            else if (i === picked) cls += ' wrong';
            else cls += ' dim';
          }
          return (
            <button key={i} className={cls} onClick={() => pick_(i)} disabled={answered && i !== picked && i !== q.correct}>
              <span className="letter">{LETTERS[i]}</span>
              <span className="opt-text">{opt}</span>
              {answered && i === q.correct && <span className="mark">✓</span>}
              {answered && i === picked && !ok && <span className="mark">✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`explain ${ok ? 'is-ok' : 'is-bad'}`}>
          <NanynkaSays mood={ok ? 'cheer' : 'sad'} size={64} className="react">
            <b>{line}</b>
            {!ok && <div className="small">Správná odpověď je {LETTERS[q.correct]}.</div>}
          </NanynkaSays>
          <div className="explain-body">
            <Markdown text={q.explanation} />
          </div>
          {q.optionNotes && q.optionNotes.length > 0 && (
            <ul className="opt-notes">
              {q.optionNotes.map((n, i) =>
                n ? (
                  <li key={i} className={i === q.correct ? 'good' : i === picked ? 'bad' : ''}>
                    <span className="note-letter">{LETTERS[i]}</span>
                    <span>{n}</span>
                  </li>
                ) : null,
              )}
            </ul>
          )}
          <div className="meta-row">
            <Refs refs={q.refs} />
            <SourceBadge source={q.source} />
          </div>
          <button className="btn primary block" onClick={onNext} autoFocus>
            {nextLabel} →
          </button>
        </div>
      )}
    </article>
  );
}
