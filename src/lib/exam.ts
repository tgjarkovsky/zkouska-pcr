import type { OralQ, QuizQ } from './types';
import { shuffle } from './progress';

export interface ExamSettings {
  quizCount: number;
  minutes: number;
  passPercent: number;
  oralCount: number;
  /** null = všechny okruhy */
  topicIds: string[] | null;
}

export const DEFAULT_EXAM: ExamSettings = {
  quizCount: 30,
  minutes: 40,
  passPercent: 70,
  oralCount: 3,
  topicIds: null,
};

export function pickRandom<T>(arr: T[], n: number, rng = Math.random): T[] {
  return shuffle(arr, rng).slice(0, Math.max(0, n));
}

export function buildQuizExam(quiz: QuizQ[], s: ExamSettings, rng = Math.random): QuizQ[] {
  const pool = s.topicIds ? quiz.filter((q) => s.topicIds!.includes(q.topicId)) : quiz;
  return pickRandom(pool, s.quizCount, rng);
}

export function drawOral(oral: OralQ[], s: ExamSettings, rng = Math.random): OralQ[] {
  const pool = s.topicIds ? oral.filter((q) => s.topicIds!.includes(q.topicId)) : oral;
  // u ústní zkoušky losujeme pokud možno z různých okruhů
  const byTopic = new Map<string, OralQ[]>();
  for (const q of shuffle(pool, rng)) {
    if (!byTopic.has(q.topicId)) byTopic.set(q.topicId, []);
    byTopic.get(q.topicId)!.push(q);
  }
  const out: OralQ[] = [];
  const groups = shuffle([...byTopic.values()], rng);
  while (out.length < s.oralCount && groups.some((g) => g.length)) {
    for (const g of groups) {
      const q = g.shift();
      if (q && out.length < s.oralCount) out.push(q);
    }
  }
  return out;
}

export interface ExamScore {
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  wrongIds: string[];
}

export function scoreExam(questions: QuizQ[], answers: (number | null)[], passPercent: number): ExamScore {
  let correct = 0;
  const wrongIds: string[] = [];
  questions.forEach((q, i) => {
    if (answers[i] === q.correct) correct++;
    else wrongIds.push(q.id);
  });
  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  return { total, correct, percent, passed: percent >= passPercent, wrongIds };
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
