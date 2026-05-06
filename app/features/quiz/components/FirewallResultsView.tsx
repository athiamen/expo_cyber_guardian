import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../../../theme/useAppTheme";
import type { FirewallGameStats } from "../hooks/useFirewallAnimationLoop";
import { createFirewallStyles } from "./FirewallDefenderStyles";

type FirewallResultsViewProps = {
  isVisible: boolean;
  gameStats: FirewallGameStats;
  finalScore: number;
  finalLives: number;
  onClose: () => void;
  onRestart: () => void;
};

export function FirewallResultsView({
  isVisible,
  gameStats,
  finalScore,
  finalLives,
  onClose,
  onRestart,
}: FirewallResultsViewProps) {
  const { colors, typography } = useAppTheme();
  const firewallStyles = createFirewallStyles(colors);

  if (!isVisible) {
    return null;
  }

  const accuracy = gameStats.accuracy || 0;
  const successColor =
    accuracy >= 70
      ? colors.quizItemCompletedBorder
      : accuracy >= 50
        ? colors.warning
        : colors.error;

  return (
    <View style={firewallStyles.firewallPauseOverlay}>
      <View style={firewallStyles.firewallPauseModal}>
        {/* Header */}
        <Text selectable={false} style={firewallStyles.firewallPauseTitle}>
          🎯 Résultats
        </Text>

        {/* Main stats card */}
        <View
          style={[
            firewallStyles.firewallGameOverCard,
            { width: "100%", maxWidth: 400 },
          ]}
        >
          {/* Score section */}
          <View style={{ alignItems: "center", gap: 4, width: "100%" }}>
            <Text
              selectable={false}
              style={[
                firewallStyles.firewallStatsTitle,
                typography.sectionTitle,
                { fontSize: 24 },
              ]}
            >
              🏆 Score
            </Text>
            <Text
              selectable={false}
              style={[
                firewallStyles.firewallStatValue,
                { fontSize: 32, color: colors.accent },
              ]}
            >
              {finalScore}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{ height: 1, backgroundColor: colors.border, width: "100%" }}
          />

          {/* Stats grid */}
          <View style={{ gap: 12, width: "100%" }}>
            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                📊 Précision
              </Text>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallStatValue,
                  { color: successColor },
                ]}
              >
                {accuracy}%
              </Text>
            </View>

            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                ✅ Données capturées
              </Text>
              <Text selectable={false} style={firewallStyles.firewallStatValue}>
                {gameStats.dataCaught}
              </Text>
            </View>

            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                ❌ Données perdues
              </Text>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallStatValue,
                  { color: colors.error },
                ]}
              >
                {gameStats.totalLeaked}
              </Text>
            </View>

            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                🛡️ Menaces bloquées
              </Text>
              <Text selectable={false} style={firewallStyles.firewallStatValue}>
                {gameStats.threatBlocked}
              </Text>
            </View>

            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                💎 Power-ups
              </Text>
              <Text selectable={false} style={firewallStyles.firewallStatValue}>
                {gameStats.powerUpsCollected}
              </Text>
            </View>

            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                🔥 Meilleur combo
              </Text>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallStatValue,
                  { color: colors.warning },
                ]}
              >
                x{gameStats.maxCombo}
              </Text>
            </View>

            <View style={firewallStyles.firewallStatRow}>
              <Text selectable={false} style={firewallStyles.firewallStatLabel}>
                ❤️ Vies restantes
              </Text>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallStatValue,
                  { color: colors.accent },
                ]}
              >
                {finalLives}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance message */}
        <View style={{ alignItems: "center", gap: 4 }}>
          {accuracy >= 80 && (
            <>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallPauseTitle,
                  typography.sectionTitle,
                  { fontSize: 18 },
                ]}
              >
                🌟 Excellent!
              </Text>
              <Text
                selectable={false}
                style={firewallStyles.firewallPauseSubtitle}
              >
                Vous êtes un expert en cybersécurité!
              </Text>
            </>
          )}
          {accuracy >= 60 && accuracy < 80 && (
            <>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallPauseTitle,
                  typography.sectionTitle,
                  { fontSize: 18 },
                ]}
              >
                👍 Très bien!
              </Text>
              <Text
                selectable={false}
                style={firewallStyles.firewallPauseSubtitle}
              >
                Continuez à améliorer vos compétences.
              </Text>
            </>
          )}
          {accuracy < 60 && (
            <>
              <Text
                selectable={false}
                style={[
                  firewallStyles.firewallPauseTitle,
                  typography.sectionTitle,
                  { fontSize: 18 },
                ]}
              >
                💪 À refaire!
              </Text>
              <Text
                selectable={false}
                style={firewallStyles.firewallPauseSubtitle}
              >
                Pratiquez pour renforcer vos défenses.
              </Text>
            </>
          )}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
          <Pressable
            style={[
              firewallStyles.firewallControlButton,
              { flex: 1, backgroundColor: colors.surfaceSoft },
            ]}
            onPress={onClose}
          >
            <Text selectable={false} style={firewallStyles.firewallControlText}>
              ✕ Fermer
            </Text>
          </Pressable>
          <Pressable
            style={[
              firewallStyles.firewallControlButton,
              firewallStyles.firewallControlPrimary,
              {
                flex: 1,
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
            ]}
            onPress={onRestart}
          >
            <Text
              selectable={false}
              style={firewallStyles.firewallControlTextPrimary}
            >
              🔄 Rejouer
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
