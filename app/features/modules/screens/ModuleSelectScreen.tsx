import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
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

  const totalCourses = useMemo(
    () =>
      modules.reduce((sum, moduleItem) => sum + moduleItem.courses.length, 0),
    [modules],
  );

  const totalQuizzes = useMemo(
    () =>
      modules.reduce((sum, moduleItem) => sum + moduleItem.quizzes.length, 0),
    [modules],
  );

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
      <View pointerEvents="none" style={styles.ambientBackground}>
        <View style={styles.ambientBlobLarge} />
        <View style={styles.ambientBlobSmall} />
      </View>

      <View style={styles.heroCard}>
        <Text style={typography.eyebrowWarning}>{tModules("heroEyebrow")}</Text>
        <Text style={[typography.heroTitle, styles.title]}>
          {tModules("selectTitle")}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {tModules("selectBody")}
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatValue}>{modules.length}</Text>
            <Text style={styles.heroStatLabel}>Modules</Text>
          </View>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatValue}>{totalCourses}</Text>
            <Text style={styles.heroStatLabel}>Cours</Text>
          </View>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatValue}>{totalQuizzes}</Text>
            <Text style={styles.heroStatLabel}>Quiz</Text>
          </View>
        </View>
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
          <Text style={[typography.sectionTitle, styles.sectionTitle]}>
            {tModules("selectLabel")}
          </Text>
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

              <View style={styles.previewMetaRow}>
                <Text style={styles.previewMetaPill}>
                  {selectedModule.courses.length} cours
                </Text>
                <Text style={styles.previewMetaPill}>
                  {selectedModule.quizzes.length} quiz
                </Text>
                <Text style={styles.previewMetaPill}>
                  {selectedModule.level}
                </Text>
              </View>

              <Pressable
                style={styles.openButton}
                onPress={() => handleSelectModule(selectedModule)}
              >
                <Text style={styles.openButtonText}>
                  {tModules("openModule")}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {selectedModule ? (
            <View style={styles.visualCard}>
              <Image
                source={require("../../../../assets/images/cyber_guardian.png")}
                style={styles.selectedImage}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f5ff",
  },
  content: {
    position: "relative",
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(36),
    gap: moderateScale(18),
  },
  ambientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(220),
  },
  ambientBlobLarge: {
    position: "absolute",
    top: verticalScale(-72),
    right: scale(-44),
    width: scale(220),
    height: scale(220),
    borderRadius: scale(999),
    backgroundColor: "rgba(79, 140, 255, 0.16)",
  },
  ambientBlobSmall: {
    position: "absolute",
    top: verticalScale(18),
    left: scale(-56),
    width: scale(136),
    height: scale(136),
    borderRadius: scale(999),
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  heroCard: {
    borderRadius: scale(24),
    borderWidth: scale(1),
    borderColor: "#86a6dd",
    backgroundColor: "#f9fbff",
    padding: moderateScale(20),
    shadowColor: "#14356f",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  title: {
    marginTop: moderateScale(8),
  },
  body: {
    marginTop: moderateScale(10),
  },
  heroStatsRow: {
    marginTop: moderateScale(16),
    flexDirection: "row",
    gap: moderateScale(8),
  },
  heroStatPill: {
    flex: 1,
    borderRadius: scale(14),
    borderWidth: scale(1),
    borderColor: "#bcd2f6",
    backgroundColor: "#ffffff",
    paddingVertical: moderateScale(10),
    alignItems: "center",
  },
  heroStatValue: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: "900",
  },
  heroStatLabel: {
    color: colors.textMuted,
    fontSize: normalizeFont(11),
    fontWeight: "700",
    letterSpacing: moderateScale(0.8),
    textTransform: "uppercase",
  },
  stateCard: {
    borderRadius: scale(18),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: "#ffffff",
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
    gap: moderateScale(12),
  },
  sectionTitle: {
    marginBottom: moderateScale(2),
  },
  selectControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: "#8cb0ec",
    backgroundColor: "#ffffff",
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(16),
    shadowColor: "#173465",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    fontSize: normalizeFont(13),
    marginTop: moderateScale(4),
  },
  selectChevron: {
    color: colors.accent,
    fontSize: normalizeFont(22),
    fontWeight: "900",
  },
  optionsCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: "#8cb0ec",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#173465",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  optionRow: {
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: moderateScale(12),
  },
  optionRowActive: {
    backgroundColor: "#edf3ff",
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
    borderRadius: scale(22),
    borderWidth: scale(1),
    borderColor: "#8cb0ec",
    backgroundColor: "#e8f0ff",
    padding: moderateScale(18),
    gap: moderateScale(10),
    shadowColor: "#173465",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  previewText: {
    color: colors.textMuted,
    fontSize: normalizeFont(13),
    lineHeight: verticalScale(20),
  },
  previewMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
    marginTop: moderateScale(6),
  },
  previewMetaPill: {
    backgroundColor: "#ffffff",
    color: colors.text,
    borderWidth: scale(1),
    borderColor: "#bfd4fa",
    borderRadius: scale(999),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    fontSize: normalizeFont(11),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.7),
  },
  openButton: {
    marginTop: moderateScale(8),
    borderRadius: scale(12),
    backgroundColor: colors.accent,
    paddingVertical: moderateScale(12),
    alignItems: "center",
  },
  openButtonText: {
    color: "#ffffff",
    fontSize: normalizeFont(13),
    fontWeight: "800",
    letterSpacing: moderateScale(0.5),
    textTransform: "uppercase",
  },
  visualCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: "#b6cdf7",
    backgroundColor: "#ffffff",
    paddingVertical: moderateScale(14),
    alignItems: "center",
    marginTop: moderateScale(4),
    shadowColor: "#173465",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  selectedImage: {
    width: scale(160),
    height: verticalScale(110),
    resizeMode: "cover",
    borderRadius: scale(12),
  },
});
