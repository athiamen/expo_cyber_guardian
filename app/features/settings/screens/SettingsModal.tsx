import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../../../lib/responsive";
import { useSettings, type ThemeMode } from "../../../lib/settings";
import { useAppTheme } from "../../../theme/useAppTheme";

export function SettingsModal() {
  const { t } = useTranslation();
  const tSettings = (key: string) => t(`settings.${key}`);
  const { settings, setSoundEnabled, setThemeMode } = useSettings();
  const { colors, typography } = useAppTheme();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: "auto", label: tSettings("themeAuto") },
    { value: "light", label: tSettings("themeLight") },
    { value: "dark", label: tSettings("themeDark") },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{tSettings("title")}</Text>

      {/* Sound Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="volume-up"
            size={normalizeFont(24)}
            color={colors.accent}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>{tSettings("soundTitle")}</Text>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingText}>
              {tSettings("soundDescription")}
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: "#767577", true: colors.accent }}
            thumbColor={settings.soundEnabled ? colors.accent : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Theme Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="palette"
            size={normalizeFont(24)}
            color={colors.accent}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>{tSettings("themeTitle")}</Text>
        </View>
        <Text style={styles.settingDescription}>
          {tSettings("themeDescription")}
        </Text>
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.themeOption,
                settings.themeMode === option.value && styles.themeOptionActive,
              ]}
              onPress={() => setThemeMode(option.value)}
            >
              {settings.themeMode === option.value && (
                <MaterialIcons
                  name="check-circle"
                  size={normalizeFont(20)}
                  color={colors.accent}
                  style={styles.themeCheckmark}
                />
              )}
              <Text
                style={[
                  styles.themeOptionLabel,
                  settings.themeMode === option.value &&
                    styles.themeOptionLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, typography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingVertical: verticalScale(20),
      paddingHorizontal: scale(16),
      paddingBottom: verticalScale(40),
    },
    title: {
      ...typography.screenTitle,
      marginBottom: verticalScale(32),
      textAlign: "center",
    },
    section: {
      marginBottom: verticalScale(32),
      paddingHorizontal: scale(4),
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(16),
    },
    sectionIcon: {
      marginRight: scale(12),
    },
    sectionTitle: {
      ...typography.sectionTitle,
      flex: 1,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      backgroundColor: colors.surface,
      borderRadius: moderateScale(8),
      marginBottom: verticalScale(12),
    },
    settingLabel: {
      flex: 1,
      marginRight: scale(12),
    },
    settingText: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    settingDescription: {
      ...typography.body,
      color: colors.textMuted,
      marginBottom: verticalScale(12),
    },
    themeOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(12),
    },
    themeOption: {
      flex: 1,
      minWidth: scale(90),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(12),
      borderRadius: moderateScale(8),
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    themeOptionActive: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceSoft,
    },
    themeCheckmark: {
      marginRight: scale(6),
    },
    themeOptionLabel: {
      ...typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    themeOptionLabelActive: {
      color: colors.accent,
    },
  });
