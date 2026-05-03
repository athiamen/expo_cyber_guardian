import { useEffect, useRef, useState } from 'react';
import { submitQuizAnswers, QuizSubmitResult } from '../../../lib/api';
import type { QuizDefinition } from '../data/quizCatalog';

type QuizSubmissionState = {
  submissionState: 'idle' | 'submitting' | 'submitted' | 'error';
  submissionResult: QuizSubmitResult | null;
};

export function useQuizSubmission(
  quizDefinition: QuizDefinition | null,
  selectedAnswers: Record<string, number>,
  quizCompleted: boolean,
  token: string | undefined
): QuizSubmissionState {
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [submissionResult, setSubmissionResult] = useState<QuizSubmitResult | null>(null);
  const submissionStartedRef = useRef(false);

  useEffect(() => {
    if (!quizCompleted || !token || !quizDefinition || submissionStartedRef.current) {
      return;
    }

    submissionStartedRef.current = true;
    setSubmissionState('submitting');

    submitQuizAnswers(quizDefinition.id, selectedAnswers, token)
      .then((result) => {
        setSubmissionResult(result);
        setSubmissionState('submitted');
      })
      .catch(() => {
        setSubmissionState('error');
      });
  }, [quizCompleted, quizDefinition, selectedAnswers, token]);

  return {
    submissionState,
    submissionResult,
  };
}
