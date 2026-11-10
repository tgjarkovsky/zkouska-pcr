import { useMemo, useState } from 'react';
import type { Content } from '../lib/types';
import { buildReviewQueue, okey, qkey, shuffle, type Grade } from '../lib/progress';
import { progressStore } from '../lib/store';
import { OralCard } from '../components/OralCard';
import { QuizCard } from '../components/QuizCard';
import { SessionDone, SessionHead, useXpStart } from '../components/Session';
import { Empty, ScreenHeader } from '../components/ui';

type Mix = 'all' | 'oral' | 'quiz';

export function Review({ content }: { content: Content }) {
  const [mix, setMix] = useState<Mix>('all');
  const [round, setRound] = useState(0);
  const [xpStart, resetXp] = useXpStart();

  const { queue, lookup } = useMemo(() => {
    const lookup = new Map<string, { kind: 'oral'; q: Content['oral'][0] } | { kind: 'quiz'; q: Content['quiz'][0] }>();
    const keys: string[] = [];
    if (mix !== 'quiz')
      for (const q of content.oral) {
        lookup.set(okey(q.id), { kind: 'oral', q });
        keys.push(okey(q.id));
      }
    if (mix !== 'oral')
      for (const q of content.quiz) {
        lookup.set(qkey(q.id), { kind: 'quiz', q });
        keys.push(qkey(q.id));
      }
    const queue = buildReviewQueue(shuffle(keys), progressStore.get().items, Date.now(), { limit: 20, newLimit: 10 });
    return { queue, lookup };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, mix, round]);

  const [i, setI] = useState(0);
  const [tally, setTally] = useState({ good: 0, partial: 0, bad: 0 });
  const reset = () => {
    resetXp();
    setI(0);
    setTally({ good: 0, partial: 0, bad: 0 });
  };
  const topicTitle = (id: string) => content.topics.find((t) => t.id === id)?.title;

  const record = (key: string, g: Grade) => {
    progressStore.grade(key, g);
    setTally((t) => ({ ...t, [g]: t[g] + 1 }));
  };

  return (
    <div className="screen">
      <ScreenHeader title="Chytré opakování" sub="Otázky, které ti nejdou, se vracejí častěji." />
      <div className="seg wide">
        {(['all', 'oral', 'quiz'] as Mix[]).map((m) => (
          <button
            key={m}
            className={mix === m ? 'on' : ''}
            onClick={() => {
              setMix(m);
              reset();
            }}
          >
            {m === 'all' ? 'Vše' : m === 'oral' ? 'Ústní' : 'Test'}
          </button>
        ))}
      </div>

      {queue.length === 0 ? (
        <Empty title="Pro dnešek hotovo 🎉" mood="cheer">
          Všechny otázky máš zopakované. Další ti připomenu, až přijde jejich čas.
        </Empty>
      ) : i >= queue.length ? (
        <SessionDone
          xpStart={xpStart}
          {...tally}
          onRestart={() => {
            setRound((r) => r + 1);
            reset();
          }}
        />
      ) : (
        (() => {
          const key = queue[i];
          const item = lookup.get(key)!;
          return (
            <>
              <SessionHead index={i} total={queue.length} good={tally.good} bad={tally.bad} />
              {item.kind === 'oral' ? (
                <OralCard
                  key={`${round}-${key}`}
                  q={item.q}
                  topicTitle={`Ústní · ${topicTitle(item.q.topicId) ?? ''}`}
                  onGrade={(g) => {
                    record(key, g);
                    setI(i + 1);
                  }}
                />
              ) : (
                <QuizCard
                  key={`${round}-${key}`}
                  q={item.q}
                  topicTitle={`Test · ${topicTitle(item.q.topicId) ?? ''}`}
                  onAnswer={(ok) => record(key, ok ? 'good' : 'bad')}
                  onNext={() => setI(i + 1)}
                />
              )}
            </>
          );
        })()
      )}
    </div>
  );
}
