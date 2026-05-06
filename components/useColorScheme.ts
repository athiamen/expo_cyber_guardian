import { useSyncExternalStore } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

import { getSettingsSnapshot, subscribeToSettings } from "../app/lib/settings";

export function useColorScheme(): "light" | "dark" {
  const deviceColorScheme = useDeviceColorScheme();

  return useSyncExternalStore(
    subscribeToSettings,
    () =>
      getSettingsSnapshot().themeMode === "auto"
        ? (deviceColorScheme ?? "light")
        : getSettingsSnapshot().themeMode,
    () =>
      getSettingsSnapshot().themeMode === "auto"
        ? "light"
        : getSettingsSnapshot().themeMode,
  );
}
