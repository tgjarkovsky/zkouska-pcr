export type Part = 'oral' | 'quiz';

export interface Topic {
  id: string;
  title: string;
  /** do které části okruh patří */
  parts: Part[];
}

/** odkud pochází text: přepsáno z podkladu, vypracováno AI, nebo podklad doplněný AI */
export type Source = 'podklad' | 'ai' | 'mix';

export interface OralQ {
  id: string;
  topicId: string;
  question: string;
  /** markdown */
  answer: string;
  source: Source;
  refs?: string[];
}

export interface QuizQ {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  /** index správné možnosti (0 = A) */
  correct: number;
  /** markdown – proč je správná právě tato */
  explanation: string;
  /** krátké zdůvodnění ke každé možnosti (stejné pořadí jako options) */
  optionNotes?: string[];
  refs?: string[];
  /** zda správnou odpověď uvádí podklad, nebo ji určila AI */
  source?: Source;
}

export interface Content {
  version: number;
  updated: string;
  topics: Topic[];
  oral: OralQ[];
  quiz: QuizQ[];
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
