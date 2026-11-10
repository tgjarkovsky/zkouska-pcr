import { useEffect, useRef, useState } from 'react';
import { LETTERS, type Content, type OralQ, type QuizQ } from '../lib/types';
import { buildQuizExam, drawOral, formatTime, scoreExam, type ExamScore, type ExamSettings } from '../lib/exam';
import { okey, qkey, type Grade } from '../lib/progress';
import { progressStore, settingsStore, useSettings } from '../lib/store';
import { Markdown } from '../components/Markdown';
import { OralCard } from '../components/OralCard';
import { Empty, ScreenHeader } from '../components/ui';

type Phase =
  | { kind: 'setup' }
  | { kind: 'quiz'; questions: QuizQ[]; startedAt: number }
  | { kind: 'result'; questions: QuizQ[]; answers: (number | null)[]; score: ExamScore; durationSec: number }
  | { kind: 'oral'; questions: OralQ[]; startedAt: number };

export function Exam({ content }: { content: Content }) {
  const settings = useSettings();
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' });
  const s = settings.exam;
  const setS = (patch: Partial<ExamSettings>) => settingsStore.set({ ...settings, exam: { ...s, ...patch } });

  if (phase.kind === 'quiz')
    return (
      <QuizExam
        questions={phase.questions}
        settings={s}
        startedAt={phase.startedAt}
        onFinish={(answers) => {
          const score = scoreExam(phase.questions, answers, s.passPercent);
          const durationSec = Math.round((Date.now() - phase.startedAt) / 1000);
          progressStore.gradeMany(
            phase.questions.map((q, i): [string, Grade] => [qkey(q.id), answers[i] === q.correct ? 'good' : 'bad']),
          );
          progressStore.addExam({ date: Date.now(), ...score, durationSec });
          setPhase({ kind: 'result', questions: phase.questions, answers, score, durationSec });
        }}
      />
    );
  if (phase.kind === 'result') return <QuizResult {...phase} onAgain={() => setPhase({ kind: 'setup' })} />;
  if (phase.kind === 'oral')
    return (
      <OralExam
        questions={phase.questions}
        startedAt={phase.startedAt}
        topicTitle={(id) => content.topics.find((t) => t.id === id)?.title}
        onDone={() => setPhase({ kind: 'setup' })}
      />
    );

  const topics = content.topics;
  const selected = s.topicIds ?? topics.map((t) => t.id);
  const toggleTopic = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setS({ topicIds: next.length === topics.length ? null : next });
  };
  const quizPool = content.quiz.filter((q) => selected.includes(q.topicId)).length;
  const oralPool = content.oral.filter((q) => selected.includes(q.topicId)).length;

  return (
    <div className="screen">
      <ScreenHeader title="Simulace zkoušky" sub="Zkouška nanečisto – bez nápovědy, vyhodnocení až na konci." />

      <section className="card">
        <h3>Test ABCD</h3>
        <div className="form-grid">
          <NumField label="Počet otázek" value={s.quizCount} min={1} max={200} onChange={(v) => setS({ quizCount: v })} />
          <NumField label="Časový limit (min)" value={s.minutes} min={1} max={240} onChange={(v) => setS({ minutes: v })} />
          <NumField label="Hranice úspěchu (%)" value={s.passPercent} min={1} max={100} onChange={(v) => setS({ passPercent: v })} />
        </div>
        <p className="muted small">
          K dispozici {quizPool} otázek
          {quizPool < s.quizCount && quizPool > 0 ? ` – použije se všech ${quizPool}` : ''}.
        </p>
        <button
          className="btn primary block"
          disabled={quizPool === 0}
          onClick={() => setPhase({ kind: 'quiz', questions: buildQuizExam(content.quiz, s), startedAt: Date.now() })}
        >
          Spustit test
        </button>
      </section>

      <section className="card">
        <h3>Ústní zkouška</h3>
        <div className="form-grid">
          <NumField label="Počet losovaných otázek" value={s.oralCount} min={1} max={10} onChange={(v) => setS({ oralCount: v })} />
        </div>
        <p className="muted small">Vylosuje otázky pokud možno z různých okruhů a spustí stopky na přípravu.</p>
        <button
          className="btn primary block"
          disabled={oralPool === 0}
          onClick={() => setPhase({ kind: 'oral', questions: drawOral(content.oral, s), startedAt: Date.now() })}
        >
          Vylosovat otázky
        </button>
      </section>

      {topics.length > 1 && (
        <section className="card">
          <h3>Okruhy ve zkoušce</h3>
          <div className="checks">
            {topics.map((t) => (
              <label key={t.id} className="check">
                <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleTopic(t.id)} />
                {t.title}
              </label>
            ))}
          </div>
        </section>
      )}
      {content.quiz.length === 0 && content.oral.length === 0 && <Empty title="Zatím nejsou nahrané žádné otázky" />}
    </div>
  );
}

function NumField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, Math.round(v))));
        }}
      />
    </label>
  );
}

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function QuizExam({
  questions,
  settings,
  startedAt,
  onFinish,
}: {
  questions: QuizQ[];
  settings: ExamSettings;
  startedAt: number;
  onFinish: (answers: (number | null)[]) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [i, setI] = useState(0);
  const now = useNow();
  const left = settings.minutes * 60 - (now - startedAt) / 1000;
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish(answers);
  };
  useEffect(() => {
    if (left <= 0) finish();
  });

  const q = questions[i];
  const unanswered = answers.filter((a) => a === null).length;

  return (
    <div className="screen">
      <div className="exam-bar">
        <span>
          Otázka {i + 1} / {questions.length}
        </span>
        <span className={`timer ${left < 60 ? 'urgent' : ''}`}>⏱ {formatTime(left)}</span>
      </div>
      <article className="card quiz">
        <h2 className="q-text">{q.question}</h2>
        <div className="options">
          {q.options.map((opt, k) => (
            <button
              key={k}
              className={`option ${answers[i] === k ? 'selected' : ''}`}
              onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? k : x)))}
            >
              <span className="letter">{LETTERS[k]}</span>
              <span className="opt-text">{opt}</span>
            </button>
          ))}
        </div>
        <div className="row">
          <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
            ← Předchozí
          </button>
          {i < questions.length - 1 ? (
            <button className="btn primary" onClick={() => setI(i + 1)}>
              Další →
            </button>
          ) : (
            <button
              className="btn primary"
              onClick={() => (unanswered === 0 || confirm(`Nezodpovězeno: ${unanswered}. Opravdu odevzdat?`)) && finish()}
            >
              Odevzdat
            </button>
          )}
        </div>
      </article>
      <div className="dots">
        {questions.map((_, k) => (
          <button
            key={k}
            className={`qdot ${answers[k] !== null ? 'filled' : ''} ${k === i ? 'current' : ''}`}
            onClick={() => setI(k)}
            aria-label={`Otázka ${k + 1}`}
          >
            {k + 1}
          </button>
        ))}
      </div>
      <button
        className="btn ghost block"
        onClick={() => (unanswered === 0 || confirm(`Nezodpovězeno: ${unanswered}. Opravdu odevzdat?`)) && finish()}
      >
        Odevzdat test
      </button>
    </div>
  );
}

function QuizResult({
  questions,
  answers,
  score,
  durationSec,
  onAgain,
}: {
  questions: QuizQ[];
  answers: (number | null)[];
  score: ExamScore;
  durationSec: number;
  onAgain: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="screen">
      <div className={`card result ${score.passed ? 'passed' : 'failed'}`}>
        <div className="done-ring" style={{ ['--p' as string]: score.percent }}>
          <span>{score.percent} %</span>
        </div>
        <h2>{score.passed ? 'Uspěl/a jsi ✅' : 'Tentokrát to nevyšlo ❌'}</h2>
        <p className="muted">
          Správně {score.correct} z {score.total} · čas {formatTime(durationSec)}
        </p>
        <div className="stack">
          {score.wrongIds.length > 0 && (
            <a className="btn primary block" href={`#/test?ids=${score.wrongIds.join(',')}`}>
              Procvičit chybné ({score.wrongIds.length})
            </a>
          )}
          <button className="btn block" onClick={onAgain}>
            Nová simulace
          </button>
        </div>
      </div>

      <div className="row between">
        <h3>Rozbor</h3>
        <button className="btn ghost small" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Jen chybné' : 'Zobrazit vše'}
        </button>
      </div>
      {questions.map((q, i) => {
        const ok = answers[i] === q.correct;
        if (ok && !showAll) return null;
        return (
          <div key={q.id} className={`card review-item ${ok ? 'is-ok' : 'is-bad'}`}>
            <div className="kicker">
              {i + 1}. {ok ? '✓ správně' : '✗ chybně'}
            </div>
            <h4>{q.question}</h4>
            <p>
              Tvoje odpověď:{' '}
              <b>{answers[i] === null ? '— nezodpovězeno' : `${LETTERS[answers[i]!]} ${q.options[answers[i]!]}`}</b>
              <br />
              Správně: <b>{`${LETTERS[q.correct]} ${q.options[q.correct]}`}</b>
            </p>
            {!ok && <Markdown text={q.explanation} />}
            {!ok && answers[i] !== null && q.optionNotes?.[answers[i]!] && (
              <p className="muted small">
                Proč ne {LETTERS[answers[i]!]}: {q.optionNotes[answers[i]!]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OralExam({
  questions,
  startedAt,
  topicTitle,
  onDone,
}: {
  questions: OralQ[];
  startedAt: number;
  topicTitle: (id: string) => string | undefined;
  onDone: () => void;
}) {
  const now = useNow();
  const [answering, setAnswering] = useState(false);
  const [i, setI] = useState(0);

  if (!answering) {
    return (
      <div className="screen">
        <div className="exam-bar">
          <span>Příprava</span>
          <span className="timer">⏱ {formatTime((now - startedAt) / 1000)}</span>
        </div>
        <div className="card">
          <h3>Vylosované otázky</h3>
          <ol className="drawn">
            {questions.map((q) => (
              <li key={q.id}>
                <span className="kicker">{topicTitle(q.topicId)}</span>
                {q.question}
              </li>
            ))}
          </ol>
          <p className="muted small">Připrav si osnovu odpovědí. Až budeš připraven/a, projdi odpovědi a ohodnoť se.</p>
          <button className="btn primary block" onClick={() => setAnswering(true)}>
            Jsem připraven/a – ukázat odpovědi
          </button>
        </div>
      </div>
    );
  }

  if (i >= questions.length) {
    return (
      <div className="screen">
        <div className="card done">
          <h2>Ústní zkouška nanečisto dokončena</h2>
          <p className="muted">Celkový čas {formatTime((now - startedAt) / 1000)}.</p>
          <button className="btn primary block" onClick={onDone}>
            Zpět na simulace
          </button>
        </div>
      </div>
    );
  }
  const q = questions[i];
  return (
    <div className="screen">
      <div className="exam-bar">
        <span>
          Otázka {i + 1} / {questions.length}
        </span>
        <span className="timer">⏱ {formatTime((now - startedAt) / 1000)}</span>
      </div>
      <OralCard
        key={q.id}
        q={q}
        topicTitle={topicTitle(q.topicId)}
        onGrade={(g) => {
          progressStore.grade(okey(q.id), g);
          setI(i + 1);
        }}
      />
    </div>
  );
}
