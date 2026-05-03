import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { getLearningProgress } from "../../../lib/learningProgress";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../../../lib/responsive";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

type ModuleCoursesParams = {
  moduleCode?: string;
};

export function ModuleCoursesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { moduleCode } = useLocalSearchParams<ModuleCoursesParams>();
  const tModule = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(`module.${key}`, options),
    [t],
  );
  const tModules = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(`modules.${key}`, options),
    [t],
  );
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [readCourseCodes, setReadCourseCodes] = useState<string[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : tModule("loadError");
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
  }, [tModule]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      getLearningProgress("anonymous").then((progress) => {
        if (!isMounted) {
          return;
        }

        setReadCourseCodes(progress.readCourseCodes);
        setCompletedCourseCodes(progress.completedCourseCodes);
      });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const selectedModule = useMemo(() => {
    if (!modules.length) {
      return null;
    }

    return modules.find((moduleItem) => moduleItem.code === moduleCode) ?? null;
  }, [moduleCode, modules]);

  const openCourse = (course: ModuleItem["courses"][number]) => {
    if (!selectedModule) {
      return;
    }

    router.push({
      pathname: "/course",
      params: {
        courseCode: course.code,
        courseTitle: course.title,
        moduleTitle: selectedModule.title,
      },
    });
  };

  const openQuiz = (quiz: ModuleItem["quizzes"][number]) => {
    router.push({
      pathname: "/quiz",
      params: {
        quizId: quiz.code,
        quizTitle: quiz.title,
        userId: "anonymous",
      },
    });
  };

  const allCoursesReadInModule = useMemo(() => {
    if (!selectedModule) {
      return false;
    }

    if (!selectedModule.courses.length) {
      return true;
    }

    const readSet = new Set([...readCourseCodes, ...completedCourseCodes]);
    return selectedModule.courses.every((course) => readSet.has(course.code));
  }, [completedCourseCodes, readCourseCodes, selectedModule]);

  const remainingCoursesToRead = useMemo(() => {
    if (!selectedModule || !selectedModule.courses.length) {
      return 0;
    }

    const readSet = new Set([...readCourseCodes, ...completedCourseCodes]);
    return selectedModule.courses.filter((course) => !readSet.has(course.code))
      .length;
  }, [completedCourseCodes, readCourseCodes, selectedModule]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>{tModule("backToSelect")}</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <Text style={typography.eyebrowWarning}>{tModule("heroEyebrow")}</Text>
        <Text style={[typography.heroTitle, styles.title]}>
          {selectedModule ? selectedModule.title : tModule("heroTitle")}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {selectedModule?.description ?? tModule("heroBody")}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>{tModule("loading")}</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : !selectedModule ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{tModule("notFound")}</Text>
        </View>
      ) : (
        <View style={styles.coursesBlock}>
          <View style={styles.sectionHeader}>
            <Text style={typography.sectionTitle}>
              {tModule("coursesTitle")}
            </Text>
            <Text style={styles.sectionMeta}>
              {selectedModule.courses.length} {tModules("courseShort")}
            </Text>
          </View>

          {selectedModule.courses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <Text style={typography.cardCode}>{course.code}</Text>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseMeta}>
                  {course.format} • {course.duration}
                </Text>
                <Text style={styles.courseObjective}>{course.objective}</Text>
              </View>

              <Pressable
                style={styles.courseButton}
                onPress={() => openCourse(course)}
              >
                <Text style={styles.courseButtonText}>
                  {tModule("openCourse")}
                </Text>
              </Pressable>
            </View>
          ))}

          <View style={styles.quizSectionHeader}>
            <Text style={typography.sectionTitle}>
              {tModule("quizzesTitle")}
            </Text>
            <Text style={styles.sectionMeta}>
              {selectedModule.quizzes.length} quiz
            </Text>
          </View>

          {!allCoursesReadInModule ? (
            <View style={styles.quizLockedHintCard}>
              <Text style={styles.quizLockedHintText}>
                {tModules("quizUnlockHint", { count: remainingCoursesToRead })}
              </Text>
            </View>
          ) : null}

          {selectedModule.quizzes.map((quiz) => (
            <View key={quiz.id} style={styles.quizCard}>
              <View style={styles.quizInfo}>
                <Text style={typography.cardCode}>{quiz.code}</Text>
                <Text style={styles.quizTitle}>{quiz.title}</Text>
                <Text style={styles.quizMeta}>{quiz.duration}</Text>
              </View>

              <Pressable
                style={[
                  styles.quizButton,
                  !allCoursesReadInModule && styles.quizButtonDisabled,
                ]}
                onPress={() => openQuiz(quiz)}
                disabled={!allCoursesReadInModule}
              >
                <Text style={styles.quizButtonText}>
                  {allCoursesReadInModule
                    ? tModule("openQuiz")
                    : tModules("locked")}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
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
  backButton: {
    alignSelf: "flex-start",
    borderRadius: scale(999),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
  },
  backButtonText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.8),
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
  coursesBlock: {
    gap: moderateScale(12),
  },
  quizSectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: moderateScale(12),
    marginTop: moderateScale(8),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: moderateScale(12),
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.8),
  },
  courseCard: {
    borderRadius: scale(18),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(16),
    gap: moderateScale(14),
  },
  courseInfo: {
    gap: moderateScale(6),
  },
  courseTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: "900",
  },
  courseMeta: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    fontWeight: "600",
  },
  courseObjective: {
    color: colors.text,
    fontSize: normalizeFont(13),
    lineHeight: verticalScale(20),
    marginTop: moderateScale(2),
  },
  courseButton: {
    alignSelf: "flex-start",
    borderRadius: scale(999),
    backgroundColor: colors.accent,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
  },
  courseButtonText: {
    color: "#ffffff",
    fontSize: normalizeFont(12),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.8),
  },
  quizCard: {
    borderRadius: scale(18),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(16),
    gap: moderateScale(14),
  },
  quizInfo: {
    gap: moderateScale(6),
  },
  quizLockedHintCard: {
    borderRadius: scale(12),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
  },
  quizLockedHintText: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    fontWeight: "700",
    lineHeight: verticalScale(18),
  },
  quizTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: "900",
  },
  quizMeta: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    fontWeight: "600",
  },
  quizButton: {
    alignSelf: "flex-start",
    borderRadius: scale(999),
    backgroundColor: colors.accent,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
  },
  quizButtonDisabled: {
    backgroundColor: colors.quizButtonLockedBg,
    borderWidth: scale(1),
    borderColor: colors.quizButtonLockedBorder,
  },
  quizButtonText: {
    color: "#ffffff",
    fontSize: normalizeFont(12),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.8),
  },
});
