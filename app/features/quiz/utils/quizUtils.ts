import type { QuizQuestion } from '../data/quizCatalog';
import { FIREWALL_FLOW_BY_QUESTION, FIREWALL_DATA_ITEMS } from '../firewall/firewallGame';

export function buildAnswerExplanation(
  question: QuizQuestion,
  selectedIndex: number,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const correctOption = question.options[question.correctIndex];
  const selectedOption = question.options[selectedIndex];
  const isCorrect = selectedIndex === question.correctIndex;

  if (isCorrect) {
    return t('answerExplanation.correct', { correctOption });
  }

  return t('answerExplanation.wrong', { selectedOption, correctOption });
}

export function calculateFirewallInventory(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>
): Array<{
  key: string;
  icon: string;
  label: string;
  protectedCount: number;
  leakedCount: number;
}> {
  const counters = FIREWALL_DATA_ITEMS.reduce<Record<string, { protectedCount: number; leakedCount: number }>>(
    (acc, item) => {
      acc[item.key] = { protectedCount: 0, leakedCount: 0 };
      return acc;
    },
    {}
  );

  questions.forEach((question) => {
    const flow = FIREWALL_FLOW_BY_QUESTION[question.id];
    if (!flow) {
      return;
    }

    const selected = selectedAnswers[question.id];
    if (selected === undefined) {
      return;
    }

    if (selected === question.correctIndex) {
      counters[flow.dataKey].protectedCount += 1;
    } else {
      counters[flow.dataKey].leakedCount += 1;
    }
  });

  return FIREWALL_DATA_ITEMS.map((item) => ({
    ...item,
    protectedCount: counters[item.key]?.protectedCount ?? 0,
    leakedCount: counters[item.key]?.leakedCount ?? 0,
  }));
}

export function buildFirewallStars(
  arenaWidth: number,
  arenaHeight: number
): Array<{ id: number; x: number; y: number; size: number; opacity: number }> {
  if (arenaWidth <= 0 || arenaHeight <= 0) {
    return [];
  }

  return Array.from({ length: 40 }, (_, index) => ({
    id: index + 1,
    x: (index * 61) % (arenaWidth + 100) - 50,
    y: (Math.sin(index * 0.7) * 0.5 + 0.5) * arenaHeight * 0.78 + 18,
    size: 2 + (index % 3 === 0 ? 1 : 0),
    opacity: 0.18 + (index % 4) * 0.03,
  }));
}
