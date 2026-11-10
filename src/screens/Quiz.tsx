import { useMemo, useState } from 'react';
import type { Content } from '../lib/types';
import { orderForPractice, qkey, unseen } from '../lib/progress';
import { progressStore } from '../lib/store';
import { go, type Route } from '../lib/router';
import { QuizCard } from '../components/QuizCard';
import { SessionDone, SessionHead } from '../components/Session';
import { Empty, ScreenHeader, TopicChips } from '../components/ui';

const testPath = (topic: string | null, onlyNew: boolean) => {
  const p = new URLSearchParams();
  if (topic) p.set('t', topic);
  if (onlyNew) p.set('n', '1');
  const s = p.toString();
  return `/test${s ? `?${s}` : ''}`;
};

export function Quiz({ content, route }: { content: Content; route: Route }) {
  const topics = content.topics.filter((t) => t.parts.includes('quiz'));
  const topic = route.query.get('t');
  const onlyNew = route.query.get('n') === '1';
  const ids = route.query.get('ids')?.split(',').filter(Boolean) ?? null;

  // pokrok se čte jen při vstupu, aby se balíček během procvičování nezmenšoval
  const { pool, newCount } = useMemo(() => {
    const inScope = content.quiz.filter((q) => (ids ? ids.includes(q.id) : !topic || q.topicId === topic));
    const fresh = new Set(unseen(inScope.map((q) => qkey(q.id)), progressStore.get().items));
    const pool = onlyNew && !ids ? inScope.filter((q) => fresh.has(qkey(q.id))) : inScope;
    return { pool, newCount: fresh.size };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.quiz, topic, onlyNew, ids?.join(',')]);
  const topicTitle = (id: string) => content.topics.find((t) => t.id === id)?.title;

  return (
    <div className="screen">
      <ScreenHeader
        title="Test ABCD"
        sub={ids ? `Procvičení ${pool.length} chybných otázek` : `${pool.length} ${onlyNew ? 'nových ' : ''}otázek`}
        right={
          !ids && (
            <div className="seg">
              <button className={onlyNew ? '' : 'on'} onClick={() => go(testPath(topic, false))}>
                Vše
              </button>
              <button className={onlyNew ? 'on' : ''} onClick={() => go(testPath(topic, true))}>
                Nové ({newCount})
              </button>
            </div>
          )
        }
      />
      {!ids && <TopicChips topics={topics} value={topic} onChange={(t) => go(testPath(t, onlyNew))} />}
      {ids && (
        <a className="btn ghost small" href="#/test">
          ← Všechny otázky
        </a>
      )}
      {pool.length === 0 ? (
        onlyNew ? (
          <Empty title="Nové otázky došly 🎉" mood="cheer">
            Všechny otázky {topic ? 'v tomhle okruhu ' : ''}už jsi aspoň jednou dostal/a. Přepni na „Vše“ nebo zkus Chytré opakování.
          </Empty>
        ) : (
          <Empty title="Zatím tu nejsou žádné ABCD otázky">Pošli fotky testových podkladů a vytvořím z nich kvíz.</Empty>
        )
      ) : (
        <QuizDeck key={(ids?.join(',') ?? '') + (topic ?? 'all') + (onlyNew ? '-new' : '')} pool={pool} topicTitle={topicTitle} />
      )}
    </div>
  );
}

function QuizDeck({ pool, topicTitle }: { pool: Content['quiz']; topicTitle: (id: string) => string | undefined }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(
    () => orderForPractice(pool.map((q) => qkey(q.id)), progressStore.get().items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, round],
  );
  const byKey = useMemo(() => new Map(pool.map((q) => [qkey(q.id), q])), [pool]);
  const [i, setI] = useState(0);
  const [tally, setTally] = useState({ good: 0, bad: 0 });
  const [wrong, setWrong] = useState<string[]>([]);

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setTally({ good: 0, bad: 0 });
    setWrong([]);
  };

  if (i >= deck.length) {
    return (
      <SessionDone
        {...tally}
        onRestart={restart}
        extra={
          wrong.length > 0 && (
            <a className="btn block" href={`#/test?ids=${wrong.join(',')}`}>
              Procvičit jen chybné ({wrong.length})
            </a>
          )
        }
      />
    );
  }

  const q = byKey.get(deck[i])!;
  return (
    <>
      <SessionHead index={i} total={deck.length} good={tally.good} bad={tally.bad} />
      <QuizCard
        key={`${round}-${q.id}`}
        q={q}
        topicTitle={topicTitle(q.topicId)}
        onAnswer={(ok) => {
          progressStore.grade(deck[i], ok ? 'good' : 'bad');
          setTally((t) => (ok ? { ...t, good: t.good + 1 } : { ...t, bad: t.bad + 1 }));
          if (!ok) setWrong((w) => [...w, q.id]);
        }}
        onNext={() => setI(i + 1)}
        nextLabel={i + 1 >= deck.length ? 'Vyhodnotit' : 'Další otázka'}
      />
    </>
  );
}
