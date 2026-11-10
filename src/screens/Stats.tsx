import type { Content } from '../lib/types';
import { okey, qkey, summarize } from '../lib/progress';
import { useProgress } from '../lib/store';
import { formatTime } from '../lib/exam';
import { Empty, ProgressBar, ScreenHeader } from '../components/ui';

export function Stats({ content }: { content: Content }) {
  const p = useProgress();
  const now = Date.now();

  const all = [
    ...content.oral.map((q) => ({ key: okey(q.id), text: q.question, kind: 'Ústní', href: `#/ustni?t=${q.topicId}&m=seznam` })),
    ...content.quiz.map((q) => ({ key: qkey(q.id), text: q.question, kind: 'Test', href: `#/test?ids=${q.id}` })),
  ];
  const weakest = all
    .map((x) => ({ ...x, st: p.items[x.key] }))
    .filter((x) => x.st && x.st.bad > 0)
    .sort((a, b) => b.st!.bad - b.st!.ok - (a.st!.bad - a.st!.ok) || a.st!.box - b.st!.box)
    .slice(0, 10);

  const totalAnswers =Object.values(p.items).reduce((n, s) => n + s.ok + s.bad, 0);
  const totalOk = Object.values(p.items).reduce((n, s) => n + s.ok, 0);

  return (
    <div className="screen">
      <ScreenHeader title="Statistiky" />
      <div className="grid3">
        <div className="card stat">
          <b>{Object.keys(p.items).length}</b>
          <span>procvičených otázek</span>
        </div>
        <div className="card stat">
          <b>{totalAnswers ? Math.round((totalOk / totalAnswers) * 100) : 0} %</b>
          <span>úspěšnost</span>
        </div>
        <div className="card stat">
          <b>{p.exams.length}</b>
          <span>simulací</span>
        </div>
      </div>

      <section className="card">
        <h3>Podle okruhů</h3>
        {content.topics.map((t) => {
          const keys = [
            ...content.oral.filter((q) => q.topicId === t.id).map((q) => okey(q.id)),
            ...content.quiz.filter((q) => q.topicId === t.id).map((q) => qkey(q.id)),
          ];
          const s = summarize(keys, p.items, now);
          const rate = s.ok + s.bad ? Math.round((s.ok / (s.ok + s.bad)) * 100) : null;
          return (
            <div key={t.id} className="topic-stat">
              <div className="topic-head">
                <span>{t.title}</span>
                <span className="muted small">
                  {rate === null ? 'neprocvičeno' : `${rate} % správně`} · umíš {s.mastered}/{s.total}
                </span>
              </div>
              <ProgressBar value={s.mastered} total={s.total} tone="ok" />
            </div>
          );
        })}
      </section>

      <section className="card">
        <h3>Nejslabší otázky</h3>
        {weakest.length === 0 ? (
          <p className="muted">Zatím žádné chyby. 💪</p>
        ) : (
          <ol className="weak">
            {weakest.map((w) => (
              <li key={w.key}>
                <a href={w.href}>
                  <span className="kicker">
                    {w.kind} · ✗ {w.st!.bad} / ✓ {w.st!.ok}
                  </span>
                  {w.text}
                </a>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="card">
        <h3>Historie simulací</h3>
        {p.exams.length === 0 ? (
          <Empty title="Zatím žádná simulace" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Výsledek</th>
                <th>Čas</th>
              </tr>
            </thead>
            <tbody>
              {p.exams.slice(0, 20).map((e) => (
                <tr key={e.date}>
                  <td>{new Date(e.date).toLocaleDateString('cs-CZ')}</td>
                  <td className={e.passed ? 'good' : 'bad'}>
                    {e.percent} % ({e.correct}/{e.total})
                  </td>
                  <td>{formatTime(e.durationSec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
