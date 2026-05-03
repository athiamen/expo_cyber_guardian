import { useEffect, useState } from 'react';

type QuizTimerState = {
  timeLeft: number;
  timeWarningMessage: string | null;
};

export function useQuizTimer(
  timePerQuestion: number,
  isActive: boolean,
  shouldPause: boolean = false
): QuizTimerState {
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [timeWarningMessage, setTimeWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    setTimeWarningMessage(null);
    setTimeLeft(timePerQuestion);
  }, [timePerQuestion]);

  useEffect(() => {
    if (!isActive || shouldPause) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          setTimeWarningMessage(' Temps ecoulé ! Essaie de répondre plus vite a la prochaine question.');
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, shouldPause]);

  return {
    timeLeft,
    timeWarningMessage,
  };
}
