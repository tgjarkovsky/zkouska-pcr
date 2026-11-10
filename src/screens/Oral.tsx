import { useMemo, useState } from 'react';
import type { Content } from '../lib/types';
import { okey, orderForPractice, isMastered, type Grade } from '../lib/progress';
import { progressStore, useProgress } from '../lib/store';
import { go, type Route } from '../lib/router';
import { OralCard } from '../components/OralCard';
import { Markdown } from '../components/Markdown';
import { SessionDone, SessionHead, useXpStart } from '../components/Session';
import { Empty, Refs, ScreenHeader, SourceBadge, TopicChips } from '../components/ui';

export function Oral({ content, route }: { content: Content; route: Route }) {
  const topics = content.topics.filter((t) => t.parts.includes('oral'));
  const topic = route.query.get('t');
  const mode = route.query.get('m') === 'seznam' ? 'list' : 'cards';
  const setParams = (t: string | null, m: string) => {
    const p = new URLSearchParams();
    if (t) p.set('t', t);
    if (m === 'list') p.set('m', 'seznam');
    const s = p.toString();
    go(`/ustni${s ? `?${s}` : ''}`);
  };

  const pool = useMemo(() => content.oral.filter((q) => !topic || q.topicId === topic), [content.oral, topic]);
  const topicTitle = (id: string) => content.topics.find((t) => t.id === id)?.title;

  return (
    <div className="screen">
      <ScreenHeader
        title="Ústní zkouška"
        sub={`${pool.length} otázek`}
        right={
          <div className="seg">
            <button className={mode === 'cards' ? 'on' : ''} onClick={() => setParams(topic, 'cards')}>
              Kartičky
            </button>
            <button className={mode === 'list' ? 'on' : ''} onClick={() => setParams(topic, 'list')}>
              Seznam
            </button>
          </div>
        }
      />
      <TopicChips topics={topics} value={topic} onChange={(t) => setParams(t, mode)} />
      {pool.length === 0 ? (
        <Empty title="Zatím tu nejsou žádné otázky">Pošli fotky podkladů a otázky se tu objeví.</Empty>
      ) : mode === 'cards' ? (
        <CardDeck key={topic ?? 'all'} pool={pool} topicTitle={topicTitle} />
      ) : (
        <OralList pool={pool} topicTitle={topicTitle} />
      )}
    </div>
  );
}

function CardDeck({ pool, topicTitle }: { pool: Content['oral']; topicTitle: (id: string) => string | undefined }) {
  const [round, setRound] = useState(0);
  const [xpStart, resetXp] = useXpStart();
  const deck = useMemo(
    () => orderForPractice(pool.map((q) => okey(q.id)), progressStore.get().items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, round],
  );
  const [i, setI] = useState(0);
  const [tally, setTally] = useState({ good: 0, partial: 0, bad: 0 });
  const byKey = useMemo(() => new Map(pool.map((q) => [okey(q.id), q])), [pool]);

  const restart = () => {
    resetXp();
    setRound((r) => r + 1);
    setI(0);
    setTally({ good: 0, partial: 0, bad: 0 });
  };

  if (i >= deck.length) return <SessionDone {...tally} xpStart={xpStart} onRestart={restart} />;
  const q = byKey.get(deck[i])!;
  const grade = (g: Grade) => {
    progressStore.grade(deck[i], g);
    setTally((t) => ({ ...t, [g]: t[g] + 1 }));
    setI(i + 1);
  };
  return (
    <>
      <SessionHead index={i} total={deck.length} good={tally.good} bad={tally.bad} />
      <OralCard key={q.id} q={q} topicTitle={topicTitle(q.topicId)} onGrade={grade} />
    </>
  );
}

function OralList({ pool, topicTitle }: { pool: Content['oral']; topicTitle: (id: string) => string | undefined }) {
  const progress = useProgress();
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const norm = (s: string) => s.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{M}/gu, '');
  const f = norm(filter.trim());
  const shown = f ? pool.filter((q) => norm(q.question + ' ' + q.answer).includes(f)) : pool;

  return (
    <>
      <input
        className="search"
        type="search"
        placeholder="Hledat v otázkách a odpovědích…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="list">
        {shown.map((q) => {
          const st = progress.items[okey(q.id)];
          const isOpen = open === q.id;
          return (
            <div key={q.id} className={`list-item ${isOpen ? 'open' : ''}`}>
              <button className="list-q" onClick={() => setOpen(isOpen ? null : q.id)}>
                <span className={`dot ${isMastered(st) ? 'dot-ok' : st?.bad ? 'dot-bad' : st ? 'dot-mid' : ''}`} />
                <span className="list-text">
                  <span className="kicker">{topicTitle(q.topicId)}</span>
                  {q.question}
                </span>
                <span className="chev">{isOpen ? '▴' : '▾'}</span>
              </button>
              {isOpen && (
                <div className="list-a">
                  <Markdown text={q.answer} />
                  <div className="meta-row">
                    <Refs refs={q.refs} />
                    <SourceBadge source={q.source} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {shown.length === 0 && <p className="muted center">Nic nenalezeno.</p>}
      </div>
    </>
  );
}
