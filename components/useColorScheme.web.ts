// NOTE: The default React Native styling doesn't support server rendering.
// Server rendered styles should not change between the first render of the HTML
// and the first render on the client. Typically, web developers will use CSS media queries
// to render different styles on the client and server, these aren't directly supported in React Native
// but can be achieved using a styling library like Nativewind.
import { useSyncExternalStore } from "react";

import { getSettingsSnapshot, subscribeToSettings } from "../app/lib/settings";

export function useColorScheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribeToSettings,
    () => {
      const themeMode = getSettingsSnapshot().themeMode;
      return themeMode === "auto" ? "light" : themeMode;
    },
    () => "light",
  );
}
