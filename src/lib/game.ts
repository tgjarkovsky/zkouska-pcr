// Herní vrstva: XP, hodnosti, denní série, denní cíl, odznaky.
import type { Grade, ProgressData } from './progress';

export interface GameState {
  xp: number;
  /** počet po sobě jdoucích dní s aspoň jednou odpovědí */
  streak: number;
  lastDay: string | null;
  /** odpovědi v aktuální den */
  day: string | null;
  dayCount: number;
  /** správné odpovědi v řadě */
  combo: number;
  bestCombo: number;
  answers: number;
  badges: string[];
}

export const emptyGame = (): GameState => ({
  xp: 0,
  streak: 0,
  lastDay: null,
  day: null,
  dayCount: 0,
  combo: 0,
  bestCombo: 0,
  answers: 0,
  badges: [],
});

export const XP: Record<Grade, number> = { good: 10, partial: 5, bad: 2 };
export const XP_EXAM_DONE = 30;
export const XP_EXAM_PASS = 70;

// Hodnosti používáme jen jako herní úrovně.
export const RANKS = [
  'Nováček',
  'Strážmistr',
  'Nadstrážmistr',
  'Podpraporčík',
  'Praporčík',
  'Nadpraporčík',
  'Podporučík',
  'Poručík',
  'Nadporučík',
  'Kapitán',
  'Major',
  'Podplukovník',
  'Plukovník',
  'Brigádní generál',
  'Generálmajor',
  'Generálporučík',
  'Armádní generál',
];
export const RANK_XP = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2300, 2900, 3600, 4400, 5300, 6300, 7500, 9000];

export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANK_XP.length && xp >= RANK_XP[i + 1]) i++;
  return { index: i, name: RANKS[i], from: RANK_XP[i], to: RANK_XP[i + 1] ?? null, total: RANKS.length };
}

const pad = (n: number) => String(n).padStart(2, '0');
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function yesterdayKey(t: number): string {
  const d = new Date(t);
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12).getTime());
}

export function applyAnswer(g: GameState, grade: Grade, now: number): GameState {
  const today = dayKey(now);
  let { streak, lastDay, day, dayCount } = g;
  if (lastDay !== today) {
    streak = lastDay === yesterdayKey(now) ? streak + 1 : 1;
    lastDay = today;
  }
  if (day !== today) {
    day = today;
    dayCount = 0;
  }
  const combo = grade === 'good' ? g.combo + 1 : grade === 'bad' ? 0 : g.combo;
  return {
    ...g,
    xp: g.xp + XP[grade],
    streak,
    lastDay,
    day,
    dayCount: dayCount + 1,
    combo,
    bestCombo: Math.max(g.bestCombo, combo),
    answers: g.answers + 1,
  };
}

export const currentStreak = (g: GameState, now: number) =>
  g.lastDay === dayKey(now) || g.lastDay === yesterdayKey(now) ? g.streak : 0;
export const todayCount = (g: GameState, now: number) => (g.day === dayKey(now) ? g.dayCount : 0);

export interface Badge {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (p: ProgressData, ctx: { dailyGoal: number; now: number }) => boolean;
}

const mastered = (p: ProgressData) => Object.values(p.items).filter((s) => s.box >= 4).length;

export const BADGES: Badge[] = [
  { id: 'prvni-krok', icon: '👣', title: 'První krok', desc: 'Odpověz na první otázku', check: (p) => p.game.answers >= 1 },
  { id: 'denni-cil', icon: '🎯', title: 'Splněný úkol', desc: 'Splň denní cíl', check: (p, c) => todayCount(p.game, c.now) >= c.dailyGoal },
  { id: 'combo-5', icon: '🔥', title: 'Na vlně', desc: '5 správných odpovědí v řadě', check: (p) => p.game.bestCombo >= 5 },
  { id: 'combo-15', icon: '🎖️', title: 'Ostrostřelec', desc: '15 správných odpovědí v řadě', check: (p) => p.game.bestCombo >= 15 },
  { id: 'serie-3', icon: '📅', title: 'Vytrvalost', desc: 'Uč se 3 dny po sobě', check: (p) => p.game.streak >= 3 },
  { id: 'serie-7', icon: '🗓️', title: 'Týden ve službě', desc: 'Uč se 7 dní po sobě', check: (p) => p.game.streak >= 7 },
  { id: 'stovka', icon: '💯', title: 'Stovka', desc: 'Odpověz na 100 otázek', check: (p) => p.game.answers >= 100 },
  { id: 'znalec-25', icon: '📘', title: 'Znalec předpisů', desc: 'Zvládni 25 otázek', check: (p) => mastered(p) >= 25 },
  { id: 'simulace', icon: '⏱️', title: 'Ostrý start', desc: 'Dokonči simulaci zkoušky', check: (p) => p.exams.length >= 1 },
  { id: 'uspech', icon: '🏅', title: 'Zkouška nanečisto', desc: 'Uspěj v simulaci', check: (p) => p.exams.some((e) => e.passed) },
  { id: 'bez-chyby', icon: '🏆', title: 'Bez chyby', desc: 'Simulace na 100 %', check: (p) => p.exams.some((e) => e.percent === 100 && e.total >= 5) },
];

export function newBadges(p: ProgressData, ctx: { dailyGoal: number; now: number }): Badge[] {
  return BADGES.filter((b) => !p.game.badges.includes(b.id) && b.check(p, ctx));
}

/** český plurál: plural(3, 'den', 'dny', 'dní') */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}
