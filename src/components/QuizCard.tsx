import { useState } from 'react';
import { LETTERS, type QuizQ } from '../lib/types';
import { Markdown } from './Markdown';
import { Refs, SourceBadge } from './ui';

interface Props {
  q: QuizQ;
  topicTitle?: string;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
}

/** Klikací ABCD otázka: po výběru ukáže správnost a vysvětlení ke všem možnostem. */
export function QuizCard({ q, topicTitle, onAnswer, onNext, nextLabel = 'Další otázka' }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const ok = picked === q.correct;

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    onAnswer(i === q.correct);
  };

  return (
    <article className="card quiz">
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
            <button key={i} className={cls} onClick={() => pick(i)} disabled={answered && i !== picked && i !== q.correct}>
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
          <div className="verdict">
            {ok ? 'Správně!' : `Špatně – správná odpověď je ${LETTERS[q.correct]}.`}
          </div>
          <Markdown text={q.explanation} />
          {q.optionNotes && q.optionNotes.length > 0 && (
            <ul className="opt-notes">
              {q.optionNotes.map((n, i) =>
                n ? (
                  <li key={i} className={i === q.correct ? 'good' : ''}>
                    <b>{LETTERS[i]}</b> {i === q.correct ? '✓' : '✗'} {n}
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
