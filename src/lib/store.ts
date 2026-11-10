import { useSyncExternalStore } from 'react';
import { applyGrade, emptyProgress, parseProgress, type ExamRecord, type Grade, type ProgressData } from './progress';
import { DEFAULT_EXAM, type ExamSettings } from './exam';
import { applyAnswer, newBadges, rankFor, XP_EXAM_DONE, XP_EXAM_PASS } from './game';
import { celebrate } from './celebrate';

function createStore<T>(key: string, fallback: () => T, parse: (raw: unknown) => T | null) {
  let state: T = fallback();
  try {
    const raw = localStorage.getItem(key);
    if (raw) state = parse(JSON.parse(raw)) ?? fallback();
  } catch {
    /* localStorage nedostupné – jedeme v paměti */
  }
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: T) {
      state = next;
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export type Theme = 'auto' | 'light' | 'dark';
export interface Settings {
  exam: ExamSettings;
  theme: Theme;
  sound: boolean;
  dailyGoal: number;
}

export const settingsStore = createStore<Settings>(
  'pcr-settings-v1',
  () => ({ exam: DEFAULT_EXAM, theme: 'auto', sound: true, dailyGoal: 20 }),
  (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Partial<Settings>;
    return {
      exam: { ...DEFAULT_EXAM, ...(r.exam ?? {}) },
      theme: r.theme ?? 'auto',
      sound: r.sound ?? true,
      dailyGoal: r.dailyGoal ?? 20,
    };
  },
);
export const useSettings = () => useSyncExternalStore(settingsStore.subscribe, settingsStore.get);

const progress = createStore<ProgressData>('pcr-progress-v1', emptyProgress, parseProgress);

/** Přidělí nové odznaky a ohlásí povýšení. */
function reward(prev: ProgressData, next: ProgressData): ProgressData {
  const now = Date.now();
  const badges = newBadges(next, { dailyGoal: settingsStore.get().dailyGoal, now });
  if (badges.length) next = { ...next, game: { ...next.game, badges: [...next.game.badges, ...badges.map((b) => b.id)] } };
  const before = rankFor(prev.game.xp);
  const after = rankFor(next.game.xp);
  if (after.index > before.index) celebrate({ kind: 'rank', title: after.name, icon: '🎖️' });
  for (const b of badges) celebrate({ kind: 'badge', title: b.title, icon: b.icon, desc: b.desc });
  return next;
}

export const progressStore = {
  get: progress.get,
  subscribe: progress.subscribe,
  grade(key: string, g: Grade) {
    const s = progress.get();
    const now = Date.now();
    progress.set(
      reward(s, {
        ...s,
        items: { ...s.items, [key]: applyGrade(s.items[key], g, now) },
        game: applyAnswer(s.game, g, now),
      }),
    );
  },
  gradeMany(entries: [string, Grade][]) {
    const s = progress.get();
    const items = { ...s.items };
    let game = s.game;
    const now = Date.now();
    for (const [k, g] of entries) {
      items[k] = applyGrade(items[k], g, now);
      game = applyAnswer(game, g, now);
    }
    progress.set(reward(s, { ...s, items, game }));
  },
  addExam(rec: ExamRecord) {
    const s = progress.get();
    const bonus = XP_EXAM_DONE + (rec.passed ? XP_EXAM_PASS : 0);
    progress.set(reward(s, { ...s, exams: [rec, ...s.exams].slice(0, 100), game: { ...s.game, xp: s.game.xp + bonus } }));
  },
  replace: progress.set,
  reset: () => progress.set(emptyProgress()),
};

export const useProgress = () => useSyncExternalStore(progress.subscribe, progress.get);

const PASS_KEY = 'pcr-pass';
export const savedPassword = () => {
  try {
    return localStorage.getItem(PASS_KEY);
  } catch {
    return null;
  }
};
export const savePassword = (p: string) => {
  try {
    localStorage.setItem(PASS_KEY, p);
  } catch {
    /* ignore */
  }
};
export const forgetPassword = () => {
  try {
    localStorage.removeItem(PASS_KEY);
  } catch {
    /* ignore */
  }
};
