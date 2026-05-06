import { useEffect, useSyncExternalStore } from "react";
import { getItem, setItem } from "./asyncStorageSafe";

export type ThemeMode = "light" | "dark" | "auto";

export interface AppSettings {
  soundEnabled: boolean;
  themeMode: ThemeMode;
}

const SETTINGS_KEY = "app_settings";

type SettingsListener = () => void;

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  themeMode: "auto",
};

let cachedSettings: AppSettings = DEFAULT_SETTINGS;
let settingsLoaded = false;
let loadPromise: Promise<void> | null = null;
const settingsListeners = new Set<SettingsListener>();

function emitSettingsChange() {
  settingsListeners.forEach((listener) => listener());
}

async function ensureSettingsLoaded() {
  if (settingsLoaded) {
    return;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const savedSettings = await getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings) as Partial<AppSettings>;
          cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
        }
      } catch (error) {
        console.warn("Failed to load settings:", error);
      } finally {
        settingsLoaded = true;
        loadPromise = null;
        emitSettingsChange();
      }
    })();
  }

  await loadPromise;
}

export function getSettingsSnapshot() {
  return cachedSettings;
}

export function subscribeToSettings(listener: SettingsListener) {
  settingsListeners.add(listener);
  return () => {
    settingsListeners.delete(listener);
  };
}

export function useSettings() {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getSettingsSnapshot,
  );
  const isLoading = !settingsLoaded;

  useEffect(() => {
    void ensureSettingsLoaded();
  }, []);

  async function updateSettings(updates: Partial<AppSettings>) {
    await ensureSettingsLoaded();
    cachedSettings = { ...cachedSettings, ...updates };
    emitSettingsChange();
    try {
      await setItem(SETTINGS_KEY, JSON.stringify(cachedSettings));
    } catch (error) {
      console.warn("Failed to save settings:", error);
    }
  }

  async function setSoundEnabled(enabled: boolean) {
    await updateSettings({ soundEnabled: enabled });
  }

  async function setThemeMode(mode: ThemeMode) {
    await updateSettings({ themeMode: mode });
  }

  return {
    settings,
    isLoading,
    setSoundEnabled,
    setThemeMode,
  };
}
