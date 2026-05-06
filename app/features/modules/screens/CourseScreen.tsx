import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { getApiBaseUrl, getCourseByCode, getModules } from "../../../lib/api";
import {
  markCourseCompleted,
  markCourseRead,
} from "../../../lib/learningProgress";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { ModulesStackParamList } from "../../../navigation/types";
import { useAppTheme } from "../../../theme/useAppTheme";
import { getCourseSections } from "../data/courseSections";

type CourseScreenProps = {
  userId: string;
};

export function CourseScreen({ userId }: CourseScreenProps) {
  const { t } = useTranslation();

  const tCourse = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(`course.${key}`, options) as string,
    [t],
  );

  const tCommon = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(`common.${key}`, options) as string,
    [t],
  );

  const navigation =
    useNavigation<NativeStackNavigationProp<ModulesStackParamList>>();
  const route = useRoute<RouteProp<ModulesStackParamList, "CourseDetails">>();
  const { courseCode, courseTitle, moduleTitle, autoStart } = route.params;

  const [courseStarted, setCourseStarted] = useState(Boolean(autoStart));
  const [currentStep, setCurrentStep] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<{
    title: string;
    moduleTitle: string;
    format: string;
    duration: string;
    objective: string;
  } | null>(null);
  const [nextCourse, setNextCourse] = useState<{
    code: string;
    title: string;
    moduleTitle: string;
  } | null>(null);
  const { width } = useWindowDimensions();
  const isNarrow = width < 760;
  const { colors, typography } = useAppTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const objectiveSectionY = useRef(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [course, modules] = await Promise.all([
          getCourseByCode(courseCode),
          getModules(),
        ]);
        if (!isMounted) {
          return;
        }

        setCourseData({
          title: course.title,
          moduleTitle: course.module.title,
          format: course.format,
          duration: course.duration,
          objective: course.objective,
        });

        const selectedModule = modules.find(
          (moduleItem) => moduleItem.code === course.module.code,
        );
        if (!selectedModule) {
          setNextCourse(null);
          return;
        }

        const orderedCourses = [...selectedModule.courses].sort(
          (first, second) =>
            first.code.localeCompare(second.code, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
        );

        const currentCourseIndex = orderedCourses.findIndex(
          (item) => item.code === course.code,
        );
        const followingCourse =
          currentCourseIndex >= 0
            ? orderedCourses[currentCourseIndex + 1]
            : undefined;

        setNextCourse(
          followingCourse
            ? {
                code: followingCourse.code,
                title: followingCourse.title,
                moduleTitle: selectedModule.title,
              }
            : null,
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : tCourse("loadError");
        setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
        setCourseData({
          title: courseTitle ?? courseCode,
          moduleTitle: moduleTitle ?? "Module",
          format: tCommon("na"),
          duration: tCommon("na"),
          objective: tCourse("fallbackObjective"),
        });
        setNextCourse(null);
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
  }, [courseCode, courseTitle, moduleTitle, tCourse, tCommon]);

  const sections = useMemo(() => {
    return getCourseSections({
      moduleTitle: courseData?.moduleTitle ?? moduleTitle ?? "Module",
      courseTitle: courseData?.title ?? courseTitle ?? courseCode,
      objective: courseData?.objective ?? tCourse("objectiveUnavailable"),
    });
  }, [courseCode, courseData, courseTitle, moduleTitle, tCourse]);
  const activeSection = sections[currentStep];
  const progress = Math.round(
    ((currentStep + (courseStarted ? 1 : 0)) / sections.length) * 100,
  );

  useEffect(() => {
    if (!courseStarted || courseCompleted) {
      return;
    }

    fadeAnim.setValue(0);
    translateAnim.setValue(16);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [courseCompleted, courseStarted, currentStep, fadeAnim, translateAnim]);

  useEffect(() => {
    if (!courseStarted) {
      return;
    }

    void markCourseRead(courseCode, userId);
  }, [courseCode, courseStarted, userId]);

  const startCourse = () => {
    void markCourseRead(courseCode, userId);
    setCourseStarted(true);
    setCourseCompleted(false);
    setCurrentStep(0);
  };

  const goToNextStep = () => {
    if (currentStep === sections.length - 1) {
      void markCourseCompleted(courseCode, userId);
      setCourseCompleted(true);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const restartCourse = () => {
    setCourseCompleted(false);
    setCurrentStep(0);
    setCourseStarted(true);
  };

  const goToNextCourse = () => {
    if (!nextCourse) {
      return;
    }

    navigation.push("CourseDetails", {
      courseCode: String(nextCourse.code ?? ""),
      courseTitle: String(nextCourse.title ?? ""),
      moduleTitle: String(nextCourse.moduleTitle ?? ""),
      autoStart: true,
    });
  };

  const goToCourseVideo = () => {
    navigation.navigate("CourseVideo", {
      courseCode: String(courseCode ?? ""),
      courseTitle: String(courseData?.title ?? courseTitle ?? ""),
      moduleTitle: String(courseData?.moduleTitle ?? moduleTitle ?? ""),
    });
  };

  const goToReferenceSection = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(objectiveSectionY.current - 12, 0),
      animated: true,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tCourse("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{tCourse("heroEyebrow")}</Text>
        <Text style={[typography.screenTitle, styles.title]}>
          {courseData?.title ?? courseTitle ?? courseCode}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {tCourse("moduleLabel", {
            moduleTitle: courseData?.moduleTitle ?? moduleTitle ?? "Module",
          })}
        </Text>
        <View style={styles.statusChip}>
          <Text style={styles.statusChipText}>
            {courseCompleted
              ? tCourse("status.completed")
              : courseStarted
                ? tCourse("status.inProgress")
                : tCourse("status.ready")}
          </Text>
        </View>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Pressable style={styles.metaCard} onPress={goToReferenceSection}>
          <Text style={typography.statValue}>{courseCode}</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tCourse("reference")}
          </Text>
        </Pressable>
        <Pressable style={styles.metaCard} onPress={goToCourseVideo}>
          <Text style={styles.videoCta}>▶</Text>
          <Text style={[typography.statLabel, styles.statLabel]}>
            {tCourse("video")}
          </Text>
        </Pressable>
      </View>

      <View style={styles.learningColumn}>
        <View style={styles.learningColumnsRow}>
          <View style={styles.learningColumnItem}>
            <View
              style={styles.sectionCard}
              onLayout={(event) => {
                objectiveSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              <Text style={typography.eyebrowWarning}>
                {tCourse("objectiveEyebrow")}
              </Text>
              <Text style={styles.sectionBody}>
                {courseData?.objective ?? tCourse("objectiveUnavailable")}
              </Text>
            </View>
          </View>

          <View style={styles.learningColumnItem}>
            {courseStarted ? (
              <View style={styles.timelineCard}>
                <View style={styles.timelineHeader}>
                  <Text style={typography.eyebrowWarning}>
                    {tCourse("timelineEyebrow")}
                  </Text>
                  <Text style={styles.timelineMeta}>
                    {tCourse("stepMeta", {
                      current: Math.min(currentStep + 1, sections.length),
                      total: sections.length,
                    })}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${courseCompleted ? 100 : progress}%` },
                    ]}
                  />
                </View>
                <View style={styles.sectionPills}>
                  {sections.map((section, index) => (
                    <View
                      key={section.id}
                      style={[
                        styles.sectionPill,
                        index <= currentStep && styles.sectionPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sectionPillText,
                          index <= currentStep && styles.sectionPillTextActive,
                        ]}
                      >
                        {section.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.sectionCard}>
                <Text style={typography.eyebrowWarning}>
                  {tCourse("startEyebrow")}
                </Text>
                <Text style={styles.sectionBody}>{tCourse("startBody")}</Text>
                <Pressable style={styles.startButton} onPress={startCourse}>
                  <Text style={styles.startButtonText}>{tCourse("start")}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {courseStarted ? (
          <>
            {courseCompleted ? (
              <View style={styles.sectionCard}>
                <Text style={typography.eyebrowWarning}>
                  {tCourse("completedEyebrow")}
                </Text>
                <Text style={styles.completionValue}>100%</Text>
                <Text style={styles.sectionBody}>
                  {tCourse("completedBody", {
                    courseTitle: courseData?.title ?? courseTitle ?? courseCode,
                  })}
                </Text>
                <Pressable style={styles.startButton} onPress={restartCourse}>
                  <Text style={styles.startButtonText}>
                    {tCourse("review")}
                  </Text>
                </Pressable>
                {nextCourse ? (
                  <Pressable
                    style={styles.completionNextButton}
                    onPress={goToNextCourse}
                  >
                    <Text style={styles.completionNextButtonText}>
                      {tCourse("nextCourse", { code: nextCourse.code })}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Animated.View
                style={[
                  styles.sectionCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: translateAnim }],
                  },
                ]}
              >
                <Text style={typography.eyebrowWarning}>
                  {activeSection.label}
                </Text>
                <Text style={styles.stepTitle}>{activeSection.title}</Text>
                <Text style={styles.sectionBody}>{activeSection.body}</Text>

                <View style={styles.validationInsightsColumn}>
                  <View style={styles.developmentCard}>
                    <Text style={styles.developmentLabel}>
                      {tCourse("development")}
                    </Text>
                    <View
                      style={[
                        styles.developmentList,
                        isNarrow && { width: "100%" },
                      ]}
                    >
                      {activeSection.development.map((paragraph) => (
                        <Text key={paragraph} style={styles.developmentBody}>
                          {paragraph}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View style={styles.keyPointCard}>
                    <Text style={styles.keyPointLabel}>
                      {tCourse("takeaway")}
                    </Text>
                    <View
                      style={[
                        styles.takeawayList,
                        isNarrow && { width: "100%" },
                      ]}
                    >
                      {activeSection.takeaway.map((item) => (
                        <View key={item} style={styles.takeawayItem}>
                          <View style={styles.takeawayBullet} />
                          <Text style={styles.keyPointBody}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[
                      styles.secondaryButton,
                      currentStep === 0 && styles.secondaryButtonDisabled,
                    ]}
                    onPress={goToPreviousStep}
                    disabled={currentStep === 0}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {tCourse("previous")}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.startButton} onPress={goToNextStep}>
                    <Text style={styles.startButtonText}>
                      {currentStep === sections.length - 1
                        ? tCourse("finishCourse")
                        : tCourse("nextStep")}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: moderateScale(24),
      paddingTop: moderateScale(24),
      paddingBottom: moderateScale(36),
      gap: moderateScale(14),
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
      textAlign: "left",
      fontWeight: "bold",
    },
    errorText: {
      marginTop: moderateScale(8),
      color: colors.error,
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
    statusChip: {
      marginTop: moderateScale(10),
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(6),
    },
    statusChipText: {
      color: colors.text,
      fontSize: normalizeFont(12),
      fontWeight: "700",
    },
    metaRow: {
      flexDirection: "row",
      gap: moderateScale(10),
    },
    metaCard: {
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
    videoCta: {
      color: colors.accent,
      fontSize: normalizeFont(28),
      fontWeight: "900",
      lineHeight: verticalScale(32),
    },
    sectionCard: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(8),
    },
    learningColumn: {
      flexDirection: "column",
      gap: moderateScale(14),
    },
    learningColumnsRow: {
      flexDirection: "row",
      gap: moderateScale(14),
      alignItems: "flex-start",
    },
    learningColumnItem: {
      flex: 1,
    },
    timelineCard: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(14),
      gap: moderateScale(12),
    },
    timelineHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: moderateScale(10),
    },
    timelineMeta: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      fontWeight: "700",
    },
    progressTrack: {
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
    sectionPills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: moderateScale(8),
    },
    sectionPill: {
      borderRadius: 999,
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(6),
    },
    sectionPillActive: {
      borderColor: colors.accent,
    },
    sectionPillText: {
      color: colors.textMuted,
      fontSize: normalizeFont(11),
      fontWeight: "700",
    },
    sectionPillTextActive: {
      color: colors.accent,
    },
    stepTitle: {
      color: colors.text,
      fontSize: normalizeFont(20),
      fontWeight: "900",
      letterSpacing: moderateScale(-0.4),
    },
    sectionBody: {
      color: colors.textMuted,
      fontSize: normalizeFont(14),
      lineHeight: verticalScale(21),
    },
    validationInsightsColumn: {
      flexDirection: "row",
      gap: moderateScale(10),
      height: "100%",
      width: "100%",
    },
    keyPointCard: {
      marginTop: moderateScale(4),
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: moderateScale(12),
      gap: moderateScale(10),
      width: "50%",
    },
    developmentCard: {
      marginTop: moderateScale(4),
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: moderateScale(12),
      gap: moderateScale(8),
      width: "49%",
    },
    developmentLabel: {
      color: colors.development,
      fontSize: normalizeFont(12),
      fontWeight: "800",
      letterSpacing: moderateScale(0.3),
      textTransform: "uppercase",
    },
    developmentList: {
      gap: moderateScale(10),
    },
    developmentBody: {
      color: colors.text,
      fontSize: normalizeFont(13),
      lineHeight: verticalScale(20),
    },
    keyPointLabel: {
      color: colors.warning,
      fontSize: normalizeFont(12),
      fontWeight: "800",
      letterSpacing: moderateScale(0.3),
      textTransform: "uppercase",
    },
    takeawayList: {
      gap: moderateScale(6),
    },
    takeawayItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: moderateScale(8),
    },
    takeawayBullet: {
      marginTop: moderateScale(6),
      width: scale(6),
      height: scale(6),
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    keyPointBody: {
      flex: 1,
      color: colors.text,
      fontSize: normalizeFont(13),
      lineHeight: verticalScale(19),
    },
    actionsRow: {
      marginTop: moderateScale(4),
      flexDirection: "row",
      gap: moderateScale(10),
    },
    startButton: {
      flex: 1,
      borderRadius: scale(12),
      backgroundColor: colors.accent,
      paddingVertical: moderateScale(12),
      alignItems: "center",
    },
    startButtonText: {
      color: colors.background,
      fontSize: normalizeFont(14),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
    },
    secondaryButton: {
      flex: 1,
      borderRadius: scale(12),
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
      fontSize: normalizeFont(14),
      fontWeight: "700",
    },
    completionNextButton: {
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingVertical: moderateScale(12),
      alignItems: "center",
    },
    completionNextButtonText: {
      color: colors.text,
      fontSize: normalizeFont(14),
      fontWeight: "700",
    },
    completionValue: {
      color: colors.accent,
      fontSize: normalizeFont(42),
      fontWeight: "900",
      letterSpacing: moderateScale(-0.8),
    },
  });
