import type { LayoutChangeEvent, PanResponderInstance } from "react-native";
import { Pressable, Text, View } from "react-native";
import type { QuizDifficulty } from "../data/quizCatalogData";
import {
  FIREWALL_LEVEL_LABELS,
  type FirewallMovingObject,
  type FirewallPowerUpType,
} from "../firewall/firewallGame";
import type { FirewallGameStats } from "../hooks/useFirewallAnimationLoop";
import { firewallStyles } from "./FirewallDefenderStyles";

type FirewallInventoryItem = {
  key: string;
  icon: string;
  label: string;
  protectedCount: number;
  leakedCount: number;
};

type FirewallDefenderViewProps = {
  isCompactLayout: boolean;
  firewallScoreLabel: number;
  streak: number;
  firewallLivesLabel: number;
  firewallShieldPct: number;
  firewallShieldCountdown: number;
  timeLeft: number;
  selectedDifficulty: QuizDifficulty;
  firewallArenaRef: React.RefObject<View | null>;
  firewallChestPanResponder: PanResponderInstance;
  onArenaLayout: (event: LayoutChangeEvent) => void;
  firewallStars: Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
  }>;
  firewallPirateZone: { x: number; y: number; w: number; h: number };
  firewallObjects: FirewallMovingObject[];
  firewallChestLeft: number;
  firewallTouchpadVisible: boolean;
  onMoveFirewallChest: (delta: number) => void;
  onStartFirewallGame: () => void;
  onToggleFirewallPause: () => void;
  onResetFirewallGame: () => void;
  firewallGamePaused: boolean;
  firewallGameRunning: boolean;
  firewallInventory: FirewallInventoryItem[];
  // New props for improvements
  firewallCombo?: number;
  firewallComboMultiplier?: number;
  firewallActiveEffect?: {
    type: FirewallPowerUpType;
    remainingTime: number;
  } | null;
  firewallGameStats?: FirewallGameStats;
  showPirate?: boolean;
};

export function FirewallDefenderView({
  isCompactLayout,
  firewallScoreLabel,
  streak,
  firewallLivesLabel,
  firewallShieldPct,
  firewallShieldCountdown,
  timeLeft,
  selectedDifficulty,
  firewallArenaRef,
  firewallChestPanResponder,
  onArenaLayout,
  firewallStars,
  firewallPirateZone,
  firewallObjects,
  firewallChestLeft,
  onMoveFirewallChest,
  onStartFirewallGame,
  onToggleFirewallPause,
  onResetFirewallGame,
  firewallGamePaused,
  firewallGameRunning,
  firewallCombo = 0,
  firewallComboMultiplier = 1,
  firewallActiveEffect = null,
  firewallGameStats,
  showPirate = true,
}: FirewallDefenderViewProps) {
  return (
    <View
      style={[
        firewallStyles.firewallBoard,
        isCompactLayout && firewallStyles.firewallBoardStacked,
      ]}
    >
      <View style={firewallStyles.firewallMainPanel}>
        <View
          style={[
            firewallStyles.firewallTopbar,
            isCompactLayout && firewallStyles.firewallTopbarCompact,
          ]}
        >
          <View
            style={[
              firewallStyles.firewallStatsRow,
              isCompactLayout && firewallStyles.firewallStatsRowCompact,
            ]}
          >
            <Text selectable={false} style={firewallStyles.firewallStat}>
              🏆 Score : {firewallScoreLabel}
            </Text>
            <Text selectable={false} style={firewallStyles.firewallStat}>
              🔥 Série : {streak}
            </Text>
            <Text selectable={false} style={firewallStyles.firewallStat}>
              ❤️ Vies : {firewallLivesLabel}
            </Text>
            <View style={firewallStyles.firewallShieldWrap}>
              <Text selectable={false} style={firewallStyles.firewallStat}>
                🛡️ Bouclier :
              </Text>
              <View style={firewallStyles.firewallShieldTrack}>
                <View
                  style={[
                    firewallStyles.firewallShieldFill,
                    { width: `${firewallShieldPct}%` },
                  ]}
                />
              </View>
              <Text
                selectable={false}
                style={firewallStyles.firewallShieldText}
              >
                {firewallShieldCountdown > 0
                  ? `${firewallShieldCountdown}s`
                  : `${firewallShieldPct}%`}
              </Text>
            </View>
            <Text selectable={false} style={firewallStyles.firewallStat}>
              ⏱️ Temps : {timeLeft}s
            </Text>
            <Text selectable={false} style={firewallStyles.firewallStat}>
              🏅 Difficulté : {FIREWALL_LEVEL_LABELS[selectedDifficulty]}
            </Text>
          </View>
          <View
            style={[
              firewallStyles.firewallActionsRow,
              isCompactLayout && firewallStyles.firewallActionsRowCompact,
            ]}
          >
            <Pressable
              style={[
                firewallStyles.firewallControlButton,
                firewallStyles.firewallControlPrimary,
              ]}
              onPress={onStartFirewallGame}
            >
              <Text
                selectable={false}
                style={firewallStyles.firewallControlTextPrimary}
              >
                ▶ Jouer
              </Text>
            </Pressable>
            <Pressable
              style={firewallStyles.firewallControlButton}
              onPress={onToggleFirewallPause}
            >
              <Text
                selectable={false}
                style={firewallStyles.firewallControlText}
              >
                {firewallGamePaused ? "▶ Reprendre" : "⏸ Pause"}
              </Text>
            </Pressable>
            <Pressable
              style={firewallStyles.firewallControlButton}
              onPress={onResetFirewallGame}
            >
              <Text
                selectable={false}
                style={firewallStyles.firewallControlText}
              >
                🔁 Recommencer
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          ref={firewallArenaRef}
          style={firewallStyles.firewallArena}
          {...firewallChestPanResponder.panHandlers}
          onLayout={onArenaLayout}
        >
          <View style={firewallStyles.firewallArenaGlow} />

          {/* Combo display */}
          {firewallCombo > 0 && firewallGameRunning && (
            <View style={firewallStyles.firewallComboDisplay}>
              <Text
                selectable={false}
                style={firewallStyles.firewallComboNumber}
              >
                {firewallCombo}
              </Text>
              <Text
                selectable={false}
                style={firewallStyles.firewallComboLabel}
              >
                Combo!
              </Text>
              {firewallComboMultiplier > 1 && (
                <Text
                  selectable={false}
                  style={firewallStyles.firewallMultiplierBadge}
                >
                  x{firewallComboMultiplier.toFixed(1)}
                </Text>
              )}
            </View>
          )}

          {/* Active effect display */}
          {firewallActiveEffect && firewallGameRunning && (
            <View style={firewallStyles.firewallActiveEffectBox}>
              <Text
                selectable={false}
                style={firewallStyles.firewallEffectLabel}
              >
                {firewallActiveEffect.type === "slowmo" && "🐢 Ralenti"}
                {firewallActiveEffect.type === "magnet" && "🧲 Aimant"}
                {firewallActiveEffect.type === "shield" && "🛡️ Protégé"}
              </Text>
              <Text
                selectable={false}
                style={firewallStyles.firewallEffectTime}
              >
                {firewallActiveEffect.remainingTime}s
              </Text>
            </View>
          )}

          {firewallStars.map((star) => (
            <View
              key={star.id}
              style={[
                firewallStyles.firewallStar,
                {
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}

          {/* Pirate Zone - Hidden after 5 seconds */}
          {showPirate && (
            <View
              style={[
                firewallStyles.firewallPirateCard,
                {
                  left: firewallPirateZone.x,
                  top: firewallPirateZone.y,
                  width: firewallPirateZone.w,
                  minHeight: firewallPirateZone.h,
                  opacity: 1,
                },
              ]}
            >
              <Text
                selectable={false}
                style={firewallStyles.firewallPirateTitle}
              >
                👾 Pirate
              </Text>
              <Text
                selectable={false}
                style={firewallStyles.firewallPirateText}
              >
                Récupère les données qui tombent ici !
              </Text>
            </View>
          )}

          <View style={firewallStyles.firewallSafeMarker} />

          {firewallObjects.map((object) => (
            <View
              key={object.id}
              style={[
                firewallStyles.firewallBubble,
                object.kind === "bad"
                  ? firewallStyles.firewallThreatBubble
                  : object.kind === "power"
                    ? firewallStyles.firewallPowerBubble
                    : firewallStyles.firewallDataBubble,
                {
                  left: Math.max(10, object.x - 28),
                  top: Math.max(10, object.y),
                },
              ]}
            >
              <Text
                selectable={false}
                style={firewallStyles.firewallBubbleIcon}
              >
                {object.icon}
              </Text>
            </View>
          ))}

          <View
            style={[
              firewallStyles.firewallCoffreCard,
              { left: firewallChestLeft },
            ]}
          >
            <Text selectable={false} style={firewallStyles.firewallCoffreTitle}>
              🔒 Coffre
            </Text>
            <Text selectable={false} style={firewallStyles.firewallCoffreHint}>
              Déplace-moi
            </Text>
          </View>

          {/* Pause overlay */}
          {firewallGamePaused && (
            <View style={firewallStyles.firewallPauseOverlay}>
              <View style={firewallStyles.firewallPauseModal}>
                <Text
                  selectable={false}
                  style={firewallStyles.firewallPauseTitle}
                >
                  ⏸ Pause
                </Text>
                <Text
                  selectable={false}
                  style={firewallStyles.firewallPauseSubtitle}
                >
                  Jeu en attente
                </Text>
                {firewallGameStats && (
                  <View style={{ gap: 8, width: "100%", alignItems: "center" }}>
                    <View style={firewallStyles.firewallStatRow}>
                      <Text
                        selectable={false}
                        style={firewallStyles.firewallStatLabel}
                      >
                        Score:
                      </Text>
                      <Text
                        selectable={false}
                        style={firewallStyles.firewallStatValue}
                      >
                        {firewallScoreLabel}
                      </Text>
                    </View>
                    <View style={firewallStyles.firewallStatRow}>
                      <Text
                        selectable={false}
                        style={firewallStyles.firewallStatLabel}
                      >
                        Accuracy:
                      </Text>
                      <Text
                        selectable={false}
                        style={firewallStyles.firewallStatValue}
                      >
                        {firewallGameStats.accuracy}%
                      </Text>
                    </View>
                  </View>
                )}
                <Pressable
                  style={[
                    firewallStyles.firewallControlButton,
                    firewallStyles.firewallControlPrimary,
                    { marginTop: 12, paddingHorizontal: 32 },
                  ]}
                  onPress={onToggleFirewallPause}
                >
                  <Text
                    selectable={false}
                    style={firewallStyles.firewallControlTextPrimary}
                  >
                    ▶ Reprendre
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
