// Čistá logika pokroku a chytrého opakování (Leitnerovy krabičky 1–5).

export type Grade = 'good' | 'partial' | 'bad';

export interface ItemStat {
  box: number;
  due: number;
  seen: number;
  ok: number;
  bad: number;
  last: number;
}

export interface ExamRecord {
  date: number;
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  durationSec: number;
  wrongIds: string[];
}

export interface ProgressData {
  v: 1;
  items: Record<string, ItemStat>;
  exams: ExamRecord[];
}

export const MINUTE = 60_000;
export const DAY = 86_400_000;
/** za kolik dní se otázka vrátí po správné odpovědi, podle krabičky */
export const INTERVAL_DAYS = [0, 0, 1, 3, 7, 21];
export const MAX_BOX = 5;
export const MASTERED_BOX = 4;

export const okey = (id: string) => `o:${id}`;
export const qkey = (id: string) => `q:${id}`;

export function emptyProgress(): ProgressData {
  return { v: 1, items: {}, exams: [] };
}

export function applyGrade(stat: ItemStat | undefined, grade: Grade, now: number): ItemStat {
  const prev: ItemStat = stat ?? { box: 1, due: now, seen: 0, ok: 0, bad: 0, last: 0 };
  const next: ItemStat = { ...prev, seen: prev.seen + 1, last: now };
  if (grade === 'good') {
    next.box = Math.min(MAX_BOX, prev.box + 1);
    next.ok = prev.ok + 1;
    next.due = now + INTERVAL_DAYS[next.box] * DAY;
  } else if (grade === 'partial') {
    next.box = Math.max(1, prev.box - 1);
    next.due = now + DAY;
  } else {
    next.box = 1;
    next.bad = prev.bad + 1;
    next.due = now + 10 * MINUTE;
  }
  return next;
}

export const isDue = (s: ItemStat | undefined, now: number) => !!s && s.due <= now;
export const isMastered = (s: ItemStat | undefined) => !!s && s.box >= MASTERED_BOX;

/** Fronta k opakování: nejdřív splatné (nejstarší a nejslabší první), pak nové. */
export function buildReviewQueue(
  keys: string[],
  items: Record<string, ItemStat>,
  now: number,
  { limit = 20, newLimit = 10 }: { limit?: number; newLimit?: number } = {},
): string[] {
  const due = keys
    .filter((k) => isDue(items[k], now))
    .sort((a, b) => items[a].box - items[b].box || items[a].due - items[b].due);
  const fresh = keys.filter((k) => !items[k]).slice(0, newLimit);
  return [...due, ...fresh].slice(0, limit);
}

/** Pořadí pro procvičování: nejslabší (a nové) první, uvnitř skupin náhodně. */
export function orderForPractice(keys: string[], items: Record<string, ItemStat>, rng = Math.random): string[] {
  return shuffle(keys, rng).sort((a, b) => (items[a]?.box ?? 1) - (items[b]?.box ?? 1));
}

export function shuffle<T>(arr: T[], rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Summary {
  total: number;
  seen: number;
  mastered: number;
  ok: number;
  bad: number;
  due: number;
}

export function summarize(keys: string[], items: Record<string, ItemStat>, now: number): Summary {
  const s: Summary = { total: keys.length, seen: 0, mastered: 0, ok: 0, bad: 0, due: 0 };
  for (const k of keys) {
    const it = items[k];
    if (!it) continue;
    s.seen++;
    s.ok += it.ok;
    s.bad += it.bad;
    if (isMastered(it)) s.mastered++;
    if (isDue(it, now)) s.due++;
  }
  return s;
}

/** Ověří a vyčistí importovaná data. */
export function parseProgress(raw: unknown): ProgressData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<ProgressData>;
  if (r.v !== 1 || typeof r.items !== 'object' || r.items === null) return null;
  return { v: 1, items: r.items, exams: Array.isArray(r.exams) ? r.exams : [] };
}
