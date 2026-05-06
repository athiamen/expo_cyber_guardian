import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import {
  moderateScale,
  normalizeFont,
  verticalScale
} from "../../../lib/responsive";
import { useAppTheme } from "../../../theme/useAppTheme";
import { FirewallDefenderView } from "../components/FirewallDefenderView";
import { FirewallResultsView } from "../components/FirewallResultsView";
import { getOrCreateQuiz } from "../data/quizCatalog";
import type { QuizDifficulty } from "../data/quizCatalogData";
import { useDifficultySettings } from "../hooks/useDifficultySettings";
import { useFirewallAnimationLoop } from "../hooks/useFirewallAnimationLoop";
import { useQuizCore } from "../hooks/useQuizCore";
import { useQuizTimer } from "../hooks/useQuizTimer";
import {
  buildFirewallStars,
  calculateFirewallInventory,
} from "../utils/quizUtils";

type FirewallDefenderQuizScreenProps = {
  userId: string;
  requestedQuizId: string;
  onGameEnd?: () => void;
  selectedDifficulty: QuizDifficulty;
};

export function FirewallDefenderQuizScreen({
  userId,
  requestedQuizId,
  selectedDifficulty,
  onGameEnd,
}: FirewallDefenderQuizScreenProps) {
  const { t } = useTranslation();
  const tQuiz = (key: string, options?: Record<string, unknown>) =>
    t(`quiz.${key}`, options);
  const [showResults, setShowResults] = useState(false);
  const [showPirate, setShowPirate] = useState(true);

  const quizDefinition = useMemo(
    () => getOrCreateQuiz(requestedQuizId, t, selectedDifficulty),
    [requestedQuizId, selectedDifficulty, t],
  );

  const { timePerQuestion } = useDifficultySettings(
    selectedDifficulty,
    "firewall",
  );
  const { colors, typography } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const quizCore = useQuizCore(quizDefinition, userId);
  const quizFirewall = useFirewallAnimationLoop(
    selectedDifficulty,
    quizCore.currentIndex < quizDefinition.questions.length,
  );
  const quizTimer = useQuizTimer(
    timePerQuestion,
    !quizCore.quizCompleted && quizFirewall.firewallGameRunning,
    quizFirewall.firewallGamePaused,
  );

  const currentQuestion = quizDefinition.questions[quizCore.currentIndex];

  const firewallMistakes = Math.max(0, quizCore.answeredCount - quizCore.score);
  const quizShieldPct = Math.max(0, 100 - firewallMistakes * 20);
  const firewallShieldPct = quizFirewall.firewallGameRunning
    ? quizFirewall.firewallGameShieldPct
    : quizFirewall.firewallGameShieldCountdown > 0
      ? 100
      : quizShieldPct;
  const firewallScoreLabel = quizFirewall.firewallGameRunning
    ? quizFirewall.firewallGamePoints
    : quizCore.score;
  const firewallLivesLabel = quizFirewall.firewallGameRunning
    ? quizFirewall.firewallGameLives
    : Math.max(0, 6 - firewallMistakes);
  const firewallShieldCountdown = quizFirewall.firewallGameRunning
    ? quizFirewall.firewallGameShieldCountdown
    : 0;

  const firewallInventory = useMemo(
    () =>
      calculateFirewallInventory(
        quizDefinition.questions,
        quizCore.selectedAnswers,
      ),
    [quizDefinition.questions, quizCore.selectedAnswers],
  );

  const firewallStars = useMemo(
    () =>
      buildFirewallStars(
        quizFirewall.firewallArenaSize.width,
        quizFirewall.firewallArenaSize.height,
      ),
    [
      quizFirewall.firewallArenaSize.width,
      quizFirewall.firewallArenaSize.height,
    ],
  );

  const firewallPirateZone = {
    x: 10,
    y: Math.max(12, quizFirewall.firewallArenaSize.height - 90),
    w: Math.max(120, quizFirewall.firewallArenaSize.width * 0.18),
    h: 80,
  };

  useEffect(() => {
    if (!quizFirewall.firewallGameRunning) {
      setShowPirate(true);
      return;
    }

    const pirateTimerId = setTimeout(() => {
      setShowPirate(false);
    }, 5000);

    return () => clearTimeout(pirateTimerId);
  }, [quizFirewall.firewallGameRunning]);

  if (quizCore.quizCompleted) {
    return (
      <View style={styles.resultsContainer}>
        <Text style={[typography.eyebrowWarning, styles.resultEyebrow]}>
          {tQuiz("finalResultEyebrow")}
        </Text>
        <Text style={[typography.statValue, styles.resultValue]}>
          {quizCore.successRate}%
        </Text>
        <Text style={[typography.body, styles.resultBody]}>
          {tQuiz("quizCompleted")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentQuestion ? (
        <>
          <FirewallDefenderView
            isCompactLayout={true}
            firewallScoreLabel={firewallScoreLabel}
            streak={quizCore.streak}
            firewallLivesLabel={firewallLivesLabel}
            firewallShieldPct={firewallShieldPct}
            firewallShieldCountdown={firewallShieldCountdown}
            timeLeft={quizTimer.timeLeft}
            selectedDifficulty={selectedDifficulty}
            firewallArenaRef={quizFirewall.firewallArenaRef}
            firewallChestPanResponder={quizFirewall.firewallChestPanResponder}
            onArenaLayout={quizFirewall.handleArenaLayout}
            firewallStars={firewallStars}
            firewallPirateZone={firewallPirateZone}
            firewallObjects={quizFirewall.firewallObjects}
            firewallChestLeft={quizFirewall.firewallChestX}
            firewallTouchpadVisible={true}
            onMoveFirewallChest={quizFirewall.moveChest}
            onStartFirewallGame={quizFirewall.startGame}
            onToggleFirewallPause={quizFirewall.togglePause}
            onResetFirewallGame={quizFirewall.resetGame}
            firewallGamePaused={quizFirewall.firewallGamePaused}
            firewallGameRunning={quizFirewall.firewallGameRunning}
            firewallInventory={firewallInventory}
            firewallCombo={quizFirewall.firewallCombo}
            firewallComboMultiplier={quizFirewall.firewallComboMultiplier}
            firewallActiveEffect={quizFirewall.firewallActiveEffect}
            firewallGameStats={quizFirewall.firewallGameStats}
            showPirate={showPirate}
          />

          <FirewallResultsView
            isVisible={
              quizFirewall.firewallGameLives <= 0 &&
              !quizFirewall.firewallGameRunning
            }
            gameStats={quizFirewall.firewallGameStats}
            finalScore={quizFirewall.firewallGamePoints}
            finalLives={quizFirewall.firewallGameLives}
            onClose={() => {
              setShowResults(false);
              onGameEnd?.();
            }}
            onRestart={() => {
              setShowResults(false);
              quizFirewall.resetGame();
            }}
          />
        </>
      ) : (
        <Text style={[typography.body, styles.noQuestionText]}>
          {tQuiz("noQuestion")}
        </Text>
      )}
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>["colors"],
  typography: ReturnType<typeof useAppTheme>["typography"],
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    resultsContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: moderateScale(20),
      backgroundColor: colors.background,
    },
    resultEyebrow: {
      marginBottom: verticalScale(8),
    },
    resultValue: {
      fontSize: normalizeFont(40),
      color: colors.accent,
      marginBottom: verticalScale(8),
    },
    resultBody: {
      textAlign: "center",
      color: colors.textMuted,
    },
    noQuestionText: {
      textAlign: "center",
      color: colors.error,
      marginTop: verticalScale(20),
    },
  });
