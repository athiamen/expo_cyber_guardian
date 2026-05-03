import { QUIZ_Q1 } from './quizzes/q1';
import { QUIZ_Q2 } from './quizzes/q2';
import { QUIZ_Q3 } from './quizzes/q3';
import { QUIZ_Q4 } from './quizzes/q4';
import { QUIZ_Q5 } from './quizzes/q5';
import { QUIZ_Q6 } from './quizzes/q6';
import type { QuizCatalogEntry } from './quizzes/types';

export type { QuizDifficulty } from './quizzes/types';

export const QUIZ_CATALOG_BY_ID: Record<string, QuizCatalogEntry> = {
  Q1: QUIZ_Q1,
  Q2: QUIZ_Q2,
  Q3: QUIZ_Q3,
  Q4: QUIZ_Q4,
  Q5: QUIZ_Q5,
  Q6: QUIZ_Q6,
};
