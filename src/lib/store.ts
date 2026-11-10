import { useSyncExternalStore } from 'react';
import { applyGrade, emptyProgress, parseProgress, type ExamRecord, type Grade, type ProgressData } from './progress';
import { DEFAULT_EXAM, type ExamSettings } from './exam';

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
}

export const settingsStore = createStore<Settings>(
  'pcr-settings-v1',
  () => ({ exam: DEFAULT_EXAM, theme: 'auto', sound: true }),
  (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Partial<Settings>;
    return {
      exam: { ...DEFAULT_EXAM, ...(r.exam ?? {}) },
      theme: r.theme ?? 'auto',
      sound: r.sound ?? true,
    };
  },
);
export const useSettings = () => useSyncExternalStore(settingsStore.subscribe, settingsStore.get);

const progress = createStore<ProgressData>('pcr-progress-v1', emptyProgress, parseProgress);

export const progressStore = {
  get: progress.get,
  subscribe: progress.subscribe,
  grade(key: string, g: Grade) {
    const s = progress.get();
    progress.set({ ...s, items: { ...s.items, [key]: applyGrade(s.items[key], g, Date.now()) } });
  },
  gradeMany(entries: [string, Grade][]) {
    const s = progress.get();
    const items = { ...s.items };
    const now = Date.now();
    for (const [k, g] of entries) items[k] = applyGrade(items[k], g, now);
    progress.set({ ...s, items });
  },
  addExam(rec: ExamRecord) {
    const s = progress.get();
    progress.set({ ...s, exams: [rec, ...s.exams].slice(0, 100) });
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
