import type { QuizDefinition } from '../quizCatalog';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export type QuizQuestions = Omit<QuizDefinition, 'id'>['questions'];

export type QuizCatalogEntry = {
  title: string;
  module: string;
  questions?: QuizQuestions;
  difficulties?: Record<QuizDifficulty, QuizQuestions>;
};

export function q(id: string, module: string, prompt: string, options: string[], correctIndex: number) {
  return { id, module, prompt, options, correctIndex };
}
