import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import {
  FIREWALL_BAD_HIT_SHIELD_LOSS,
  FIREWALL_FALL_MULTIPLIER,
  FIREWALL_MAX_SHIELD,
  buildRandomFirewallVisuals,
  clamp,
  createFirewallObjects,
  pickRandomFirewallKind,
  playFirewallCollisionSound,
  type FirewallMovingObject,
} from '../firewall/firewallGame';
import type { QuizDifficulty } from '../data/quizCatalogData';
import React from 'react';

type FirewallGameState = {
  firewallObjects: FirewallMovingObject[];
  firewallGameRunning: boolean;
  firewallGamePaused: boolean;
  firewallGamePoints: number;
  firewallGameLives: number;
  firewallGameShieldPct: number;
  firewallGameShieldCountdown: number;
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
  handleArenaLayout: (event: { nativeEvent: { layout: { width: number; height: number } } }) => void;
};

export function useFirewallAnimationLoop(
  difficulty: QuizDifficulty,
  isActive: boolean
): FirewallGameState & FirewallGameActions {
  const [firewallObjects, setFirewallObjects] = useState<FirewallMovingObject[]>([]);
  const [firewallGameRunning, setFirewallGameRunning] = useState(false);
  const [firewallGamePaused, setFirewallGamePaused] = useState(false);
  const [firewallGamePoints, setFirewallGamePoints] = useState(0);
  const [firewallGameLives, setFirewallGameLives] = useState(5);
  const [firewallGameShieldPct, setFirewallGameShieldPct] = useState(0);
  const [firewallGameShieldCountdown, setFirewallGameShieldCountdown] = useState(0);
  const [firewallChestX, setFirewallChestX] = useState(0);
  const [firewallArenaSize, setFirewallArenaSize] = useState({ width: 0, height: 0 });

  const firewallRafRef = useRef<number | null>(null);
  const firewallObjectIdRef = useRef(0);
  const firewallArenaRef = useRef<View>(null as any);
  const firewallArenaLeftRef = useRef(0);
  const firewallChestLeftRef = useRef(0);
  const firewallChestTopRef = useRef(0);
  const firewallShieldTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const firewallChestWidth = 120;
  const firewallChestHeight = 58;
  const firewallObjectSize = 56;

  const firewallChestLeft = clamp(firewallChestX, 12, Math.max(12, firewallArenaSize.width - firewallChestWidth - 12));
  const firewallChestTop = Math.max(0, firewallArenaSize.height - firewallChestHeight - 14);

  firewallChestLeftRef.current = firewallChestLeft;
  firewallChestTopRef.current = firewallChestTop;

  const respawnFirewallObject = useCallback(
    (object: FirewallMovingObject): FirewallMovingObject => {
      const nextKind = pickRandomFirewallKind();
      const { icon, label } = buildRandomFirewallVisuals(nextKind);
      const speedBase = difficulty === 'easy' ? 48 : difficulty === 'medium' ? 64 : 82;
      const driftMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.08 : 1.16;

      return {
        ...object,
        kind: nextKind,
        icon,
        label,
        speed: speedBase + Math.random() * 36,
        drift: (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 16) * driftMultiplier,
        x: Math.round(40 + Math.random() * Math.max(firewallArenaSize.width - 80, 80)),
        y: -90 - Math.round(Math.random() * 80),
      };
    },
    [difficulty, firewallArenaSize.width]
  );

  const registerFirewallCollision = useCallback((object: FirewallMovingObject) => {
    if (object.kind === 'bad') {
      setFirewallGameShieldPct((previousShield) => {
        if (previousShield > 0) {
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

    // Power-up collected: fill shield to 100% and start 10-second countdown
    if (object.kind === 'power') {
      setFirewallGameShieldPct(100);
      setFirewallGameShieldCountdown(10);

      // Clear any existing timer
      if (firewallShieldTimerRef.current !== null) {
        clearInterval(firewallShieldTimerRef.current);
      }

      // Start new countdown
      let remainingSeconds = 10;
      firewallShieldTimerRef.current = setInterval(() => {
        remainingSeconds -= 1;
        setFirewallGameShieldCountdown(remainingSeconds);

        if (remainingSeconds <= 0) {
          if (firewallShieldTimerRef.current !== null) {
            clearInterval(firewallShieldTimerRef.current);
            firewallShieldTimerRef.current = null;
          }
          setFirewallGameShieldPct(0);
        }
      }, 1000);
    }

    const pointsEarned = object.kind === 'power' ? 20 : 10;
    setFirewallGamePoints((previous) => previous + pointsEarned);
  }, []);

  const moveChest = useCallback(
    (delta: number) => {
      if (!isActive || firewallArenaSize.width <= 0) {
        return;
      }

      setFirewallChestX((previous) =>
        clamp(previous + delta, 12, Math.max(12, firewallArenaSize.width - firewallChestWidth - 12))
      );
    },
    [isActive, firewallArenaSize.width]
  );

  const setChestFromTouch = useCallback(
    (moveX: number) => {
      if (!isActive || firewallArenaSize.width <= 0) {
        return;
      }

      const nextX = moveX - firewallArenaLeftRef.current - firewallChestWidth / 2;
      setFirewallChestX(clamp(nextX, 12, Math.max(12, firewallArenaSize.width - firewallChestWidth - 12)));
    },
    [isActive, firewallArenaSize.width]
  );

  const startGame = useCallback(() => {
    setFirewallGameRunning(true);
    setFirewallGamePaused(false);
    setFirewallGamePoints(0);
    setFirewallGameLives(5);
    setFirewallGameShieldPct(0);
    setFirewallGameShieldCountdown(0);
    setFirewallChestX((previous) => previous || Math.max(12, Math.round((firewallArenaSize.width - firewallChestWidth) / 2)));
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
    setFirewallGameLives(5);
    setFirewallGameShieldPct(0);
    setFirewallGameShieldCountdown(0);
    setFirewallChestX(Math.max(12, Math.round((firewallArenaSize.width - firewallChestWidth) / 2)));

    if (firewallShieldTimerRef.current !== null) {
      clearInterval(firewallShieldTimerRef.current);
      firewallShieldTimerRef.current = null;
    }
  }, [firewallArenaSize.width]);

  const handleArenaLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width: arenaWidth, height: arenaHeight } = event.nativeEvent.layout;
      setFirewallArenaSize({ width: arenaWidth, height: arenaHeight });
      requestAnimationFrame(() => {
        firewallArenaRef.current?.measureInWindow((x) => {
          firewallArenaLeftRef.current = x;
        });
      });
    },
    []
  );

  // Initialize chest position when arena size changes
  useEffect(() => {
    if (!isActive || firewallArenaSize.width <= 0) {
      return;
    }

    setFirewallChestX((previous) => previous || Math.max(12, Math.round((firewallArenaSize.width - firewallChestWidth) / 2)));
  }, [firewallArenaSize.width, isActive]);

  // Start game when component becomes active
  useEffect(() => {
    if (!isActive) {
      return;
    }

    setFirewallGameRunning(true);
  }, [isActive]);

  // Animation loop
  useEffect(() => {
    if (!isActive || firewallGameRunning === false || firewallGamePaused || firewallArenaSize.width <= 0) {
      return;
    }

    if (firewallObjects.length === 0) {
      const created = createFirewallObjects(firewallArenaSize.width, firewallArenaSize.height, difficulty).map(
        (object) => ({
          ...object,
          id: ++firewallObjectIdRef.current,
        })
      );
      setFirewallObjects(created);
    }

    const fallMultiplier = FIREWALL_FALL_MULTIPLIER[difficulty];

    const step = () => {
      setFirewallObjects((previousObjects) => {
        const chestRect = {
          left: firewallChestLeftRef.current,
          right: firewallChestLeftRef.current + firewallChestWidth,
          top: firewallChestTopRef.current,
          bottom: firewallChestTopRef.current + firewallChestHeight,
        };

        const updated = previousObjects.map((object) => {
          const nextY = object.y + object.speed * 0.016 * fallMultiplier;
          const nextX = object.x + object.drift * 0.016;
          const bounceX = Math.max(24, Math.min(firewallArenaSize.width - 24, nextX));
          const objectRect = {
            left: Math.max(10, bounceX - firewallObjectSize / 2),
            right: Math.max(10, bounceX - firewallObjectSize / 2) + firewallObjectSize,
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

          if (nextY > firewallArenaSize.height + 40) {
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
  ]);

  // Cleanup shield timer on unmount
  useEffect(() => {
    return () => {
      if (firewallShieldTimerRef.current !== null) {
        clearInterval(firewallShieldTimerRef.current);
        firewallShieldTimerRef.current = null;
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
      setChestFromTouch(gestureState.moveX);
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_, gestureState) => {
      setChestFromTouch(gestureState.moveX);
    },
    onPanResponderTerminate: (_, gestureState) => {
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
