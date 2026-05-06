import { AppThemeColors } from "@/app/theme/palette";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { typography } from "../../../theme/typography";
import { useAppTheme } from "../../../theme/useAppTheme";
import { ChatGuardianView } from "../components/ChatGuardianView";
import {
  CHAT_GUARDIAN_SCENARIOS,
  findScenarioIndexByContactName,
} from "../data/chatGuardianData";
import { getOrCreateQuiz } from "../data/quizCatalog";
import type { QuizDifficulty } from "../data/quizCatalogData";
import { useChatGuardianTypingAnimation } from "../hooks/useChatGuardianTypingAnimation";
import { useQuizCore } from "../hooks/useQuizCore";
import { useQuizSubmission } from "../hooks/useQuizSubmission";
import { buildAnswerExplanation } from "../utils/quizUtils";

type ChatGuardianQuizScreenProps = {
  token?: string;
  userId: string;
  requestedQuizId: string;
  selectedDifficulty: QuizDifficulty;
};

export function ChatGuardianQuizScreen({
  token,
  userId,
  requestedQuizId,
  selectedDifficulty,
}: ChatGuardianQuizScreenProps) {
  const { t } = useTranslation();
  const tQuiz = (key: string, options?: Record<string, unknown>) =>
    t(`quiz.${key}`, options);

  // Load quiz definition
  const quizDefinition = useMemo(
    () => getOrCreateQuiz(requestedQuizId, t, selectedDifficulty),
    [requestedQuizId, selectedDifficulty, t],
  );

  const { colors } = useAppTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);
  // Use custom hooks for state management
  const quizCore = useQuizCore(quizDefinition, userId);
  const quizSubmission = useQuizSubmission(
    quizDefinition,
    quizCore.selectedAnswers,
    quizCore.quizCompleted,
    token,
  );

  // Chat Guardian specific state
  const selectedContactIndex = quizCore.currentIndex;
  const typingAnimation = useChatGuardianTypingAnimation(
    selectedContactIndex,
    quizCore.selectedAnswers[
      quizDefinition.questions[quizCore.currentIndex]?.id
    ] !== undefined
      ? 0
      : undefined,
    quizCore.quizCompleted,
  );

  // Derived state
  const currentQuestion = quizDefinition.questions[quizCore.currentIndex];
  const selectedForCurrent = currentQuestion
    ? quizCore.selectedAnswers[currentQuestion.id]
    : undefined;
  const isLastQuestion =
    quizCore.currentIndex === quizDefinition.questions.length - 1;
  const currentExplanation =
    currentQuestion !== undefined && selectedForCurrent !== undefined
      ? buildAnswerExplanation(
          currentQuestion,
          selectedForCurrent,
          (key, options) => tQuiz(key, options),
        )
      : null;
  const isCurrentAnswerCorrect = currentQuestion
    ? selectedForCurrent === currentQuestion.correctIndex
    : false;
  const currentChatGuardianScenario =
    CHAT_GUARDIAN_SCENARIOS[selectedContactIndex] ?? CHAT_GUARDIAN_SCENARIOS[0];

  const handleSelectContact = (contactName: string) => {
    const scenarioIndex = findScenarioIndexByContactName(contactName);
    if (scenarioIndex === null) {
      return;
    }

    // In ChatGuardian, scenario index corresponds to question index
    if (scenarioIndex !== quizCore.currentIndex) {
      // Navigate to that question
      // Reset selected answer for this contact's question
      const targetQuestion = quizDefinition.questions[scenarioIndex];
      if (
        targetQuestion &&
        quizCore.selectedAnswers[targetQuestion.id] === undefined
      ) {
        setCurrentIndex(scenarioIndex);
      }
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    quizCore.selectOption(optionIndex);
  };

  const handleGoToNextQuestion = () => {
    if (selectedForCurrent === undefined) {
      return;
    }

    if (isLastQuestion) {
      quizCore.goToNextQuestion();
      return;
    }

    // Move to next contact/scenario
    quizCore.goToNextQuestion();
  };

  if (quizCore.quizCompleted) {
    return (
      <View style={styles.questionCard}>
        <Text style={typography.eyebrowWarning}>
          {tQuiz("finalResultEyebrow")}
        </Text>
        <Text style={styles.resultValue}>{quizCore.successRate}%</Text>
        <Text style={styles.resultBody}>
          {tQuiz("resultBody", {
            count: quizCore.score,
            score: quizCore.score,
            total: quizDefinition.questions.length,
          })}
        </Text>
        {token ? (
          <Text style={styles.syncStatus}>
            {quizSubmission.submissionState === "submitting" &&
              tQuiz("syncSubmitting")}
            {quizSubmission.submissionState === "submitted" &&
            quizSubmission.submissionResult
              ? tQuiz("syncSubmitted", {
                  score: quizSubmission.submissionResult.score,
                  total: quizSubmission.submissionResult.total,
                  rate: quizSubmission.submissionResult.successRate,
                })
              : null}
            {quizSubmission.submissionState === "error" && tQuiz("syncError")}
          </Text>
        ) : (
          <Text style={styles.syncStatus}>{tQuiz("syncLoginRequired")}</Text>
        )}
        <Pressable onPress={quizCore.resetQuiz} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{tQuiz("restart")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.questionCard}>
      {currentQuestion && currentChatGuardianScenario ? (
        <ChatGuardianView
          currentScenario={currentChatGuardianScenario}
          currentQuestion={currentQuestion}
          selectedForCurrent={selectedForCurrent}
          typingMessageIndex={typingAnimation.typingMessageIndex}
          currentExplanation={currentExplanation}
          isCurrentAnswerCorrect={isCurrentAnswerCorrect}
          isLastQuestion={isLastQuestion}
          onSelectContact={handleSelectContact}
          onSelectOption={handleSelectOption}
          onNextQuestion={handleGoToNextQuestion}
          tQuiz={tQuiz}
          styles={styles}
        />
      ) : (
        <Text style={styles.warningText}>{tQuiz("noQuestion")}</Text>
      )}
    </View>
  );
}

const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    questionCard: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(12),
    },
    warningText: {
      marginTop: moderateScale(8),
      color: "#ffb9b9",
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
    resultValue: {
      color: colors.accent,
      fontSize: normalizeFont(40),
      fontWeight: "900",
      letterSpacing: -0.6,
    },
    resultBody: {
      color: colors.textMuted,
      fontSize: normalizeFont(15),
      lineHeight: verticalScale(21),
    },
    syncStatus: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
    primaryButton: {
      borderRadius: scale(12),
      backgroundColor: colors.accent,
      paddingVertical: moderateScale(12),
      alignItems: "center",
      shadowColor: colors.accent,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: normalizeFont(15),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
    },
    feedbackCard: {
      borderRadius: scale(12),
      borderWidth: scale(2),
      padding: moderateScale(12),
      gap: moderateScale(6),
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    feedbackCardSuccess: {
      borderColor: "#22c55e",
      backgroundColor: "#166534",
    },
    feedbackCardError: {
      borderColor: "#ef4444",
      backgroundColor: "#7f1d1d",
    },
    feedbackTitle: {
      color: "#ffffff",
      fontSize: normalizeFont(13),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
    },
    feedbackBody: {
      color: "#e8f5e9",
      fontSize: normalizeFont(13),
      lineHeight: verticalScale(19),
    },
    autoNextLabel: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      fontWeight: "700",
      letterSpacing: moderateScale(0.2),
    },
  });

// Placeholder for local state to fix the error
function setCurrentIndex(_index: number) {
  // This will be handled via goToNextQuestion callback
}
