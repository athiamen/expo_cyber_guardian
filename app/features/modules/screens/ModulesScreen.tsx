import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { getApiBaseUrl, getModules, ModuleItem } from "../../../lib/api";
import { getLearningProgress } from "../../../lib/learningProgress";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { useAppTheme } from "../../../theme/useAppTheme";
import type { QuizDifficulty } from "../../quiz/data/quizCatalogData";

type ModulesScreenProps = {
  userId: string;
};

export function ModulesScreen({ userId }: ModulesScreenProps) {
  const { t } = useTranslation();
  const tModules = (key: string, options?: Record<string, unknown>) =>
    t(`modules.${key}`, options);
  const { width } = useWindowDimensions();
  const showHeroImage = width >= 360;
  const router = useRouter();
  const { colors, typography } = useAppTheme();
  const [tracks, setTracks] = useState<ModuleItem[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readCourseCodes, setReadCourseCodes] = useState<string[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>(
    [],
  );
  const [completedQuizCodes, setCompletedQuizCodes] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<QuizDifficulty>("easy");

  useEffect(() => {
    let isMounted = true;

    async function loadModules() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const modules = await getModules();
        if (!isMounted) {
          return;
        }

        setTracks(modules);
        setSelectedModuleId((current) => current ?? modules[0]?.id ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : t("modules.loadError");
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
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getLearningProgress(userId).then((progress) => {
        if (!isMounted) {
          return;
        }

        setReadCourseCodes(progress.readCourseCodes);
        setCompletedCourseCodes(progress.completedCourseCodes);
        setCompletedQuizCodes(progress.completedQuizCodes);
      });

      return () => {
        isMounted = false;
      };
    }, [userId]),
  );

  const totalCourses = useMemo(
    () => tracks.reduce((acc, track) => acc + track.courses.length, 0),
    [tracks],
  );
  const totalQuizzes = useMemo(
    () => tracks.reduce((acc, track) => acc + track.quizzes.length, 0),
    [tracks],
  );
  const averageProgress = useMemo(() => {
    if (!tracks.length) {
      return 0;
    }

    return Math.round(
      tracks.reduce((acc, track) => acc + track.progress, 0) / tracks.length,
    );
  }, [tracks]);

  const selectedModule = useMemo(() => {
    if (!tracks.length) {
      return null;
    }

    return tracks.find((track) => track.id === selectedModuleId) ?? tracks[0];
  }, [selectedModuleId, tracks]);

  const moduleProgressById = useMemo(() => {
    return tracks.reduce<Record<string, number>>((acc, track) => {
      const totalCourses = track.courses.length;
      const totalQuizzes = track.quizzes.length;
      const totalPoints = totalCourses * 2 + totalQuizzes;

      if (!totalPoints) {
        acc[track.id] = 0;
        return acc;
      }

      const moduleCourseCodes = new Set(
        track.courses.map((course: { code: any }) => course.code),
      );
      const moduleQuizCodes = new Set(
        track.quizzes.map((quiz: { code: any }) => quiz.code),
      );

      const readCount = readCourseCodes.filter((code) =>
        moduleCourseCodes.has(code),
      ).length;
      const completedCoursesCount = completedCourseCodes.filter((code) =>
        moduleCourseCodes.has(code),
      ).length;
      const completedQuizzesCount = completedQuizCodes.filter((code) =>
        moduleQuizCodes.has(code),
      ).length;

      const earnedPoints =
        readCount + completedCoursesCount + completedQuizzesCount;
      acc[track.id] = Math.round((earnedPoints / totalPoints) * 100);

      return acc;
    }, {});
  }, [completedCourseCodes, completedQuizCodes, readCourseCodes, tracks]);

  const selectedModuleReadCount = useMemo(() => {
    if (!selectedModule) {
      return 0;
    }

    const moduleCourseCodes = new Set(
      selectedModule.courses.map((course: { code: any }) => course.code),
    );
    return readCourseCodes.filter((code) => moduleCourseCodes.has(code)).length;
  }, [readCourseCodes, selectedModule]);

  const selectedModuleCompletedCoursesCount = useMemo(() => {
    if (!selectedModule) {
      return 0;
    }

    const moduleCourseCodes = new Set(
      selectedModule.courses.map((course: { code: any }) => course.code),
    );
    return completedCourseCodes.filter((code) => moduleCourseCodes.has(code))
      .length;
  }, [completedCourseCodes, selectedModule]);

  const completedInSelectedModule = useMemo(() => {
    if (!selectedModule) {
      return 0;
    }

    return selectedModule.quizzes.filter((quiz) =>
      completedQuizCodes.includes(quiz.code),
    ).length;
  }, [completedQuizCodes, selectedModule]);

  const selectedModuleAllCoursesCompleted = useMemo(() => {
    if (!selectedModule) {
      return false;
    }

    if (!selectedModule.courses.length) {
      return true;
    }

    return selectedModuleCompletedCoursesCount >= selectedModule.courses.length;
  }, [selectedModule, selectedModuleCompletedCoursesCount]);

  const remainingCoursesToUnlockQuiz = useMemo(() => {
    if (!selectedModule || !selectedModule.courses.length) {
      return 0;
    }

    return Math.max(
      selectedModule.courses.length - selectedModuleCompletedCoursesCount,
      0,
    );
  }, [selectedModule, selectedModuleCompletedCoursesCount]);

  const moduleColumns = width >= 760 ? 3 : width >= 560 ? 2 : 1;
  const moduleCardWidth =
    moduleColumns === 3 ? "31.8%" : moduleColumns === 2 ? "48.8%" : "100%";
  const courseColumns = width >= 1120 ? 3 : width >= 760 ? 2 : 1;
  const courseCardWidth =
    courseColumns === 3 ? "31.8%" : courseColumns === 2 ? "48.8%" : "100%";
  const quizColumns = width >= 760 ? 2 : 1;
  const quizCardWidth = quizColumns === 2 ? "48.8%" : "100%";
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextWrap}>
            <Text style={typography.eyebrowWarning}>
              {tModules("heroEyebrow")}
            </Text>
            <Text style={[typography.heroTitle, styles.heroTitle]}>
              {tModules("heroTitle")}
            </Text>
            <Text style={[typography.body, styles.heroBody]}>
              {tModules("heroBody")}
            </Text>
          </View>
          {showHeroImage ? (
            <Image
              source={require("../../../../assets/images/cyber_guardian.png")}
              style={styles.heroImage}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{totalCourses}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tModules("lessons")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{totalQuizzes}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tModules("quizzes")}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={typography.statValue}>{averageProgress}%</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tModules("progress")}
          </Text>
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
        <>
          <Text style={[typography.sectionTitle, styles.sectionTitle]}>
            {tModules("availableModules")}
          </Text>
          <View style={styles.modulesGrid}>
            {tracks.map((track) => (
              <Pressable
                key={track.id}
                style={[
                  styles.moduleCard,
                  { width: moduleCardWidth },
                  selectedModule.id === track.id && styles.moduleCardActive,
                ]}
                onPress={() => setSelectedModuleId(track.id)}
              >
                <View style={styles.moduleTopRow}>
                  <Text style={typography.cardCode}>{track.code}</Text>
                  <Text style={styles.moduleBadge}>
                    {tModules("courseCount", { count: track.courses.length })} •{" "}
                    {tModules("quizCount", { count: track.quizzes.length })}
                  </Text>
                </View>
                <Text style={typography.cardTitle}>{track.title}</Text>
                <Text style={typography.cardMeta}>{track.level}</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${moduleProgressById[track.id] ?? 0}%` },
                    ]}
                  />
                </View>
                <Text style={[typography.progressLabel, styles.progressLabel]}>
                  {tModules("moduleProgress", {
                    value: moduleProgressById[track.id] ?? 0,
                  })}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.coursesPanel}>
            <Text style={typography.eyebrow}>
              {tModules("coursePanelEyebrow")}
            </Text>
            <Text style={[typography.sectionTitle, styles.coursesPanelTitle]}>
              {selectedModule.title}
            </Text>
            <Text style={styles.coursesPanelMeta}>
              {tModules("courseMeta", {
                available: selectedModule.courses.length,
                read: selectedModuleReadCount,
                completed: selectedModuleCompletedCoursesCount,
              })}
            </Text>

            <View style={styles.coursesGrid}>
              {selectedModule.courses.map(
                (course: {
                  id: Key | null | undefined;
                  code:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  title:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  format:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  duration:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                }) => (
                  <View
                    key={course.id}
                    style={[styles.courseItem, { width: courseCardWidth }]}
                  >
                    <View style={styles.itemInfoWrap}>
                      <Text style={typography.cardCode}>{course.code}</Text>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseMeta}>
                        {course.format} • {course.duration}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.courseButton}
                      onPress={() =>
                        router.push({
                          pathname: "/course",
                          params: {
                            courseCode: String(course.code ?? ""),
                            courseTitle: String(course.title ?? ""),
                            moduleTitle: String(selectedModule.title ?? ""),
                            autoStart: "1",
                            userId,
                          },
                        })
                      }
                    >
                      <Text style={styles.courseButtonText}>
                        {tModules("startCourse")}
                      </Text>
                    </Pressable>
                  </View>
                ),
              )}
            </View>
          </View>

          <View style={styles.quizPanel}>
            <Text style={typography.eyebrow}>
              {tModules("quizPanelEyebrow")}
            </Text>
            <Text style={[typography.sectionTitle, styles.quizPanelTitle]}>
              {selectedModule.title}
            </Text>
            <Text style={styles.quizPanelMeta}>
              {tModules("quizMeta", {
                available: selectedModule.quizzes.length,
                completed: completedInSelectedModule,
              })}
            </Text>
            <View style={styles.quizGrid}>
              {selectedModule.quizzes.map((quiz) => {
                const isQuizCompleted = completedQuizCodes.includes(quiz.code);
                const isQuizUnlocked =
                  selectedModuleAllCoursesCompleted || isQuizCompleted;

                return (
                  <View
                    key={quiz.id}
                    style={[
                      styles.quizItem,
                      { width: quizCardWidth },
                      isQuizCompleted && styles.quizItemCompleted,
                      !isQuizUnlocked && styles.quizItemLocked,
                    ]}
                  >
                    <View style={styles.itemInfoWrap}>
                      <Text style={typography.cardCode}>{quiz.code}</Text>
                      <Text style={styles.quizTitle}>{quiz.title}</Text>
                      <Text style={styles.quizMeta}>{quiz.duration}</Text>
                      {isQuizCompleted ? (
                        <Text style={styles.quizDoneBadge}>
                          {tModules("alreadyCompleted")}
                        </Text>
                      ) : null}
                      {!isQuizUnlocked ? (
                        <Text style={styles.quizLockedBadge}>
                          {tModules("locked")}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      style={[
                        styles.quizButton,
                        isQuizCompleted && styles.quizButtonCompleted,
                        !isQuizUnlocked && styles.quizButtonLocked,
                      ]}
                      disabled={!isQuizUnlocked}
                      onPress={() =>
                        router.push({
                          pathname: "/quiz",
                          params: {
                            quizId: quiz.code,
                            quizTitle: quiz.title,
                            difficulty: selectedDifficulty,
                            userId,
                          },
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.quizButtonText,
                          isQuizCompleted && styles.quizButtonTextCompleted,
                          !isQuizUnlocked && styles.quizButtonTextLocked,
                        ]}
                      >
                        {isQuizCompleted
                          ? tModules("resumeQuiz")
                          : isQuizUnlocked
                            ? tModules("startQuiz")
                            : tModules("locked")}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const createStyles = (colors: any, typography: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    content: {
      gap: moderateScale(16),
      paddingHorizontal: moderateScale(24),
      paddingTop: moderateScale(24),
      paddingBottom: moderateScale(36),
    },
    heroCard: {
      borderRadius: scale(20),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(18),
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: moderateScale(14),
    },
    heroTextWrap: {
      flex: 1,
    },
    heroImage: {
      width: scale(220),
      maxWidth: "50%",
      height: verticalScale(160),
      borderRadius: scale(12),
      resizeMode: "cover",
    },
    heroTitle: {
      marginTop: moderateScale(8),
    },
    heroBody: {
      marginTop: moderateScale(10),
      maxWidth: moderateScale(330),
      textAlign: "left",
      fontWeight: "bold",
    },
    statsRow: {
      flexDirection: "row",
      gap: moderateScale(10),
    },
    statCard: {
      flex: 1,
      borderRadius: scale(14),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: moderateScale(12),
    },
    statLabel: {
      marginTop: moderateScale(6),
    },
    sectionTitle: {
      marginTop: moderateScale(6),
    },
    stateCard: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      alignItems: "center",
      gap: moderateScale(8),
    },
    stateText: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      fontWeight: "600",
    },
    errorText: {
      color: colors.error,
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
    modulesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: moderateScale(10),
    },
    moduleCard: {
      gap: 4,
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      minWidth: moderateScale(220),
    },
    moduleCardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.moduleCardActiveBg,
    },
    moduleTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    moduleBadge: {
      color: colors.textMuted,
      fontSize: normalizeFont(11),
      fontWeight: "700",
      letterSpacing: moderateScale(0.3),
      textTransform: "uppercase",
    },
    progressTrack: {
      marginTop: moderateScale(8),
      height: verticalScale(8),
      overflow: "hidden",
      borderRadius: 999,
      backgroundColor: colors.surfaceSoft,
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    progressLabel: {
      marginTop: 6,
    },
    coursesPanel: {
      marginTop: moderateScale(4),
      borderRadius: scale(18),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(10),
    },
    coursesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    coursesPanelTitle: {
      marginTop: -2,
    },
    coursesPanelMeta: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      fontWeight: "600",
    },
    courseItem: {
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: moderateScale(12),
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      gap: moderateScale(10),
    },
    itemInfoWrap: {
      flex: 1,
    },
    courseTitle: {
      color: colors.text,
      fontSize: normalizeFont(14),
      fontWeight: "700",
      lineHeight: verticalScale(18),
      marginTop: moderateScale(2),
    },
    courseMeta: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      marginTop: moderateScale(3),
    },
    courseButton: {
      borderRadius: scale(10),
      borderWidth: scale(1),
      borderColor: colors.accent,
      backgroundColor: colors.accent,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(9),
      alignSelf: "flex-start",
    },
    courseButtonText: {
      color: colors.background,
      fontSize: normalizeFont(12),
      fontWeight: "800",
      letterSpacing: moderateScale(0.3),
      textTransform: "uppercase",
    },
    quizPanel: {
      marginTop: moderateScale(4),
      borderRadius: scale(18),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(10),
    },
    quizPanelTitle: {
      marginTop: -2,
    },
    quizPanelMeta: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    quizGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    difficultySelector: {
      flexDirection: "row",
      flexWrap: "nowrap",
      gap: 8,
      marginTop: 10,
    },
    difficultyButton: {
      flex: 1,
      borderRadius: 999,
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(8),
      alignItems: "center",
    },
    difficultyButtonActive: {
      backgroundColor: colors.accent,
    },
    difficultyButtonText: {
      color: colors.text,
      fontSize: normalizeFont(11),
      fontWeight: "800",
      letterSpacing: moderateScale(0.5),
      textTransform: "uppercase",
    },
    difficultyButtonTextActive: {
      color: colors.surface,
    },
    quizLockHint: {
      marginTop: -2,
      color: colors.quizLockHint,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },
    quizItem: {
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: moderateScale(12),
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      gap: moderateScale(10),
    },
    quizItemLocked: {
      borderColor: colors.quizItemLockedBorder,
      backgroundColor: colors.quizItemLockedBg,
      opacity: 0.8,
    },
    quizItemCompleted: {
      borderColor: colors.quizItemCompletedBorder,
      backgroundColor: colors.quizItemCompletedBg,
    },
    quizTitle: {
      color: colors.text,
      fontSize: normalizeFont(14),
      fontWeight: "700",
      lineHeight: verticalScale(18),
      marginTop: moderateScale(2),
    },
    quizMeta: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      marginTop: moderateScale(3),
    },
    quizDoneBadge: {
      marginTop: moderateScale(6),
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: scale(1),
      borderColor: colors.surface,
      color: colors.surfaceSoft,
      backgroundColor: colors.accent,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      fontSize: normalizeFont(11),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
      textTransform: "uppercase",
    },
    quizLockedBadge: {
      marginTop: moderateScale(6),
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: scale(1),
      borderColor: colors.quizLockedBadgeBorder,
      color: colors.quizLockedBadgeText,
      backgroundColor: colors.quizLockedBadgeBg,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      fontSize: normalizeFont(11),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
      textTransform: "uppercase",
    },
    quizButton: {
      borderRadius: scale(10),
      backgroundColor: colors.accent,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(9),
      alignSelf: "flex-start",
    },
    quizButtonLocked: {
      backgroundColor: colors.quizButtonLockedBg,
      borderWidth: 1,
      borderColor: colors.quizButtonLockedBorder,
    },
    quizButtonCompleted: {
      backgroundColor: colors.quizButtonCompletedBg,
      borderWidth: 1,
      borderColor: colors.quizButtonCompletedBorder,
    },
    quizButtonText: {
      color: colors.background,
      fontSize: normalizeFont(12),
      fontWeight: "800",
      letterSpacing: moderateScale(0.3),
      textTransform: "uppercase",
    },
    quizButtonTextCompleted: {
      color: colors.quizButtonCompletedText,
    },
    quizButtonTextLocked: {
      color: colors.quizButtonLockedText,
    },
  });
