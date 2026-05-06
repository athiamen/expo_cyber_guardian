import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppThemeColors } from "../../../theme/palette";
import { useAppTheme } from "../../../theme/useAppTheme";
import type { QuestionEvent } from "../constants/quizGameConstants";
import type { QuizQuestion } from "../data/quizCatalog";

type QuizClassicViewProps = {
  currentQuestion: QuizQuestion;
  currentQuestionEvent: QuestionEvent | null;
  selectedForCurrent: number | undefined;
  currentExplanation: string | null;
  isCurrentAnswerCorrect: boolean;
  isLastQuestion: boolean;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion: () => void;
  tQuiz: (key: string, options?: Record<string, unknown>) => string;
  styles: any;
};

export function QuizClassicView({
  currentQuestion,
  currentQuestionEvent,
  selectedForCurrent,
  currentExplanation,
  isCurrentAnswerCorrect,
  isLastQuestion,
  onSelectOption,
  onNextQuestion,
  tQuiz,
  styles,
}: QuizClassicViewProps) {
  const { colors, typography } = useAppTheme();
  const localStyles = useMemo(() => createLocalStyles(colors), [colors]);
  return (
    <>
      {currentQuestionEvent ? (
        <View style={localStyles.questionEventCard}>
          <View style={localStyles.questionEventHeader}>
            <View style={localStyles.questionEventIconWrap}>
              <Text style={localStyles.questionEventIcon}>
                {currentQuestionEvent.icon}
              </Text>
            </View>
            <Text style={localStyles.questionEventTitle}>
              {currentQuestionEvent.title}
            </Text>
          </View>
          <Text style={localStyles.questionEventContext}>
            {currentQuestionEvent.context}
          </Text>
          <View style={localStyles.questionEventMessageBox}>
            <Text style={localStyles.questionEventMessage}>
              {currentQuestionEvent.message}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={localStyles.questionTopRow}>
        <Text style={typography.cardCode}>{currentQuestion.id}</Text>
        <Text style={localStyles.questionMeta}>{currentQuestion.module}</Text>
      </View>

      <Text style={typography.cardTitle}>{currentQuestion.prompt}</Text>

      <View style={localStyles.optionsWrap}>
        {currentQuestion.options.map((option, optionIndex) => {
          const isSelected = selectedForCurrent === optionIndex;
          const isCorrectOption = currentQuestion.correctIndex === optionIndex;
          const showCorrectOption =
            selectedForCurrent !== undefined && isCorrectOption;
          const showWrongSelected =
            selectedForCurrent !== undefined && isSelected && !isCorrectOption;

          return (
            <Pressable
              key={option}
              onPress={() => onSelectOption(optionIndex)}
              style={[
                localStyles.optionItem,
                isSelected && localStyles.optionItemSelected,
                showCorrectOption && localStyles.optionItemCorrect,
                showWrongSelected && localStyles.optionItemWrong,
              ]}
              disabled={selectedForCurrent !== undefined}
            >
              <Text
                style={[
                  localStyles.optionIndex,
                  isSelected && localStyles.optionIndexSelected,
                  showCorrectOption && localStyles.optionIndexCorrect,
                  showWrongSelected && localStyles.optionIndexWrong,
                ]}
              >
                {String.fromCharCode(65 + optionIndex)}
              </Text>
              <Text
                style={[
                  localStyles.optionText,
                  isSelected && localStyles.optionTextSelected,
                  showWrongSelected && localStyles.optionTextWrong,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {currentExplanation ? (
        <View
          style={[
            localStyles.feedbackCard,
            isCurrentAnswerCorrect
              ? localStyles.feedbackCardSuccess
              : localStyles.feedbackCardError,
          ]}
        >
          <Text style={localStyles.feedbackTitle}>
            {isCurrentAnswerCorrect
              ? tQuiz("correctAnswerTitle")
              : tQuiz("wrongAnswerTitle")}
          </Text>
          <Text style={localStyles.feedbackBody}>{currentExplanation}</Text>
        </View>
      ) : null}

      <Text style={styles.autoNextLabel}>
        {selectedForCurrent === undefined
          ? tQuiz("chooseAnswer")
          : tQuiz("readExplanation")}
      </Text>

      {selectedForCurrent !== undefined ? (
        <Pressable onPress={onNextQuestion} style={styles.primaryButton}>
          <Text style={[styles.primaryButtonText, { color: colors.text }]}>
            {isLastQuestion ? tQuiz("showResult") : tQuiz("nextQuestion")}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

const createLocalStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    questionEventCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 10,
    },
    questionEventHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    questionEventIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.moduleCardActiveBg,
    },
    questionEventIcon: {
      fontSize: 20,
    },
    questionEventTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    questionEventContext: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "600",
    },
    questionEventMessageBox: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 12,
    },
    questionEventMessage: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "600",
    },
    questionTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    questionMeta: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
    optionsWrap: {
      gap: 8,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 13,
      minHeight: 56,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    optionItemSelected: {
      borderColor: colors.accent,
      borderWidth: 3,
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    optionItemCorrect: {
      borderColor: colors.quizItemCompletedBorder,
      borderWidth: 3,
      backgroundColor: colors.quizItemCompletedBg,
      shadowColor: colors.quizItemCompletedBorder,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    optionItemWrong: {
      borderColor: colors.error,
      borderWidth: 3,
      backgroundColor: colors.surfaceSoft,
      shadowColor: colors.error,
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    optionIndex: {
      width: 30,
      height: 30,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: colors.border,
      color: colors.textMuted,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: 13,
      fontWeight: "800",
    },
    optionIndexSelected: {
      borderColor: colors.accent,
      borderWidth: 3,
      color: colors.text,
      backgroundColor: colors.accent,
    },
    optionIndexCorrect: {
      borderColor: colors.quizItemCompletedBorder,
      borderWidth: 3,
      color: colors.text,
      backgroundColor: colors.quizItemCompletedBorder,
    },
    optionIndexWrong: {
      borderColor: colors.error,
      borderWidth: 3,
      color: colors.text,
      backgroundColor: colors.error,
    },
    optionText: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    optionTextSelected: {
      color: colors.text,
      fontWeight: "700",
    },
    optionTextWrong: {
      color: colors.text,
      fontWeight: "700",
    },
    feedbackCard: {
      borderRadius: 12,
      borderWidth: 2,
      padding: 12,
      gap: 6,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    feedbackCardSuccess: {
      borderColor: colors.quizItemCompletedBorder,
      backgroundColor: colors.quizItemCompletedBg,
    },
    feedbackCardError: {
      borderColor: colors.error,
      backgroundColor: colors.error,
    },
    feedbackTitle: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    feedbackBody: {
      color: "#ffffff",
      fontSize: 14,
      lineHeight: 21,
    },
    timeWarningCard: {
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.warning,
      backgroundColor: colors.warningContainer,
      paddingHorizontal: 10,
      paddingVertical: 8,
      shadowColor: colors.warning,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    timeWarningText: {
      color: colors.onWarningContainer,
      fontSize: 12,
      fontWeight: "800",
      lineHeight: 18,
    },
  });
