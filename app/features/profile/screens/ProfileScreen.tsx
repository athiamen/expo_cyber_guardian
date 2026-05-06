import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  getApiBaseUrl,
  getModules,
  getProfileMe,
  ModuleItem,
  ProfileItem,
} from "../../../lib/api";
import { getLearningProgress } from "../../../lib/learningProgress";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { useAppTheme } from "../../../theme/useAppTheme";

type ProfileScreenProps = {
  token: string;
  userId: string;
  onLogout?: () => void;
};

export function ProfileScreen({ token, userId, onLogout }: ProfileScreenProps) {
  const { t } = useTranslation();
  const tProfile = (key: string, options?: Record<string, unknown>) =>
    t(`profile.${key}`, options);
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 420;
  const { colors, typography } = useAppTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>(
    [],
  );
  const [completedQuizCodes, setCompletedQuizCodes] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadData() {
        setIsLoading(true);
        setErrorMessage(null);

        try {
          const [me, modulesResponse, learningProgress] = await Promise.all([
            getProfileMe(token),
            getModules(),
            getLearningProgress(userId),
          ]);
          if (!isMounted) {
            return;
          }

          setProfile(me);
          setModules(modulesResponse);
          setCompletedCourseCodes(learningProgress.completedCourseCodes);
          setCompletedQuizCodes(learningProgress.completedQuizCodes);
        } catch (error) {
          if (!isMounted) {
            return;
          }

          const message =
            error instanceof Error ? error.message : t("profile.loadError");
          setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadData();

      return () => {
        isMounted = false;
      };
    }, [token, userId, t]),
  );

  const progression = useMemo(() => {
    const totalCourses = modules.reduce(
      (acc, moduleItem) => acc + moduleItem.courses.length,
      0,
    );
    const totalQuizzes = modules.reduce(
      (acc, moduleItem) => acc + moduleItem.quizzes.length,
      0,
    );
    const totalItems = totalCourses + totalQuizzes;

    if (!totalItems) {
      return 0;
    }

    const validCourseCodes = new Set(
      modules.flatMap((moduleItem) =>
        moduleItem.courses.map((course) => course.code),
      ),
    );
    const validQuizCodes = new Set(
      modules.flatMap((moduleItem) =>
        moduleItem.quizzes.map((quiz) => quiz.code),
      ),
    );

    const completedCourses = completedCourseCodes.filter((code) =>
      validCourseCodes.has(code),
    ).length;
    const completedQuizzes = completedQuizCodes.filter((code) =>
      validQuizCodes.has(code),
    ).length;

    return Math.round(
      ((completedCourses + completedQuizzes) / totalItems) * 100,
    );
  }, [completedCourseCodes, completedQuizCodes, modules]);

  const totalCourses = useMemo(
    () =>
      modules.reduce((acc, moduleItem) => acc + moduleItem.courses.length, 0),
    [modules],
  );

  const totalQuizzes = useMemo(
    () =>
      modules.reduce((acc, moduleItem) => acc + moduleItem.quizzes.length, 0),
    [modules],
  );

  const completedCourses = useMemo(() => {
    const validCourseCodes = new Set(
      modules.flatMap((moduleItem) =>
        moduleItem.courses.map((course) => course.code),
      ),
    );
    return completedCourseCodes.filter((code) => validCourseCodes.has(code))
      .length;
  }, [completedCourseCodes, modules]);

  const completedQuizzes = useMemo(() => {
    const validQuizCodes = new Set(
      modules.flatMap((moduleItem) =>
        moduleItem.quizzes.map((quiz) => quiz.code),
      ),
    );
    return completedQuizCodes.filter((code) => validQuizCodes.has(code)).length;
  }, [completedQuizCodes, modules]);

  const initials = useMemo(() => {
    const name = profile?.fullName?.trim();
    if (!name) {
      return "??";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile?.fullName]);

  const styles = useMemo(
    () => createStyles(isMobile, colors),
    [isMobile, colors],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tProfile("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View pointerEvents="none" style={styles.ambientBackground}>
        <View style={styles.ambientBlobLarge} />
        <View style={styles.ambientBlobSmall} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextWrap}>
            <Text style={typography.eyebrowWarning}>
              {tProfile("heroEyebrow")}
            </Text>
            <Text style={[typography.screenTitle, styles.heroTitle]}>
              {tProfile("heroTitle")}
            </Text>
            <Text style={[typography.body, styles.heroBody]}>
              {tProfile("heroBody")}
            </Text>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatPill}>
                <Text style={styles.heroStatValue}>{progression}%</Text>
                <Text style={styles.heroStatLabel}>{tProfile("progress")}</Text>
              </View>
              <View style={styles.heroStatPill}>
                <Text style={styles.heroStatValue}>{modules.length}</Text>
                <Text style={styles.heroStatLabel}>Modules</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroImageCard}>
            <Image
              source={require("../../../../assets/images/cyber_guardian.png")}
              style={styles.heroImage}
            />
          </View>
        </View>
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.identityTextWrap}>
          <Text style={styles.name}>
            {profile?.fullName ?? tProfile("fallbackUser")}
          </Text>
          <Text style={styles.email}>{profile?.email ?? "-"}</Text>
          <Text style={styles.role}>
            {profile?.role ?? tProfile("fallbackRole")} •{" "}
            {profile?.organization ?? tProfile("fallbackOrganization")}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{progression}%</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tProfile("progress")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>
            {completedCourses}/{totalCourses}
          </Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tProfile("completedCourses")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>
            {completedQuizzes}/{totalQuizzes}
          </Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tProfile("completedQuizzes")}
          </Text>
        </View>
      </View>

      <View style={styles.preferencesCard}>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>
          {tProfile("preferences")}
        </Text>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceTextWrap}>
            <Text style={styles.preferenceTitle}>
              {tProfile("notifications")}
            </Text>
            <Text style={styles.preferenceMeta}>
              {tProfile("notificationsMeta")}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={colors.text}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceTextWrap}>
            <Text style={styles.preferenceTitle}>
              {tProfile("weeklyRecap")}
            </Text>
            <Text style={styles.preferenceMeta}>
              {tProfile("weeklyRecapMeta")}
            </Text>
          </View>
          <Switch
            value={weeklyRecap}
            onValueChange={setWeeklyRecap}
            thumbColor={colors.text}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
          />
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={[typography.sectionTitle, styles.sectionTitle]}>
          {tProfile("quickActions")}
        </Text>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({ pathname: "/profile/edit", params: { token } })
          }
        >
          <Text style={styles.actionText}>{tProfile("editProfile")}</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({ pathname: "/profile/attempts", params: { token } })
          }
        >
          <Text style={styles.actionText}>{tProfile("attemptsReport")}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.actionDanger]}
          onPress={onLogout}
        >
          <Text style={styles.actionDangerText}>{tProfile("logout")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (isMobile: boolean, colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    content: {
      position: "relative",
      paddingHorizontal: moderateScale(isMobile ? 16 : 24),
      paddingTop: moderateScale(16),
      paddingBottom: moderateScale(24),
      gap: moderateScale(isMobile ? 10 : 14),
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
      top: verticalScale(-70),
      right: scale(-56),
      width: scale(220),
      height: scale(220),
      borderRadius: scale(999),
      backgroundColor: "rgba(79, 140, 255, 0.16)",
    },
    ambientBlobSmall: {
      position: "absolute",
      top: verticalScale(24),
      left: scale(-52),
      width: scale(130),
      height: scale(130),
      borderRadius: scale(999),
      backgroundColor: "rgba(245, 158, 11, 0.12)",
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: moderateScale(10),
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      fontWeight: "700",
    },
    heroCard: {
      borderRadius: scale(24),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(isMobile ? 14 : 18),
      shadowColor: "#14356f",
      shadowOpacity: 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    heroTopRow: {
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: moderateScale(isMobile ? 10 : 14),
    },
    heroTextWrap: {
      flex: 1,
    },
    heroTitle: {
      marginTop: 8,
    },
    heroBody: {
      marginTop: moderateScale(10),
      maxWidth: scale(320),
    },
    heroStatsRow: {
      marginTop: moderateScale(14),
      flexDirection: "row",
      gap: moderateScale(8),
    },
    heroStatPill: {
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(10),
      alignItems: "center",
      minWidth: scale(86),
    },
    heroStatValue: {
      color: colors.text,
      fontSize: normalizeFont(16),
      fontWeight: "900",
    },
    heroStatLabel: {
      color: colors.textMuted,
      fontSize: normalizeFont(10),
      fontWeight: "700",
      letterSpacing: moderateScale(0.8),
      textTransform: "uppercase",
    },
    heroImageCard: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(10),
    },
    heroImage: {
      width: scale(160),
      height: verticalScale(110),
      resizeMode: "cover",
      borderRadius: scale(10),
    },
    errorText: {
      color: colors.error,
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
    identityCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(12),
      borderRadius: scale(18),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      shadowColor: colors.text,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 7 },
      elevation: 3,
    },
    avatar: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(999),
      backgroundColor: colors.surfaceSoft,
      borderWidth: scale(1),
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: colors.accent,
      fontSize: normalizeFont(20),
      fontWeight: "900",
      letterSpacing: moderateScale(0.2),
    },
    identityTextWrap: {
      flex: 1,
      gap: moderateScale(2),
    },
    name: {
      color: colors.text,
      fontSize: normalizeFont(isMobile ? 18 : 17),
      fontWeight: "800",
    },
    email: {
      color: colors.textMuted,
      fontSize: normalizeFont(isMobile ? 14 : 13),
      fontWeight: "500",
    },
    role: {
      color: colors.warning,
      fontSize: normalizeFont(isMobile ? 13 : 12),
      fontWeight: "700",
      letterSpacing: moderateScale(0.2),
    },
    statsRow: {
      flexDirection: isMobile ? "column" : "row",
      gap: moderateScale(isMobile ? 8 : 10),
    },
    statCard: {
      flex: 1,
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(isMobile ? 14 : 12),
      minHeight: isMobile ? verticalScale(80) : "auto",
      justifyContent: "center",
      shadowColor: colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 2,
    },
    statLabel: {
      marginTop: moderateScale(6),
    },
    preferencesCard: {
      borderRadius: scale(18),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(12),
      shadowColor: colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 2,
    },
    sectionTitle: {
      marginBottom: 2,
    },
    preferenceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: moderateScale(10),
    },
    preferenceTextWrap: {
      flex: 1,
      gap: moderateScale(3),
    },
    preferenceTitle: {
      color: colors.text,
      fontSize: normalizeFont(14),
      fontWeight: "700",
    },
    preferenceMeta: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(17),
    },
    actionsCard: {
      borderRadius: scale(18),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(10),
      shadowColor: colors.text,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 2,
    },
    actionButton: {
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingVertical: moderateScale(isMobile ? 16 : 12),
      paddingHorizontal: moderateScale(12),
      minHeight: isMobile ? 52 : "auto",
      justifyContent: "center",
    },
    actionText: {
      color: colors.text,
      fontSize: normalizeFont(isMobile ? 16 : 14),
      fontWeight: "700",
      textAlign: "center",
    },
    actionDanger: {
      borderColor: colors.error,
      backgroundColor: colors.surfaceSoft,
    },
    actionDangerText: {
      color: colors.error,
      fontSize: normalizeFont(isMobile ? 16 : 14),
      fontWeight: "800",
      textAlign: "center",
    },
  });
