import { describe, expect, it } from 'vitest';
import { applyGrade, buildReviewQueue, DAY, isMastered, orderForPractice, summarize, parseProgress, unseen } from '../src/lib/progress';
import { buildQuizExam, drawOral, scoreExam, DEFAULT_EXAM, formatTime } from '../src/lib/exam';
import { encryptJson, decryptJson } from '../shared/crypto.js';
import type { OralQ, QuizQ } from '../src/lib/types';

const NOW = 1_700_000_000_000;

describe('Leitner', () => {
  it('správná odpověď posune krabičku a odloží opakování', () => {
    const s = applyGrade(undefined, 'good', NOW);
    expect(s.box).toBe(2);
    expect(s.due).toBe(NOW + DAY);
    const s2 = applyGrade(s, 'good', NOW);
    expect(s2.box).toBe(3);
    expect(s2.due).toBe(NOW + 3 * DAY);
  });
  it('chyba vrátí do krabičky 1 a otázku brzy vrátí', () => {
    let s = applyGrade(undefined, 'good', NOW);
    s = applyGrade(s, 'good', NOW);
    s = applyGrade(s, 'bad', NOW);
    expect(s.box).toBe(1);
    expect(s.bad).toBe(1);
    expect(s.due - NOW).toBeLessThan(DAY);
  });
  it('krabička nepřeteče přes 5', () => {
    let s = applyGrade(undefined, 'good', NOW);
    for (let i = 0; i < 10; i++) s = applyGrade(s, 'good', NOW);
    expect(s.box).toBe(5);
  });
  it('fronta: nejdřív splatné, pak nové', () => {
    const items = {
      a: { ...applyGrade(undefined, 'bad', NOW - DAY) },
      b: { ...applyGrade(undefined, 'good', NOW) }, // splatné až zítra
    };
    const q = buildReviewQueue(['b', 'c', 'a', 'd'], items, NOW, { limit: 10, newLimit: 1 });
    expect(q).toEqual(['a', 'c']);
  });
  it('procvičování dá slabé otázky dopředu', () => {
    const items = { strong: { ...applyGrade(applyGrade(undefined, 'good', NOW), 'good', NOW) } };
    const order = orderForPractice(['strong', 'new1', 'new2'], items, () => 0.5);
    expect(order[2]).toBe('strong');
  });
  it('„umíš“ = naposledy správně: hned po správné odpovědi, chyba i „částečně“ to shodí', () => {
    const good = applyGrade(undefined, 'good', NOW);
    expect(isMastered(good)).toBe(true);
    expect(summarize(['a'], { a: good }, NOW).mastered).toBe(1);
    expect(isMastered(applyGrade(good, 'bad', NOW))).toBe(false);
    const twoGood = applyGrade(good, 'good', NOW);
    expect(isMastered(applyGrade(twoGood, 'partial', NOW))).toBe(false);
    expect(isMastered(undefined)).toBe(false);
  });
  it('starší data bez lastGood: rozhoduje krabička ≥ 2', () => {
    const { lastGood: _, ...old } = applyGrade(undefined, 'good', NOW);
    expect(isMastered(old)).toBe(true);
    expect(isMastered({ ...old, box: 1 })).toBe(false);
  });
  it('unseen vrátí jen dosud nezodpovězené otázky', () => {
    const items = { a: applyGrade(undefined, 'bad', NOW) };
    expect(unseen(['a', 'b', 'c'], items)).toEqual(['b', 'c']);
  });
  it('summarize a parseProgress', () => {
    const items = { a: applyGrade(undefined, 'good', NOW) };
    expect(summarize(['a', 'b'], items, NOW).seen).toBe(1);
    expect(parseProgress({ v: 1, items })).not.toBeNull();
    expect(parseProgress({ foo: 1 })).toBeNull();
  });
});

const quiz: QuizQ[] = Array.from({ length: 10 }, (_, i) => ({
  id: `q${i}`,
  topicId: i < 5 ? 'a' : 'b',
  question: `Otázka ${i}`,
  options: ['1', '2', '3', '4'],
  correct: i % 4,
  explanation: 'x',
}));
const oral: OralQ[] = Array.from({ length: 6 }, (_, i) => ({
  id: `o${i}`,
  topicId: i < 3 ? 'a' : 'b',
  question: `Ústní ${i}`,
  answer: 'x',
  source: 'ai',
}));

describe('Simulace', () => {
  it('vybere správný počet unikátních otázek z vybraných okruhů', () => {
    const exam = buildQuizExam(quiz, { ...DEFAULT_EXAM, quizCount: 4, topicIds: ['b'] });
    expect(exam).toHaveLength(4);
    expect(new Set(exam.map((q) => q.id)).size).toBe(4);
    expect(exam.every((q) => q.topicId === 'b')).toBe(true);
  });
  it('vyhodnotí skóre a úspěch', () => {
    const qs = quiz.slice(0, 4);
    const score = scoreExam(qs, [0, 1, 0, null], 50);
    expect(score.correct).toBe(2);
    expect(score.percent).toBe(50);
    expect(score.passed).toBe(true);
    expect(score.wrongIds).toEqual(['q2', 'q3']);
  });
  it('ústní losování střídá okruhy', () => {
    const drawn = drawOral(oral, { ...DEFAULT_EXAM, oralCount: 2 });
    expect(new Set(drawn.map((q) => q.topicId)).size).toBe(2);
  });
  it('formatTime', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(-3)).toBe('0:00');
  });
});

describe('Šifrování', () => {
  it('tam a zpět, špatné heslo selže', async () => {
    const data = { hello: 'Příliš žluťoučký kůň', n: [1, 2, 3] };
    const enc = await encryptJson(data, 'tajne');
    expect(JSON.stringify(enc)).not.toContain('kůň');
    expect(await decryptJson(enc, 'tajne')).toEqual(data);
    await expect(decryptJson(enc, 'spatne')).rejects.toThrow();
  });
});
