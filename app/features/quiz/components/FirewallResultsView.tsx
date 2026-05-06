import { Pressable, Text, View } from "react-native";
import type { FirewallGameStats } from "../hooks/useFirewallAnimationLoop";
import { firewallStyles } from "./FirewallDefenderStyles";

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
  if (!isVisible) {
    return null;
  }

  const accuracy = gameStats.accuracy || 0;
  const successColor =
    accuracy >= 70 ? "#10b981" : accuracy >= 50 ? "#f59e0b" : "#ef4444";

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
              style={[firewallStyles.firewallStatsTitle, { fontSize: 24 }]}
            >
              🏆 Score
            </Text>
            <Text
              selectable={false}
              style={[
                firewallStyles.firewallStatValue,
                { fontSize: 32, color: "#3b82f6" },
              ]}
            >
              {finalScore}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{ height: 1, backgroundColor: "#e5e7eb", width: "100%" }}
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
                style={[firewallStyles.firewallStatValue, { color: "#ef4444" }]}
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
                style={[firewallStyles.firewallStatValue, { color: "#fbbf24" }]}
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
                style={[firewallStyles.firewallStatValue, { color: "#ec4899" }]}
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
                style={[firewallStyles.firewallPauseTitle, { fontSize: 18 }]}
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
                style={[firewallStyles.firewallPauseTitle, { fontSize: 18 }]}
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
                style={[firewallStyles.firewallPauseTitle, { fontSize: 18 }]}
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
              { flex: 1, backgroundColor: "#f3f4f6" },
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
              { flex: 1 },
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
