import { useEffect, useState } from 'react';
import { CHAT_GUARDIAN_SCENARIOS } from '../data/chatGuardianData';

type ChatGuardianAnimationState = {
  typingMessageIndex: number;
};

export function useChatGuardianTypingAnimation(
  selectedContactIndex: number,
  selectedForCurrent: number | undefined,
  quizCompleted: boolean
): ChatGuardianAnimationState {
  const [typingMessageIndex, setTypingMessageIndex] = useState(0);

  useEffect(() => {
    if (quizCompleted || selectedForCurrent !== undefined) {
      return;
    }

    const currentScenario = CHAT_GUARDIAN_SCENARIOS[selectedContactIndex];
    if (!currentScenario) {
      return;
    }

    if (typingMessageIndex < currentScenario.messages.length) {
      const timer = setTimeout(() => {
        setTypingMessageIndex((prev) => prev + 1);
      }, 2000); // 2 second delay between messages
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, selectedForCurrent, selectedContactIndex, typingMessageIndex]);

  // Reset typing animation when contact changes
  useEffect(() => {
    setTypingMessageIndex(0);
  }, [selectedContactIndex]);

  return {
    typingMessageIndex,
  };
}
