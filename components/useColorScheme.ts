import { useSyncExternalStore } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

import { getSettingsSnapshot, subscribeToSettings } from "../app/lib/settings";

export function useColorScheme(): "light" | "dark" {
  const deviceColorScheme = useDeviceColorScheme();

  return useSyncExternalStore(
    subscribeToSettings,
    () => {
      const themeMode = getSettingsSnapshot().themeMode;
      return themeMode === "auto" ? (deviceColorScheme ?? "light") : themeMode;
    },
    () => {
      const themeMode = getSettingsSnapshot().themeMode;
      return themeMode === "auto" ? "light" : themeMode;
    },
  );
}
