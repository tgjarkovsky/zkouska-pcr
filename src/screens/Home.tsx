import { useState } from 'react';
import type { Content } from '../lib/types';
import { okey, qkey, summarize, type Summary } from '../lib/progress';
import { useProgress, useSettings } from '../lib/store';
import { BADGES, currentStreak, plural, rankFor, todayCount } from '../lib/game';
import { LINES, pick } from '../lib/lines';
import { NanynkaSays } from '../components/Nanynka';
import { ProgressBar } from '../components/ui';

export function Home({ content }: { content: Content }) {
  const p = useProgress();
  const { dailyGoal } = useSettings();
  const now = Date.now();
  const oral = summarize(content.oral.map((q) => okey(q.id)), p.items, now);
  const quiz = summarize(content.quiz.map((q) => qkey(q.id)), p.items, now);
  const due = oral.due + quiz.due;
  const fresh = oral.total - oral.seen + (quiz.total - quiz.seen);
  const lastExam = p.exams[0];

  const rank = rankFor(p.game.xp);
  const streak = currentStreak(p.game, now);
  const today = todayCount(p.game, now);
  const goalPct = Math.min(100, Math.round((today / dailyGoal) * 100));
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    const base = pick(h < 10 ? LINES.greetMorning : h < 18 ? LINES.greetDay : LINES.greetEvening);
    return { base, tip: pick(LINES.tips) };
  });

  return (
    <div className="screen">
      <header className="hero">
        <div className="hero-top">
          <span className="brand">S Nanynkou ke zkoušce</span>
          <div className="hero-actions">
            <a className="icon-btn" href="#/statistiky" aria-label="Statistiky a odznaky">
              🏅
            </a>
            <a className="icon-btn" href="#/nastaveni" aria-label="Nastavení">
              ⚙️
            </a>
          </div>
        </div>
        <NanynkaSays mood="wave" size={104} className="hero-says">
          <b>{greeting.base}</b>
          <div className="small muted">{goalPct >= 100 ? 'Denní cíl máš splněný, jsi jednička! 🌟' : greeting.tip}</div>
        </NanynkaSays>
      </header>

      <section className="card rank-card">
        <div className="rank-row">
          <div className="rank-badge" aria-hidden>
            🎖️
          </div>
          <div className="rank-info">
            <div className="small muted">
              Hodnost {rank.index + 1}/{rank.total}
            </div>
            <div className="rank-name">{rank.name}</div>
            <ProgressBar value={p.game.xp - rank.from} total={(rank.to ?? p.game.xp) - rank.from || 1} tone="xp" />
            <div className="small muted">
              {rank.to ? `${p.game.xp} / ${rank.to} XP do povýšení` : `${p.game.xp} XP – nejvyšší hodnost!`}
            </div>
          </div>
        </div>
        <div className="chips-row">
          <div className={`mini ${streak > 0 ? 'hot' : ''}`}>
            <span className="mini-icon">🔥</span>
            <b>{streak}</b> {plural(streak, 'den', 'dny', 'dní')} v řadě
          </div>
          <div className="mini goal">
            <span className="goal-ring" style={{ ['--p' as string]: goalPct }} />
            <b>
              {today}/{dailyGoal}
            </b>{' '}
            dnes
          </div>
        </div>
      </section>

      <a className="card cta" href="#/opakovani">
        <div>
          <div className="cta-title">Chytré opakování</div>
          <div className="cta-sub">
            {due > 0 ? `${due} otázek čeká na zopakování` : fresh > 0 ? `${fresh} nových otázek k naučení` : 'Pro dnešek máš hotovo 🎉'}
          </div>
        </div>
        <span className="cta-play">▶</span>
      </a>

      <div className="grid2">
        <PartCard href="#/ustni" title="Ústní" icon="🗣️" s={oral} tone="blue" />
        <PartCard href="#/test" title="Test ABCD" icon="🎯" s={quiz} tone="green" />
      </div>

      <a className="card tile-wide tone-purple" href="#/zkouska">
        <span className="tile-icon big">⏱️</span>
        <div>
          <div className="tile-title">Simulace zkoušky</div>
          <div className="small">
            {lastExam
              ? `Naposledy ${lastExam.percent} % (${lastExam.passed ? 'úspěch ✅' : 'neúspěch'}), ${new Date(lastExam.date).toLocaleDateString('cs-CZ')}`
              : 'Zkus si test nanečisto s časovým limitem'}
          </div>
        </div>
      </a>

      <a className="card badges-strip" href="#/statistiky">
        <div className="row between tight">
          <b>Odznaky</b>
          <span className="small muted">
            {p.game.badges.length}/{BADGES.length} →
          </span>
        </div>
        <div className="badge-icons">
          {BADGES.map((b) => (
            <span key={b.id} className={`badge-icon ${p.game.badges.includes(b.id) ? 'got' : ''}`} title={b.title}>
              {b.icon}
            </span>
          ))}
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
              const done = s.total > 0 && s.mastered === s.total;
              return (
                <a key={t.id} className="topic-row" href={href}>
                  <div className="topic-head">
                    <span>
                      {done ? '⭐ ' : ''}
                      {t.title}
                    </span>
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

function PartCard({ href, title, icon, s, tone }: { href: string; title: string; icon: string; s: Summary; tone: string }) {
  return (
    <a className={`card tile tone-${tone}`} href={href}>
      <span className="tile-icon big">{icon}</span>
      <div className="tile-title">{title}</div>
      <div className="small">
        {s.total} otázek · umíš {s.mastered}
      </div>
      <ProgressBar value={s.mastered} total={s.total} tone="light" />
    </a>
  );
}
