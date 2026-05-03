import { useMemo } from 'react';
import { TIME_PER_DIFFICULTY, FIREWALL_FALL_MULTIPLIER } from '../constants/quizGameConstants';
import type { QuizDifficulty } from '../data/quizCatalogData';

type DifficultySettings = {
  timePerQuestion: number;
  speedMultiplier: number;
  driftMultiplier: number;
};

export function useDifficultySettings(
  difficulty: QuizDifficulty,
  quizType: 'firewall' | 'classic' | 'chatguardian' = 'classic'
): DifficultySettings {
  return useMemo(() => {
    let timePerQuestion: number;

    if (quizType === 'firewall') {
      // Firewall has different timing
      timePerQuestion = difficulty === 'easy' ? 90 : difficulty === 'medium' ? 75 : 60;
    } else {
      // Classic and ChatGuardian use TIME_PER_DIFFICULTY
      timePerQuestion = TIME_PER_DIFFICULTY[difficulty];
    }

    const speedMultiplier = 1; // Base speed
    const driftMultiplier = FIREWALL_FALL_MULTIPLIER[difficulty];

    return {
      timePerQuestion,
      speedMultiplier,
      driftMultiplier,
    };
  }, [difficulty, quizType]);
}
