import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { useAppTheme } from "../../../theme/useAppTheme";
import { QuizClassicView } from "../components/QuizClassicView";
import { LEVEL_LABELS, QUESTION_EVENTS } from "../constants/quizGameConstants";
import { getOrCreateQuiz } from "../data/quizCatalog";
import type { QuizDifficulty } from "../data/quizCatalogData";
import { useDifficultySettings } from "../hooks/useDifficultySettings";
import { useQuizCore } from "../hooks/useQuizCore";
import { useQuizSubmission } from "../hooks/useQuizSubmission";
import { useQuizTimer } from "../hooks/useQuizTimer";
import { buildAnswerExplanation } from "../utils/quizUtils";

type ClassicQuizScreenProps = {
  token?: string;
  userId: string;
  requestedQuizId: string;
  selectedDifficulty: QuizDifficulty;
};

export function ClassicQuizScreen({
  token,
  userId,
  requestedQuizId,
  selectedDifficulty,
}: ClassicQuizScreenProps) {
  const { t } = useTranslation();
  const tQuiz = (key: string, options?: Record<string, unknown>) =>
    t(`quiz.${key}`, options);

  const quizDefinition = useMemo(
    () => getOrCreateQuiz(requestedQuizId, t, selectedDifficulty),
    [requestedQuizId, selectedDifficulty, t],
  );

  const { timePerQuestion } = useDifficultySettings(
    selectedDifficulty,
    "classic",
  );

  const { colors, typography } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const quizCore = useQuizCore(quizDefinition, userId);
  const quizTimer = useQuizTimer(
    timePerQuestion,
    !quizCore.quizCompleted,
    false,
  );
  const quizSubmission = useQuizSubmission(
    quizDefinition,
    quizCore.selectedAnswers,
    quizCore.quizCompleted,
    token,
  );

  const currentQuestion = quizDefinition.questions[quizCore.currentIndex];
  const currentQuestionEvent = currentQuestion
    ? QUESTION_EVENTS[currentQuestion.id]
    : null;
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
  const currentLevelLabel = LEVEL_LABELS[selectedDifficulty];

  const showTimeWarning =
    quizTimer.timeWarningMessage && selectedForCurrent === undefined;

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
    <>
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statText}>
            Score: <Text style={styles.statValueInline}>{quizCore.score}</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statText}>
            Serie: <Text style={styles.statValueInline}>{quizCore.streak}</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statText}>
            Temps:{" "}
            <Text style={styles.statValueInline}>{quizTimer.timeLeft}s</Text>
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏅</Text>
          <Text style={styles.statText}>
            Niveau:{" "}
            <Text style={styles.statValueInline}>{currentLevelLabel}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${quizCore.progress}%` }]}
        />
      </View>
      <Text style={styles.questionIndexLabel}>
        Question{" "}
        {Math.min(quizCore.currentIndex + 1, quizDefinition.questions.length)}{" "}
        sur {quizDefinition.questions.length}
      </Text>
      <Text style={[typography.progressLabel, styles.progressLabel]}>
        {tQuiz("overallProgress", { value: quizCore.progress })}
      </Text>

      <View style={styles.questionCard}>
        {showTimeWarning ? (
          <View style={styles.timeWarningCard}>
            <Text style={styles.timeWarningText}>
              {quizTimer.timeWarningMessage}
            </Text>
          </View>
        ) : null}
        {currentQuestion ? (
          <QuizClassicView
            currentQuestion={currentQuestion}
            currentQuestionEvent={currentQuestionEvent}
            selectedForCurrent={selectedForCurrent}
            currentExplanation={currentExplanation}
            isCurrentAnswerCorrect={isCurrentAnswerCorrect}
            isLastQuestion={isLastQuestion}
            onSelectOption={quizCore.selectOption}
            onNextQuestion={quizCore.goToNextQuestion}
            tQuiz={tQuiz}
            styles={styles}
          />
        ) : (
          <Text style={styles.warningText}>{tQuiz("noQuestion")}</Text>
        )}
      </View>
    </>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>["colors"],
  typography: ReturnType<typeof useAppTheme>["typography"],
) =>
  StyleSheet.create({
    statsBar: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(12),
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: moderateScale(10),
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(8),
    },
    statIcon: {
      fontSize: normalizeFont(17),
    },
    statText: {
      color: colors.text,
      fontSize: normalizeFont(16),
      fontWeight: "700",
    },
    statValueInline: {
      color: colors.text,
      fontWeight: "900",
    },
    progressTrack: {
      height: verticalScale(8),
      overflow: "hidden",
      borderRadius: scale(999),
      backgroundColor: colors.surfaceSoft,
    },
    progressFill: {
      height: "100%",
      borderRadius: scale(999),
      backgroundColor: colors.accent,
    },
    progressLabel: {
      marginTop: moderateScale(-2),
    },
    questionIndexLabel: {
      color: colors.text,
      fontSize: normalizeFont(16),
      fontWeight: "700",
      textAlign: "center",
      marginTop: moderateScale(6),
    },
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
      color: colors.text,
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
    timeWarningCard: {
      borderRadius: scale(10),
      borderWidth: scale(2),
      borderColor: colors.warning,
      backgroundColor: colors.warningContainer,
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(8),
      shadowColor: colors.warning,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    timeWarningText: {
      color: colors.text,
      fontSize: normalizeFont(12),
      fontWeight: "800",
      lineHeight: verticalScale(18),
    },
    resultValue: {
      color: colors.text,
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
      color: colors.text,
      fontSize: normalizeFont(15),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
    },
    autoNextLabel: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      fontWeight: "600",
      textAlign: "center",
      marginVertical: moderateScale(8),
    },
  });
