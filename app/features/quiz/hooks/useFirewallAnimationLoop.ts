import React, { useCallback, useEffect, useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import type { QuizDifficulty } from "../data/quizCatalogData";
import {
  FIREWALL_BAD_HIT_SHIELD_LOSS,
  FIREWALL_COMBO_THRESHOLD,
  FIREWALL_FALL_MULTIPLIER,
  FIREWALL_INITIAL_LIVES,
  FIREWALL_MAX_SHIELD,
  FIREWALL_POWER_UP_EFFECTS,
  buildRandomFirewallVisuals,
  clamp,
  createFirewallObjects,
  pickRandomFirewallKind,
  playFirewallCollisionSound,
  type FirewallMovingObject,
  type FirewallPowerUpType,
} from "../firewall/firewallGame";

export type FirewallGameStats = {
  totalCaught: number;
  totalLeaked: number;
  dataCaught: number;
  threatBlocked: number;
  powerUpsCollected: number;
  maxCombo: number;
  accuracy: number;
};

type FirewallGameState = {
  firewallObjects: FirewallMovingObject[];
  firewallGameRunning: boolean;
  firewallGamePaused: boolean;
  firewallGamePoints: number;
  firewallGameLives: number;
  firewallGameShieldPct: number;
  firewallGameShieldCountdown: number;
  firewallCombo: number;
  firewallComboMultiplier: number;
  firewallActiveEffect: {
    type: FirewallPowerUpType;
    remainingTime: number;
  } | null;
  firewallGameStats: FirewallGameStats;
  firewallChestX: number;
  firewallArenaSize: { width: number; height: number };
  firewallChestPanResponder: any;
  firewallArenaRef: React.RefObject<View>;
};

type FirewallGameActions = {
  moveChest: (delta: number) => void;
  setChestFromTouch: (moveX: number) => void;
  startGame: () => void;
  togglePause: () => void;
  resetGame: () => void;
  handleArenaLayout: (event: {
    nativeEvent: { layout: { width: number; height: number } };
  }) => void;
};

export function useFirewallAnimationLoop(
  difficulty: QuizDifficulty,
  isActive: boolean,
): FirewallGameState & FirewallGameActions {
  const [firewallObjects, setFirewallObjects] = useState<
    FirewallMovingObject[]
  >([]);
  const [firewallGameRunning, setFirewallGameRunning] = useState(false);
  const [firewallGamePaused, setFirewallGamePaused] = useState(false);
  const [firewallGamePoints, setFirewallGamePoints] = useState(0);
  const [firewallGameLives, setFirewallGameLives] = useState(
    FIREWALL_INITIAL_LIVES,
  );
  const [firewallGameShieldPct, setFirewallGameShieldPct] = useState(0);
  const [firewallGameShieldCountdown, setFirewallGameShieldCountdown] =
    useState(0);
  const [firewallCombo, setFirewallCombo] = useState(0);
  const [firewallComboMultiplier, setFirewallComboMultiplier] = useState(1);
  const [firewallActiveEffect, setFirewallActiveEffect] = useState<{
    type: FirewallPowerUpType;
    remainingTime: number;
  } | null>(null);
  const [firewallGameStats, setFirewallGameStats] = useState<FirewallGameStats>(
    {
      totalCaught: 0,
      totalLeaked: 0,
      dataCaught: 0,
      threatBlocked: 0,
      powerUpsCollected: 0,
      maxCombo: 0,
      accuracy: 0,
    },
  );
  const [firewallChestX, setFirewallChestX] = useState(0);
  const [firewallArenaSize, setFirewallArenaSize] = useState({
    width: 0,
    height: 0,
  });

  const firewallRafRef = useRef<number | null>(null);
  const firewallObjectIdRef = useRef(0);
  const firewallArenaRef = useRef<View>(null as any);
  const firewallArenaLeftRef = useRef(0);
  const firewallChestLeftRef = useRef(0);
  const firewallChestTopRef = useRef(0);
  const firewallChestInitializedRef = useRef(false);
  const firewallShieldTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const firewallEffectTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const firewallChestWidth = 120;
  const firewallChestHeight = 58;
  const firewallObjectSize = 56;

  const firewallChestLeft = clamp(
    firewallChestX,
    12,
    Math.max(12, firewallArenaSize.width - firewallChestWidth - 12),
  );
  const firewallChestTop = Math.max(
    0,
    firewallArenaSize.height - firewallChestHeight - 14,
  );

  firewallChestLeftRef.current = firewallChestLeft;
  firewallChestTopRef.current = firewallChestTop;

  const respawnFirewallObject = useCallback(
    (object: FirewallMovingObject): FirewallMovingObject => {
      const nextKind = pickRandomFirewallKind();
      const { icon, label } = buildRandomFirewallVisuals(nextKind);
      const speedBase =
        difficulty === "easy" ? 48 : difficulty === "medium" ? 64 : 82;
      const driftMultiplier =
        difficulty === "easy" ? 1 : difficulty === "medium" ? 1.08 : 1.16;

      return {
        ...object,
        kind: nextKind,
        icon,
        label,
        speed: speedBase + Math.random() * 36,
        drift:
          (Math.random() < 0.5 ? -1 : 1) *
          (10 + Math.random() * 16) *
          driftMultiplier,
        x: Math.round(
          40 + Math.random() * Math.max(firewallArenaSize.width - 80, 80),
        ),
        y: -90 - Math.round(Math.random() * 80),
      };
    },
    [difficulty, firewallArenaSize.width],
  );

  const registerFirewallCollision = useCallback(
    (object: FirewallMovingObject) => {
      if (object.kind === "bad") {
        setFirewallCombo(0); // Reset combo on threat hit
        setFirewallComboMultiplier(1);

        setFirewallGameShieldPct((previousShield) => {
          if (previousShield > 0) {
            setFirewallGameStats((prev) => ({
              ...prev,
              threatBlocked: prev.threatBlocked + 1,
            }));
            return Math.max(0, previousShield - FIREWALL_BAD_HIT_SHIELD_LOSS);
          }

          setFirewallGameLives((previousLives) => {
            const nextLives = Math.max(0, previousLives - 1);
            if (nextLives === 0) {
              setFirewallGameRunning(false);
              setFirewallGamePaused(true);
            }
            return nextLives;
          });

          return 0;
        });
        return;
      }

      // Data collected - increase combo
      if (object.kind === "data") {
        setFirewallCombo((prev) => {
          const newCombo = prev + 1;
          const newMultiplier =
            1 + Math.floor(newCombo / FIREWALL_COMBO_THRESHOLD) * 0.5;
          setFirewallComboMultiplier(Math.min(newMultiplier, 3)); // Cap at 3x

          // Update max combo stat
          setFirewallGameStats((prevStats) => ({
            ...prevStats,
            dataCaught: prevStats.dataCaught + 1,
            totalCaught: prevStats.totalCaught + 1,
            maxCombo: Math.max(prevStats.maxCombo, newCombo),
          }));

          // Play combo sound at milestones
          if (newCombo % FIREWALL_COMBO_THRESHOLD === 0) {
            void playFirewallCollisionSound("combo");
          }

          return newCombo;
        });

        const basePoints = 10;
        const multipliedPoints = Math.round(
          basePoints * firewallComboMultiplier,
        );
        setFirewallGamePoints((previous) => previous + multipliedPoints);
        return;
      }

      // Power-up collected - apply effect
      if (object.kind === "power" && object.powerUpType) {
        setFirewallGameStats((prev) => ({
          ...prev,
          powerUpsCollected: prev.powerUpsCollected + 1,
        }));

        const powerUpType = object.powerUpType;
        const effect = FIREWALL_POWER_UP_EFFECTS[powerUpType];

        switch (powerUpType) {
          case "shield":
            setFirewallGameShieldPct((prev) =>
              Math.min(prev + 30, FIREWALL_MAX_SHIELD),
            );
            setFirewallGameShieldCountdown(effect.duration);
            break;

          case "slowmo":
            setFirewallActiveEffect({
              type: "slowmo",
              remainingTime: effect.duration,
            });
            // Slow-mo is handled in animation loop
            break;

          case "magnet":
            setFirewallActiveEffect({
              type: "magnet",
              remainingTime: effect.duration,
            });
            // Magnet is handled in animation loop
            break;

          case "lifeSteal":
            setFirewallGameLives((prev) => prev + 1);
            break;
        }

        const powerUpPoints = 20;
        const multipliedPoints = Math.round(
          powerUpPoints * firewallComboMultiplier,
        );
        setFirewallGamePoints((previous) => previous + multipliedPoints);
      }
    },
    [firewallComboMultiplier],
  );

  const moveChest = useCallback(
    (delta: number) => {
      if (!isActive || firewallArenaSize.width <= 0) {
        return;
      }

      setFirewallChestX((previous) =>
        clamp(
          previous + delta,
          12,
          Math.max(12, firewallArenaSize.width - firewallChestWidth - 12),
        ),
      );
    },
    [isActive, firewallArenaSize.width],
  );

  const setChestFromTouch = useCallback(
    (moveX: number) => {
      if (!isActive || firewallArenaSize.width <= 0) {
        return;
      }

      // Improved sensitivity: Calculate chest position from touch with higher responsiveness
      const nextX =
        moveX - firewallArenaLeftRef.current - firewallChestWidth / 2;
      setFirewallChestX(
        clamp(
          nextX,
          12,
          Math.max(12, firewallArenaSize.width - firewallChestWidth - 12),
        ),
      );
    },
    [isActive, firewallArenaSize.width],
  );

  const startGame = useCallback(() => {
    setFirewallGameRunning(true);
    setFirewallGamePaused(false);
    setFirewallGamePoints(0);
    setFirewallGameLives(FIREWALL_INITIAL_LIVES);
    setFirewallGameShieldPct(0);
    setFirewallGameShieldCountdown(0);
    setFirewallCombo(0);
    setFirewallComboMultiplier(1);
    setFirewallActiveEffect(null);
    setFirewallGameStats({
      totalCaught: 0,
      totalLeaked: 0,
      dataCaught: 0,
      threatBlocked: 0,
      powerUpsCollected: 0,
      maxCombo: 0,
      accuracy: 0,
    });
    // Keep chest position during game restart (only set if not initialized)
    if (!firewallChestInitializedRef.current && firewallArenaSize.width > 0) {
      setFirewallChestX(
        Math.max(
          12,
          Math.round((firewallArenaSize.width - firewallChestWidth) / 2),
        ),
      );
      firewallChestInitializedRef.current = true;
    }
  }, [firewallArenaSize.width]);

  const togglePause = useCallback(() => {
    if (!firewallGameRunning) {
      return;
    }

    setFirewallGamePaused((prev) => !prev);
  }, [firewallGameRunning]);

  const resetGame = useCallback(() => {
    setFirewallObjects([]);
    setFirewallGameRunning(false);
    setFirewallGamePaused(false);
    setFirewallGamePoints(0);
    setFirewallGameLives(FIREWALL_INITIAL_LIVES);
    setFirewallGameShieldPct(0);
    setFirewallGameShieldCountdown(0);
    setFirewallCombo(0);
    setFirewallComboMultiplier(1);
    setFirewallActiveEffect(null);
    setFirewallGameStats({
      totalCaught: 0,
      totalLeaked: 0,
      dataCaught: 0,
      threatBlocked: 0,
      powerUpsCollected: 0,
      maxCombo: 0,
      accuracy: 0,
    });
    setFirewallChestX(
      Math.max(
        12,
        Math.round((firewallArenaSize.width - firewallChestWidth) / 2),
      ),
    );
    firewallChestInitializedRef.current = false;

    if (firewallShieldTimerRef.current !== null) {
      clearInterval(firewallShieldTimerRef.current);
      firewallShieldTimerRef.current = null;
    }

    if (firewallEffectTimerRef.current !== null) {
      clearInterval(firewallEffectTimerRef.current);
      firewallEffectTimerRef.current = null;
    }
  }, [firewallArenaSize.width]);

  const handleArenaLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width: arenaWidth, height: arenaHeight } =
        event.nativeEvent.layout;
      setFirewallArenaSize({ width: arenaWidth, height: arenaHeight });
      requestAnimationFrame(() => {
        firewallArenaRef.current?.measureInWindow((x) => {
          firewallArenaLeftRef.current = x;
        });
      });
    },
    [],
  );

  // Initialize chest position only once when arena size is set
  useEffect(() => {
    if (
      !isActive ||
      firewallArenaSize.width <= 0 ||
      firewallChestInitializedRef.current
    ) {
      return;
    }

    // Only initialize once
    firewallChestInitializedRef.current = true;
    setFirewallChestX(
      Math.max(
        12,
        Math.round((firewallArenaSize.width - firewallChestWidth) / 2),
      ),
    );
  }, [firewallArenaSize.width, isActive]);

  // Start game when component becomes active
  useEffect(() => {
    if (!isActive) {
      return;
    }

    setFirewallGameRunning(true);
  }, [isActive]);

  // Animation loop with progressive difficulty and effects
  useEffect(() => {
    if (
      !isActive ||
      firewallGameRunning === false ||
      firewallGamePaused ||
      firewallArenaSize.width <= 0
    ) {
      return;
    }

    if (firewallObjects.length === 0) {
      const created = createFirewallObjects(
        firewallArenaSize.width,
        firewallArenaSize.height,
        difficulty,
      ).map((object) => ({
        ...object,
        id: ++firewallObjectIdRef.current,
      }));
      setFirewallObjects(created);
    }

    // Progressive difficulty: increase speed based on caught objects
    let baseFallMultiplier = FIREWALL_FALL_MULTIPLIER[difficulty];
    const progressionBoost = 1 + firewallGameStats.totalCaught * 0.02; // +2% per caught object
    const fallMultiplier = baseFallMultiplier * progressionBoost;

    // Apply slowmo effect if active
    const effectMultiplier = firewallActiveEffect?.type === "slowmo" ? 0.5 : 1;

    const step = () => {
      setFirewallObjects((previousObjects) => {
        const chestRect = {
          left: firewallChestLeftRef.current,
          right: firewallChestLeftRef.current + firewallChestWidth,
          top: firewallChestTopRef.current,
          bottom: firewallChestTopRef.current + firewallChestHeight,
        };

        const updated = previousObjects.map((object) => {
          let nextY =
            object.y + object.speed * 0.016 * fallMultiplier * effectMultiplier;
          let nextX = object.x + object.drift * 0.016;

          // Apply magnet effect - pull data towards chest
          if (
            firewallActiveEffect?.type === "magnet" &&
            object.kind === "data"
          ) {
            const magnetStrength = 0.15;
            const chestCenterX = chestRect.left + firewallChestWidth / 2;
            const dx = chestCenterX - nextX;
            nextX += dx * magnetStrength;
          }

          const bounceX = Math.max(
            24,
            Math.min(firewallArenaSize.width - 24, nextX),
          );
          const objectRect = {
            left: Math.max(10, bounceX - firewallObjectSize / 2),
            right:
              Math.max(10, bounceX - firewallObjectSize / 2) +
              firewallObjectSize,
            top: Math.max(10, nextY),
            bottom: Math.max(10, nextY) + firewallObjectSize,
          };

          const isCollidingWithChest =
            objectRect.left < chestRect.right &&
            objectRect.right > chestRect.left &&
            objectRect.top < chestRect.bottom &&
            objectRect.bottom > chestRect.top;

          if (isCollidingWithChest) {
            void playFirewallCollisionSound(object.kind);
            registerFirewallCollision(object);
            return respawnFirewallObject(object);
          }

          // Track leaked objects (missed data)
          if (nextY > firewallArenaSize.height + 40) {
            if (object.kind === "data") {
              setFirewallGameStats((prev) => ({
                ...prev,
                totalLeaked: prev.totalLeaked + 1,
                totalCaught: prev.totalCaught + 1, // Count for accuracy
              }));
            }
            return {
              ...object,
              ...respawnFirewallObject(object),
            };
          }

          return {
            ...object,
            x: bounceX,
            y: nextY,
          };
        });

        return updated;
      });

      firewallRafRef.current = requestAnimationFrame(step);
    };

    firewallRafRef.current = requestAnimationFrame(step);

    return () => {
      if (firewallRafRef.current !== null) {
        cancelAnimationFrame(firewallRafRef.current);
        firewallRafRef.current = null;
      }
    };
  }, [
    firewallArenaSize.height,
    firewallArenaSize.width,
    firewallGamePaused,
    firewallGameRunning,
    isActive,
    difficulty,
    registerFirewallCollision,
    respawnFirewallObject,
    firewallActiveEffect,
    firewallGameStats.totalCaught,
  ]);

  // Effect timer management
  useEffect(() => {
    if (!firewallActiveEffect || firewallActiveEffect.type === "lifeSteal") {
      return;
    }

    if (firewallEffectTimerRef.current !== null) {
      clearInterval(firewallEffectTimerRef.current);
    }

    let remainingTime = firewallActiveEffect.remainingTime;
    firewallEffectTimerRef.current = setInterval(() => {
      remainingTime -= 1;

      setFirewallActiveEffect((prev) => {
        if (!prev || remainingTime <= 0) {
          return null;
        }
        return { ...prev, remainingTime };
      });

      if (remainingTime <= 0 && firewallEffectTimerRef.current !== null) {
        clearInterval(firewallEffectTimerRef.current);
        firewallEffectTimerRef.current = null;
      }
    }, 1000);

    return () => {
      if (firewallEffectTimerRef.current !== null) {
        clearInterval(firewallEffectTimerRef.current);
        firewallEffectTimerRef.current = null;
      }
    };
  }, [firewallActiveEffect]);

  // Calculate accuracy
  useEffect(() => {
    if (firewallGameStats.totalCaught === 0) {
      return;
    }

    const accuracy = Math.round(
      ((firewallGameStats.totalCaught - firewallGameStats.totalLeaked) /
        firewallGameStats.totalCaught) *
        100,
    );
    setFirewallGameStats((prev) => ({ ...prev, accuracy }));
  }, [firewallGameStats.totalCaught, firewallGameStats.totalLeaked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (firewallShieldTimerRef.current !== null) {
        clearInterval(firewallShieldTimerRef.current);
        firewallShieldTimerRef.current = null;
      }
      if (firewallEffectTimerRef.current !== null) {
        clearInterval(firewallEffectTimerRef.current);
        firewallEffectTimerRef.current = null;
      }
    };
  }, []);

  const firewallChestPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isActive,
    onMoveShouldSetPanResponder: () => isActive,
    onPanResponderGrant: (event) => {
      setChestFromTouch(event.nativeEvent.pageX);
    },
    onPanResponderMove: (_, gestureState) => {
      // Improved fluidity: More responsive to touch movement
      setChestFromTouch(gestureState.moveX);
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_, gestureState) => {
      // Final position after release
      setChestFromTouch(gestureState.moveX);
    },
    onPanResponderTerminate: (_, gestureState) => {
      // Handle forced termination
      setChestFromTouch(gestureState.moveX);
    },
  });

  return {
    firewallObjects,
    firewallGameRunning,
    firewallGamePaused,
    firewallGamePoints,
    firewallGameLives,
    firewallGameShieldPct,
    firewallGameShieldCountdown,
    firewallCombo,
    firewallComboMultiplier,
    firewallActiveEffect,
    firewallGameStats,
    firewallChestX,
    firewallArenaRef,
    firewallArenaSize,
    firewallChestPanResponder,
    moveChest,
    setChestFromTouch,
    startGame,
    togglePause,
    resetGame,
    handleArenaLayout,
  };
}
