import { Pressable, Text, View } from 'react-native';
import type { LayoutChangeEvent, PanResponderInstance } from 'react-native';
import type { QuizDifficulty } from '../data/quizCatalogData';
import { FIREWALL_LEVEL_LABELS, type FirewallMovingObject } from '../firewall/firewallGame';
import { firewallStyles } from './FirewallDefenderView.styles';

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
  firewallStars: Array<{ id: number; x: number; y: number; size: number; opacity: number }>;
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
  firewallTouchpadVisible,
  onMoveFirewallChest,
  onStartFirewallGame,
  onToggleFirewallPause,
  onResetFirewallGame,
  firewallGamePaused,
  firewallGameRunning,
  firewallInventory,
}: FirewallDefenderViewProps) {
  return (
    <View style={[firewallStyles.firewallBoard, isCompactLayout && firewallStyles.firewallBoardStacked]}>
      <View style={firewallStyles.firewallMainPanel}>
        <View style={firewallStyles.firewallTopbar}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', flex: 1 }}>
            <Text selectable={false} style={firewallStyles.firewallStat}>🏆 Score : {firewallScoreLabel}</Text>
            <Text selectable={false} style={firewallStyles.firewallStat}>🔥 Série : {streak}</Text>
            <Text selectable={false} style={firewallStyles.firewallStat}>❤️ Vies : {firewallLivesLabel}</Text>
            <View style={firewallStyles.firewallShieldWrap}>
              <Text selectable={false} style={firewallStyles.firewallStat}>🛡️ Bouclier :</Text>
              <View style={firewallStyles.firewallShieldTrack}>
                <View style={[firewallStyles.firewallShieldFill, { width: `${firewallShieldPct}%` }]} />
              </View>
              <Text selectable={false} style={firewallStyles.firewallShieldText}>
                {firewallShieldCountdown > 0 ? `${firewallShieldCountdown}s` : `${firewallShieldPct}%`}
              </Text>
            </View>
            <Text selectable={false} style={firewallStyles.firewallStat}>⏱️ Temps : {timeLeft}s</Text>
            <Text selectable={false} style={firewallStyles.firewallStat}>🏅 Difficulté : {FIREWALL_LEVEL_LABELS[selectedDifficulty]}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={[firewallStyles.firewallControlButton, firewallStyles.firewallControlPrimary]} onPress={onStartFirewallGame}>
              <Text selectable={false} style={firewallStyles.firewallControlTextPrimary}>▶ Jouer</Text>
            </Pressable>
            <Pressable style={firewallStyles.firewallControlButton} onPress={onToggleFirewallPause}>
              <Text selectable={false} style={firewallStyles.firewallControlText}>{firewallGamePaused ? '▶ Reprendre' : '⏸ Pause'}</Text>
            </Pressable>
            <Pressable style={firewallStyles.firewallControlButton} onPress={onResetFirewallGame}>
              <Text selectable={false} style={firewallStyles.firewallControlText}>🔁 Recommencer</Text>
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

          <View
            style={[
              firewallStyles.firewallPirateCard,
              {
                left: firewallPirateZone.x,
                top: firewallPirateZone.y,
                width: firewallPirateZone.w,
                minHeight: firewallPirateZone.h,
              },
            ]}
          >
            <Text selectable={false} style={firewallStyles.firewallPirateTitle}>👾 Pirate</Text>
            <Text selectable={false} style={firewallStyles.firewallPirateText}>Récupère les données qui tombent ici !</Text>
          </View>

          <View style={firewallStyles.firewallSafeMarker} />

          {firewallObjects.map((object) => (
            <View
              key={object.id}
              style={[
                firewallStyles.firewallBubble,
                object.kind === 'bad'
                  ? firewallStyles.firewallThreatBubble
                  : object.kind === 'power'
                    ? firewallStyles.firewallPowerBubble
                    : firewallStyles.firewallDataBubble,
                {
                  left: Math.max(10, object.x - 28),
                  top: Math.max(10, object.y),
                },
              ]}
            >
              <Text selectable={false} style={firewallStyles.firewallBubbleIcon}>{object.icon}</Text>
            </View>
          ))}

          <View style={[firewallStyles.firewallCoffreCard, { left: firewallChestLeft }]}>
            <Text selectable={false} style={firewallStyles.firewallCoffreTitle}>🔒 Coffre</Text>
            <Text selectable={false} style={firewallStyles.firewallCoffreHint}>Déplace-moi</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
