import type { Content } from '../lib/types';
import { okey, qkey, summarize, type Summary } from '../lib/progress';
import { useProgress } from '../lib/store';
import { ProgressBar } from '../components/ui';

export function Home({ content }: { content: Content }) {
  const p = useProgress();
  const now = Date.now();
  const oral = summarize(content.oral.map((q) => okey(q.id)), p.items, now);
  const quiz = summarize(content.quiz.map((q) => qkey(q.id)), p.items, now);
  const due = oral.due + quiz.due;
  const fresh = oral.total - oral.seen + (quiz.total - quiz.seen);
  const lastExam = p.exams[0];

  return (
    <div className="screen">
      <header className="hero">
        <div>
          <p className="hero-kicker">Příprava ke služební zkoušce</p>
          <h1>{greeting()}</h1>
        </div>
        <div className="hero-actions">
          <a className="icon-btn" href="#/statistiky" aria-label="Statistiky">
            📊
          </a>
          <a className="icon-btn" href="#/nastaveni" aria-label="Nastavení">
            ⚙️
          </a>
        </div>
      </header>

      <a className="card cta" href="#/opakovani">
        <div>
          <div className="cta-title">Chytré opakování</div>
          <div className="cta-sub">
            {due > 0 ? `${due} otázek čeká na zopakování` : fresh > 0 ? `${fresh} nových otázek k naučení` : 'Pro dnešek máš hotovo'}
          </div>
        </div>
        <span className="cta-arrow">→</span>
      </a>

      <div className="grid2">
        <PartCard href="#/ustni" title="Ústní" icon="🗣️" s={oral} />
        <PartCard href="#/test" title="Test ABCD" icon="✅" s={quiz} />
      </div>

      <a className="card tile-wide" href="#/zkouska">
        <span className="tile-icon">⏱️</span>
        <div>
          <div className="tile-title">Simulace zkoušky</div>
          <div className="muted small">
            {lastExam
              ? `Poslední: ${lastExam.percent} % (${lastExam.passed ? 'úspěch' : 'neúspěch'}), ${new Date(lastExam.date).toLocaleDateString('cs-CZ')}`
              : 'Vyzkoušej si test nanečisto s časovým limitem'}
          </div>
        </div>
      </a>

      {content.topics.length > 0 && (
        <section>
          <h2 className="section-title">Okruhy</h2>
          <div className="list">
            {content.topics.map((t) => {
              const keys = [
                ...content.oral.filter((q) => q.topicId === t.id).map((q) => okey(q.id)),
                ...content.quiz.filter((q) => q.topicId === t.id).map((q) => qkey(q.id)),
              ];
              const s = summarize(keys, p.items, now);
              const href = t.parts.includes('oral') ? `#/ustni?t=${t.id}` : `#/test?t=${t.id}`;
              return (
                <a key={t.id} className="topic-row" href={href}>
                  <div className="topic-head">
                    <span>{t.title}</span>
                    <span className="muted small">
                      {s.mastered}/{s.total}
                    </span>
                  </div>
                  <ProgressBar value={s.mastered} total={s.total} tone="ok" />
                </a>
              );
            })}
          </div>
        </section>
      )}
      <p className="muted small center foot">
        Obsah aktualizován {content.updated} · {content.oral.length + content.quiz.length} otázek
      </p>
    </div>
  );
}

function PartCard({ href, title, icon, s }: { href: string; title: string; icon: string; s: Summary }) {
  return (
    <a className="card tile" href={href}>
      <span className="tile-icon">{icon}</span>
      <div className="tile-title">{title}</div>
      <div className="muted small">
        {s.total} otázek · umíš {s.mastered}
      </div>
      <ProgressBar value={s.mastered} total={s.total} tone="ok" />
    </a>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 10) return 'Dobré ráno 👋';
  if (h < 18) return 'Dobrý den 👋';
  return 'Dobrý večer 👋';
}
