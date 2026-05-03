import { useEffect, useState } from "react";
import { getItem, setItem } from "./asyncStorageSafe";

export type ThemeMode = "light" | "dark" | "auto";

export interface AppSettings {
  soundEnabled: boolean;
  themeMode: ThemeMode;
}

const SETTINGS_KEY = "app_settings";

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  themeMode: "auto",
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const savedSettings = await getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.warn("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSettings(updates: Partial<AppSettings>) {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      await setItem(SETTINGS_KEY, JSON.stringify(newSettings));
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
