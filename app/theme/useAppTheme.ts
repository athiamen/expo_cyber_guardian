import { useMemo } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

import { useSettings } from "../lib/settings";
import { getThemeColors, type AppThemeColors } from "./palette";
import { buildTypography, type AppTypography } from "./typography";

export type AppTheme = {
  colors: AppThemeColors;
  typography: AppTypography;
  mode: "light" | "dark";
};

export function useAppTheme(): AppTheme {
  const { settings } = useSettings();
  const deviceColorScheme = useDeviceColorScheme() ?? "light";
  const mode =
    settings.themeMode === "auto" ? deviceColorScheme : settings.themeMode;
  const colors = useMemo(
    () => getThemeColors(settings.themeMode, deviceColorScheme),
    [deviceColorScheme, settings.themeMode],
  );
  const typography = useMemo(() => buildTypography(colors), [colors]);

  return { colors, typography, mode };
}
