import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { getApiBaseUrl, getCourseByCode, getModules } from "../../../lib/api";
import { markCourseCompleted } from "../../../lib/learningProgress";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { buildCourseJourneyContent } from "../data/courseJourney";

type CourseJourneyParams = {
  courseCode?: string;
  courseTitle?: string;
  moduleTitle?: string;
  userId?: string;
  moduleCode?: string;
};

type CourseData = {
  title: string;
  moduleTitle: string;
  objective: string;
};

export function CourseJourneyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { courseCode, courseTitle, moduleTitle, userId, moduleCode } =
    useLocalSearchParams<CourseJourneyParams>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moduleCourses, setModuleCourses] = useState<
    Array<{ code: string; title: string }>
  >([]);

  const userScope = userId ?? "anonymous";

  const journeyContent = useMemo(() => {
    if (!courseData) {
      return null;
    }

    return buildCourseJourneyContent({
      moduleTitle: courseData.moduleTitle,
      courseTitle: courseData.title,
      objective: courseData.objective,
    });
  }, [courseData]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      if (!courseCode) {
        setErrorMessage(t("course.loadError"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const course = await getCourseByCode(courseCode);
        if (!isMounted) {
          return;
        }

        setCourseData({
          title: course.title,
          moduleTitle: course.module.title,
          objective: course.objective,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : t("course.loadError");
        setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
        setCourseData({
          title: courseTitle ?? courseCode,
          moduleTitle: moduleTitle ?? "Module",
          objective: t("course.fallbackObjective"),
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseCode, courseTitle, moduleTitle, t]);

  useEffect(() => {
    let isMounted = true;

    async function loadModuleCourses() {
      if (!moduleCode && !moduleTitle) {
        return;
      }

      try {
        const modules = await getModules();
        if (!isMounted) {
          return;
        }

        // Find the current module and extract its courses
        const currentModule = modules.find(
          (m) => m.code === moduleCode || m.title === moduleTitle,
        );

        if (currentModule) {
          setModuleCourses(
            currentModule.courses.map((c) => ({
              code: c.code,
              title: c.title,
            })),
          );
        }
      } catch (error) {
        // Silently fail - it's not critical for course viewing
        console.error("Failed to load module courses:", error);
      }
    }

    loadModuleCourses();

    return () => {
      isMounted = false;
    };
  }, [moduleCode, moduleTitle]);

  const goToNextCourse = () => {
    const currentCourseIndex = moduleCourses.findIndex(
      (c) => c.code === courseCode,
    );

    if (
      currentCourseIndex === -1 ||
      currentCourseIndex >= moduleCourses.length - 1
    ) {
      // No next course, go back to module
      router.back();
      return;
    }

    const nextCourse = moduleCourses[currentCourseIndex + 1];

    // Reset state and navigate to next course
    setCourseData(null);
    setIsLoading(true);
    setErrorMessage(null);
    setStepIndex(0);
    setIsCompleted(false);

    router.push({
      pathname: "/course",
      params: {
        courseCode: nextCourse.code,
        courseTitle: nextCourse.title,
        moduleTitle: moduleTitle,
        userId: userScope,
        moduleCode: moduleCode,
      },
    });
  };

  const pages = useMemo(() => {
    if (!courseData || !journeyContent) {
      return [];
    }

    return [
      {
        id: "objective",
        label: t("course.stepObjective"),
        title: t("course.objectivePageTitle"),
        body: courseData.objective,
      },
      {
        id: "introduction",
        label: t("course.stepIntroduction"),
        title: journeyContent.introductionTitle,
        body: journeyContent.introductionParagraphs,
      },
      {
        id: "takeaway",
        label: t("course.stepTakeaway"),
        title: journeyContent.takeawayTitle,
        body: journeyContent.takeawayBullets,
      },
    ] as const;
  }, [courseData, journeyContent, t]);

  const currentPage = pages[stepIndex];

  const goNext = () => {
    if (!pages.length) {
      return;
    }

    if (stepIndex >= pages.length - 1) {
      setIsCompleted(true);
      if (courseCode) {
        void markCourseCompleted(courseCode, userScope);
      }
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const goPrevious = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const nextCourseCode = useMemo(() => {
    const currentCourseIndex = moduleCourses.findIndex(
      (c) => c.code === courseCode,
    );

    if (
      currentCourseIndex === -1 ||
      currentCourseIndex >= moduleCourses.length - 1
    ) {
      return null;
    }

    return moduleCourses[currentCourseIndex + 1]?.code;
  }, [moduleCourses, courseCode]);

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{t("course.loading")}</Text>
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>
          {errorMessage ?? t("course.loadError")}
        </Text>
      </View>
    );
  }

  if (!currentPage && !errorMessage) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>{t("course.loadError")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{t("course.heroEyebrow")}</Text>
        <Text style={[typography.screenTitle, styles.title]}>
          {courseData?.title ?? courseTitle ?? courseCode}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {t("course.moduleLabel", {
            moduleTitle: courseData?.moduleTitle ?? moduleTitle ?? "Module",
          })}
        </Text>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>

      <View style={styles.stepTrack}>
        {pages.map((page, index) => (
          <View
            key={page.id}
            style={[
              styles.stepChip,
              index === stepIndex && styles.stepChipActive,
            ]}
          >
            <Text
              style={[
                styles.stepChipText,
                index === stepIndex && styles.stepChipTextActive,
              ]}
            >
              {page.label}
            </Text>
          </View>
        ))}
      </View>

      {!isCompleted ? (
        <View style={styles.pageCard}>
          <Text style={typography.eyebrowWarning}>{currentPage?.label}</Text>
          <Text style={styles.pageTitle}>{currentPage?.title}</Text>

          {stepIndex === 0 ? (
            <View style={styles.objectiveBox}>
              <Text style={styles.objectiveText}>
                {currentPage?.body as string}
              </Text>
            </View>
          ) : Array.isArray(currentPage?.body) ? (
            <View style={styles.listBlock}>
              {(currentPage.body as string[]).map((paragraph) => (
                <View key={paragraph} style={styles.paragraphBlock}>
                  <View style={styles.bullet} />
                  <Text style={styles.paragraphText}>{paragraph}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            <Pressable
              style={[
                styles.secondaryButton,
                stepIndex === 0 && styles.secondaryButtonDisabled,
              ]}
              onPress={goPrevious}
              disabled={stepIndex === 0}
            >
              <Text style={styles.secondaryButtonText}>
                {t("course.previous")}
              </Text>
            </Pressable>

            <Pressable style={styles.primaryButton} onPress={goNext}>
              <Text style={styles.primaryButtonText}>
                {stepIndex === pages.length - 1
                  ? t("course.finishCourse")
                  : t("course.nextStep")}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.completionCard}>
          <Text style={typography.eyebrowWarning}>
            {t("course.completedEyebrow")}
          </Text>
          <Text style={styles.completionTitle}>
            {t("course.completedTitle")}
          </Text>
          <Text style={styles.completionText}>
            {t("course.completedSummary")}
          </Text>

          <View style={styles.completionImageBlock}>
            <Image
              source={require("../../../../assets/images/cyber_guardian.png")}
              style={styles.completionImage}
              resizeMode="contain"
            />
          </View>

          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>
              {t("course.backToModule")}
            </Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={goToNextCourse}>
            <Text style={styles.primaryButtonText}>
              {nextCourseCode
                ? t("course.nextCourse", { code: nextCourseCode })
                : t("course.finishCourse")}
            </Text>
          </Pressable>
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
  backButton: {
    alignSelf: "flex-start",
    borderRadius: scale(999),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
  },
  backButtonText: {
    color: colors.text,
    fontSize: normalizeFont(11),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.6),
  },
  errorText: {
    color: colors.error,
    fontSize: normalizeFont(13),
    fontWeight: "700",
    textAlign: "center",
  },
  heroCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(18),
    gap: moderateScale(10),
  },
  title: {
    marginTop: moderateScale(8),
  },
  body: {
    marginTop: moderateScale(2),
  },
  stepTrack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
  },
  stepChip: {
    borderRadius: scale(999),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
  },
  stepChipActive: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.accent,
  },
  stepChipText: {
    color: colors.textMuted,
    fontSize: normalizeFont(12),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.6),
  },
  stepChipTextActive: {
    color: colors.accent,
  },
  pageCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(18),
    gap: moderateScale(14),
  },
  pageTitle: {
    color: colors.text,
    fontSize: normalizeFont(22),
    fontWeight: "900",
    lineHeight: verticalScale(28),
  },
  objectiveBox: {
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: moderateScale(16),
  },
  objectiveText: {
    color: colors.text,
    fontSize: normalizeFont(15),
    lineHeight: verticalScale(23),
  },
  listBlock: {
    gap: moderateScale(12),
  },
  paragraphBlock: {
    flexDirection: "row",
    gap: moderateScale(10),
    alignItems: "flex-start",
  },
  bullet: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(999),
    marginTop: verticalScale(7),
    backgroundColor: colors.accent,
  },
  paragraphText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: normalizeFont(14),
    lineHeight: verticalScale(22),
  },
  actionsRow: {
    flexDirection: "row",
    gap: moderateScale(12),
    marginTop: moderateScale(8),
  },
  secondaryButton: {
    flex: 1,
    borderRadius: scale(14),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingVertical: moderateScale(12),
    alignItems: "center",
  },
  secondaryButtonDisabled: {
    opacity: 0.45,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.7),
  },
  primaryButton: {
    flex: 1,
    borderRadius: scale(14),
    backgroundColor: colors.accent,
    paddingVertical: moderateScale(12),
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: normalizeFont(12),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.7),
  },
  completionCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(18),
    gap: moderateScale(12),
  },
  completionTitle: {
    color: colors.text,
    fontSize: normalizeFont(22),
    fontWeight: "900",
  },
  completionText: {
    color: colors.textMuted,
    fontSize: normalizeFont(14),
    lineHeight: verticalScale(22),
  },
  completionImageBlock: {
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  completionImage: {
    width: scale(120),
    height: scale(120),
  },
});
