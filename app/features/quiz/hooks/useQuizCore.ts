import { useCallback, useMemo, useState } from 'react';
import { markQuizCompleted } from '../../../lib/learningProgress';
import type { QuizDefinition } from '../data/quizCatalog';

type QuizCoreState = {
  currentIndex: number;
  selectedAnswers: Record<string, number>;
  quizCompleted: boolean;
  streak: number;
  isAnswerLocked: boolean;
  score: number;
  progress: number;
  successRate: number;
  answeredCount: number;
};

type QuizCoreActions = {
  selectOption: (optionIndex: number) => void;
  goToNextQuestion: () => void;
  resetQuiz: () => void;
};

export function useQuizCore(
  quizDefinition: QuizDefinition | null,
  userId: string
): QuizCoreState & QuizCoreActions {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const questions = quizDefinition?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const score = useMemo(
    () => questions.reduce((acc, question) => {
      return selectedAnswers[question.id] === question.correctIndex ? acc + 1 : acc;
    }, 0),
    [questions, selectedAnswers]
  );

  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const successRate = questions.length ? Math.round((score / questions.length) * 100) : 0;

  const selectOption = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion || isAnswerLocked || selectedAnswers[currentQuestion.id] !== undefined) {
        return;
      }

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      setStreak((previous) => (isCorrect ? previous + 1 : 0));
      setIsAnswerLocked(true);
      setSelectedAnswers((previous) => ({
        ...previous,
        [currentQuestion.id]: optionIndex,
      }));
      setIsAnswerLocked(false);
    },
    [currentQuestion, isAnswerLocked, selectedAnswers]
  );

  const goToNextQuestion = useCallback(() => {
    if (!currentQuestion || selectedAnswers[currentQuestion.id] === undefined) {
      return;
    }

    if (currentIndex === questions.length - 1) {
      void markQuizCompleted(quizDefinition!.id, userId);
      setQuizCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, currentQuestion, questions.length, selectedAnswers, quizDefinition, userId]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setStreak(0);
    setQuizCompleted(false);
    setIsAnswerLocked(false);
  }, []);

  return {
    currentIndex,
    selectedAnswers,
    quizCompleted,
    streak,
    isAnswerLocked,
    score,
    progress,
    successRate,
    answeredCount,
    selectOption,
    goToNextQuestion,
    resetQuiz,
  };
}
