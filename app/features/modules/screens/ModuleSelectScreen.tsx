import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getApiBaseUrl, getModules, ModuleItem } from "../../../lib/api";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../../../lib/responsive";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

export function ModuleSelectScreen() {
  const { t } = useTranslation();
  const tModules = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(`modules.${key}`, options),
    [t],
  );
  const router = useRouter();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [selectedModuleCode, setSelectedModuleCode] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadModules() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const fetchedModules = await getModules();
        if (!isMounted) {
          return;
        }

        setModules(fetchedModules);
        setSelectedModuleCode(fetchedModules[0]?.code ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : tModules("loadError");
        setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadModules();

    return () => {
      isMounted = false;
    };
  }, [tModules]);

  const selectedModule = useMemo(() => {
    if (!modules.length) {
      return null;
    }

    return (
      modules.find((moduleItem) => moduleItem.code === selectedModuleCode) ??
      modules[0]
    );
  }, [modules, selectedModuleCode]);

  const handleSelectModule = (moduleItem: ModuleItem) => {
    setSelectedModuleCode(moduleItem.code);
    setIsOpen(false);
    router.push({
      pathname: "/module",
      params: { moduleCode: moduleItem.code },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrowWarning}>{tModules("heroEyebrow")}</Text>
        <Text style={[typography.heroTitle, styles.title]}>
          {tModules("selectTitle")}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {tModules("selectBody")}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>{tModules("loading")}</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage && selectedModule ? (
        <View style={styles.selectBlock}>
          <Text style={typography.sectionTitle}>{tModules("selectLabel")}</Text>
          <Pressable
            style={styles.selectControl}
            onPress={() => setIsOpen((current) => !current)}
          >
            <View style={styles.selectTextWrap}>
              <Text style={styles.selectValue}>{selectedModule.title}</Text>
              <Text style={styles.selectMeta}>
                {selectedModule.level} • {selectedModule.courses.length}{" "}
                {tModules("courseShort")}
              </Text>
            </View>
            <Text style={styles.selectChevron}>{isOpen ? "▴" : "▾"}</Text>
          </Pressable>

          {isOpen ? (
            <View style={styles.optionsCard}>
              {modules.map((moduleItem) => (
                <Pressable
                  key={moduleItem.id}
                  style={[
                    styles.optionRow,
                    moduleItem.code === selectedModule.code &&
                      styles.optionRowActive,
                  ]}
                  onPress={() => handleSelectModule(moduleItem)}
                >
                  <View style={styles.optionInfo}>
                    <Text style={typography.cardCode}>{moduleItem.code}</Text>
                    <Text style={styles.optionTitle}>{moduleItem.title}</Text>
                    <Text style={styles.optionMeta}>{moduleItem.level}</Text>
                  </View>
                  <Text style={styles.optionAction}>
                    {tModules("openModule")}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {selectedModule ? (
            <View style={styles.previewCard}>
              <Text style={typography.eyebrow}>
                {tModules("selectedModule")}
              </Text>
              <Text style={typography.sectionTitle}>
                {selectedModule.title}
              </Text>
              <Text style={styles.previewText}>
                {selectedModule.description ?? tModules("moduleFallback")}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(36),
    gap: moderateScale(16),
  },
  heroCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(18),
  },
  title: {
    marginTop: moderateScale(8),
  },
  body: {
    marginTop: moderateScale(10),
  },
  stateCard: {
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: moderateScale(16),
    alignItems: "center",
    gap: moderateScale(8),
  },
  stateText: {
    color: colors.textMuted,
    fontSize: normalizeFont(13),
    fontWeight: "700",
  },
  errorText: {
    color: colors.error,
    fontSize: normalizeFont(13),
    fontWeight: "700",
    textAlign: "center",
  },
  selectBlock: {
    gap: moderateScale(14),
  },
  selectControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
  },
  selectTextWrap: {
    flex: 1,
    paddingRight: moderateScale(12),
  },
  selectValue: {
    color: colors.text,
    fontSize: normalizeFont(17),
    fontWeight: "800",
  },
  selectMeta: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    marginTop: moderateScale(4),
  },
  selectChevron: {
    color: colors.accent,
    fontSize: normalizeFont(20),
    fontWeight: "900",
  },
  optionsCard: {
    borderRadius: scale(18),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  optionRow: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: moderateScale(12),
  },
  optionRowActive: {
    backgroundColor: colors.surfaceSoft,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text,
    fontSize: normalizeFont(15),
    fontWeight: "800",
    marginTop: moderateScale(4),
  },
  optionMeta: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    marginTop: moderateScale(3),
  },
  optionAction: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.8),
  },
  previewCard: {
    borderRadius: scale(18),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: moderateScale(16),
    gap: moderateScale(8),
  },
  previewText: {
    color: colors.textMuted,
    fontSize: normalizeFont(13),
    lineHeight: verticalScale(20),
  },
});
