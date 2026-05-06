import { ColorValue } from "react-native";
import type { ThemeMode } from "../lib/settings";

export type AppThemeColors = {
  errorContainer: ColorValue | undefined;
  success: ColorValue | undefined;
  successContainer: ColorValue | undefined;
  accentContainer: ColorValue | undefined;
  onWarningContainer: any;
  warningContainer: any;
  background: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  warning: string;
  border: string;
  development: string;
  error: string;
  moduleCardActiveBg: string;
  quizLockHint: string;
  quizItemLockedBorder: string;
  quizItemLockedBg: string;
  quizItemCompletedBorder: string;
  quizItemCompletedBg: string;
  quizLockedBadgeBorder: string;
  quizLockedBadgeText: string;
  quizLockedBadgeBg: string;
  quizButtonLockedBg: string;
  quizButtonLockedBorder: string;
  quizButtonCompletedBg: string;
  quizButtonCompletedBorder: string;
  quizButtonCompletedText: string;
  quizButtonLockedText: string;
};

export const lightColors: AppThemeColors = {
  background: "#ffffff",
  surface: "#f5f5f5",
  surfaceSoft: "#dde3ee",
  text: "#02153b",
  textSecondary: "#0d1d41cf",
  textMuted: "#0b3275c5",
  accent: "#4F8CFF",
  warning: "#F59E0B",
  border: "#6f94d3",
  development: "#F59E0B",
  error: "#FCA5A5",
  moduleCardActiveBg: "#9fc1f4",
  quizLockHint: "#F59E0B",
  quizItemLockedBorder: "#35506F",
  quizItemLockedBg: "#dde3ee",
  quizItemCompletedBorder: "#34D399",
  quizItemCompletedBg: "#dde3ee",
  quizLockedBadgeBorder: "#9fc1f4",
  quizLockedBadgeText: "#02153b",
  quizLockedBadgeBg: "#9fc1f4",
  quizButtonLockedBg: "#9fc1f4",
  quizButtonLockedBorder: "#486686",
  quizButtonCompletedBg: "#1D4B3D",
  quizButtonCompletedBorder: "#34D399",
  quizButtonCompletedText: "#02153b",
  quizButtonLockedText: "#02153b",
  onWarningContainer: undefined,
  warningContainer: undefined,
  errorContainer: undefined,
  success: undefined,
  successContainer: undefined,
  accentContainer: undefined,
};

export const darkColors: AppThemeColors = {
  background: "#07111f",
  surface: "#0d1728",
  surfaceSoft: "#142033",
  text: "#f5f7fb",
  textSecondary: "#cdd8ea",
  textMuted: "#b2c2d8",
  accent: "#6ea8ff",
  warning: "#fbbf24",
  border: "#2e4364",
  development: "#fbbf24",
  error: "#fca5a5",
  moduleCardActiveBg: "#203554",
  quizLockHint: "#fbbf24",
  quizItemLockedBorder: "#35506F",
  quizItemLockedBg: "#132032",
  quizItemCompletedBorder: "#34D399",
  quizItemCompletedBg: "#132032",
  quizLockedBadgeBorder: "#4c6a96",
  quizLockedBadgeText: "#f5f7fb",
  quizLockedBadgeBg: "#1b2b42",
  quizButtonLockedBg: "#1b2b42",
  quizButtonLockedBorder: "#4c6a96",
  quizButtonCompletedBg: "#123524",
  quizButtonCompletedBorder: "#34D399",
  quizButtonCompletedText: "#f5f7fb",
  quizButtonLockedText: "#f5f7fb",
  onWarningContainer: undefined,
  warningContainer: undefined,
  errorContainer: undefined,
  success: undefined,
  successContainer: undefined,
  accentContainer: undefined,
};

export function getThemeColors(
  themeMode: ThemeMode,
  systemScheme: "light" | "dark",
) {
  const resolvedMode = themeMode === "auto" ? systemScheme : themeMode;
  return resolvedMode === "dark" ? darkColors : lightColors;
}
