import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
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

  // Load quiz definition
  const quizDefinition = useMemo(
    () => getOrCreateQuiz(requestedQuizId, t, selectedDifficulty),
    [requestedQuizId, selectedDifficulty, t],
  );

  // Get time per question based on difficulty (firewall has different times)
  const { timePerQuestion } = useDifficultySettings(
    selectedDifficulty,
    "firewall",
  );

  // Use custom hooks for state management
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

  // Derived state
  const currentQuestion = quizDefinition.questions[quizCore.currentIndex];

  // Firewall-specific calculations
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

  // Hide pirate after 5 seconds of game start
  useEffect(() => {
    if (!quizFirewall.firewallGameRunning) {
      setShowPirate(true);
      return;
    }

    const pirateTImerId = setTimeout(() => {
      setShowPirate(false);
    }, 5000);

    return () => clearTimeout(pirateTImerId);
  }, [quizFirewall.firewallGameRunning]);

  if (quizCore.quizCompleted) {
    return (
      <View>
        <Text>{tQuiz("finalResultEyebrow")}</Text>
        <Text>{quizCore.successRate}%</Text>
        <Text>Quiz completed!</Text>
      </View>
    );
  }

  return (
    <View>
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
            // New props for improvements
            firewallCombo={quizFirewall.firewallCombo}
            firewallComboMultiplier={quizFirewall.firewallComboMultiplier}
            firewallActiveEffect={quizFirewall.firewallActiveEffect}
            firewallGameStats={quizFirewall.firewallGameStats}
            showPirate={showPirate}
          />

          {/* Game Over Results Modal */}
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
        <Text>{tQuiz("noQuestion")}</Text>
      )}
    </View>
  );
}
