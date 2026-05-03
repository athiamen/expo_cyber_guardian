import type { TFunction } from 'i18next';
import { QUIZ_CATALOG_BY_ID } from './quizCatalogData';
import type { QuizDifficulty } from './quizCatalogData';

export type QuizQuestion = {
  id: string;
  module: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type QuizDefinition = {
  id: string;
  title: string;
  module: string;
  questions: QuizQuestion[];
};

export function getOrCreateQuiz(
  quizId: string | undefined,
  t: TFunction,
  difficulty: QuizDifficulty = 'easy'
): QuizDefinition {
  const fallbackId = quizId ?? 'Q1';
  const quizData = QUIZ_CATALOG_BY_ID[fallbackId];

  if (quizData) {
    const questions = quizData.difficulties?.[difficulty] ?? quizData.questions ?? [];

    return {
      id: fallbackId,
      title: quizData.title,
      module: quizData.module,
      questions,
    };
  }

  return {
    id: fallbackId,
    title: t('quiz.fallback.title', { id: fallbackId }),
    module: t('quiz.fallback.module'),
    questions: [
      {
        id: `${fallbackId}-1`,
        module: t('quiz.fallback.module'),
        prompt: t('quiz.fallback.prompt'),
        options: t('quiz.fallback.options', { returnObjects: true }) as string[],
        correctIndex: 0,
      },
    ],
  };
}
