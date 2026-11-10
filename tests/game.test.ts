import { describe, expect, it } from 'vitest';
import { applyAnswer, currentStreak, emptyGame, newBadges, plural, rankFor, todayCount, XP } from '../src/lib/game';
import { emptyProgress, parseProgress } from '../src/lib/progress';

const day = (d: number, h = 12) => new Date(2026, 10, d, h).getTime();

describe('XP a hodnosti', () => {
  it('správná odpověď přidá XP, chyba méně', () => {
    let g = applyAnswer(emptyGame(), 'good', day(10));
    expect(g.xp).toBe(XP.good);
    g = applyAnswer(g, 'bad', day(10));
    expect(g.xp).toBe(XP.good + XP.bad);
  });
  it('hodnost roste s XP', () => {
    expect(rankFor(0).name).toBe('Nováček');
    expect(rankFor(50).name).toBe('Strážmistr');
    expect(rankFor(149).index).toBe(1);
    expect(rankFor(999999).to).toBeNull();
  });
});

describe('Série a denní cíl', () => {
  it('po sobě jdoucí dny zvyšují sérii, vynechaný den ji resetuje', () => {
    let g = applyAnswer(emptyGame(), 'good', day(10));
    g = applyAnswer(g, 'good', day(10, 18));
    expect(g.streak).toBe(1);
    g = applyAnswer(g, 'good', day(11));
    expect(g.streak).toBe(2);
    expect(currentStreak(g, day(12))).toBe(2); // včera se učil/a – série ještě platí
    expect(currentStreak(g, day(13))).toBe(0);
    g = applyAnswer(g, 'good', day(13));
    expect(g.streak).toBe(1);
  });
  it('denní počet se ráno nuluje', () => {
    let g = applyAnswer(emptyGame(), 'good', day(10));
    g = applyAnswer(g, 'bad', day(10));
    expect(todayCount(g, day(10))).toBe(2);
    expect(todayCount(g, day(11))).toBe(0);
  });
  it('combo: chyba nuluje, částečně drží', () => {
    let g = emptyGame();
    for (const gr of ['good', 'good', 'partial', 'good'] as const) g = applyAnswer(g, gr, day(10));
    expect(g.combo).toBe(3);
    g = applyAnswer(g, 'bad', day(10));
    expect(g.combo).toBe(0);
    expect(g.bestCombo).toBe(3);
  });
});

describe('Odznaky', () => {
  it('první odpověď odemkne první odznak, podruhé už ne', () => {
    const p = emptyProgress();
    p.game = applyAnswer(p.game, 'good', day(10));
    const ids = newBadges(p, { dailyGoal: 20, now: day(10) }).map((b) => b.id);
    expect(ids).toContain('prvni-krok');
    p.game.badges = ids;
    expect(newBadges(p, { dailyGoal: 20, now: day(10) })).toHaveLength(0);
  });
  it('stará data bez herní části se načtou', () => {
    const p = parseProgress({ v: 1, items: {}, exams: [] });
    expect(p?.game.xp).toBe(0);
  });
  it('plural', () => {
    expect(plural(1, 'den', 'dny', 'dní')).toBe('den');
    expect(plural(3, 'den', 'dny', 'dní')).toBe('dny');
    expect(plural(5, 'den', 'dny', 'dní')).toBe('dní');
    expect(plural(0, 'den', 'dny', 'dní')).toBe('dní');
  });
});
