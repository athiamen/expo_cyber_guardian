import { RouteProp, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { getApiBaseUrl, getQuizByCode } from "../../../lib/api";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { ModulesStackParamList } from "../../../navigation/types";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import type { QuizDifficulty } from "../data/quizCatalogData";
import { ChatGuardianQuizScreen } from "./ChatGuardianQuizScreen";
import { ClassicQuizScreen } from "./ClassicQuizScreen";
import { FirewallDefenderQuizScreen } from "./FirewallDefenderQuizScreen";

type QuizScreenProps = {
  token?: string;
  userId: string;
};

export function QuizScreen({ token, userId }: QuizScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isPhone = width < 420;
  const tQuiz = (key: string, options?: Record<string, unknown>) =>
    t(`quiz.${key}`, options);

  const route = useRoute<RouteProp<ModulesStackParamList, "QuizDetails">>();
  const requestedQuizId = route.params?.quizId ?? "Q1";
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>(
    route.params?.difficulty ?? "easy",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quiz type detection
  const isChatGuardianGame = requestedQuizId === "Q4";
  const isFirewallDefenderGame = requestedQuizId === "Q6";

  useEffect(() => {
    setSelectedDifficulty(route.params?.difficulty ?? "easy");
  }, [requestedQuizId, route.params?.difficulty]);

  // Load quiz metadata
  useEffect(() => {
    let isMounted = true;

    async function loadQuizMetadata() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        await getQuizByCode(requestedQuizId);
        if (!isMounted) {
          return;
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : tQuiz("loadError");
        setErrorMessage(
          `${message} (API: ${getApiBaseUrl()}). ${tQuiz("localDataUsed")}`,
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuizMetadata();

    return () => {
      isMounted = false;
    };
  }, [requestedQuizId, t]);

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>{tQuiz("loading")}</Text>
      </View>
    );
  }

  const quizTitle = route.params?.quizTitle ?? "Quiz";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>{t("course.previous")}</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={[typography.screenTitle, styles.title]}>
            {quizTitle}
          </Text>
          <View
            style={[
              styles.difficultySelector,
              isPhone && styles.difficultySelectorPhone,
            ]}
          >
            {(["easy", "medium", "hard"] as QuizDifficulty[]).map(
              (difficulty) => {
                const isActive = selectedDifficulty === difficulty;
                const label =
                  difficulty === "easy"
                    ? "Facile"
                    : difficulty === "medium"
                      ? "Moyen"
                      : "Difficile";

                return (
                  <Pressable
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      isPhone && styles.difficultyButtonPhone,
                      isActive && styles.difficultyButtonActive,
                    ]}
                    onPress={() => setSelectedDifficulty(difficulty)}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        isPhone && styles.difficultyButtonTextPhone,
                        isActive && styles.difficultyButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>
          {errorMessage ? (
            <Text style={styles.warningText}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>

      {isChatGuardianGame ? (
        <ChatGuardianQuizScreen
          userId={userId}
          requestedQuizId={requestedQuizId}
          selectedDifficulty={selectedDifficulty}
        />
      ) : isFirewallDefenderGame ? (
        <FirewallDefenderQuizScreen
          userId={userId}
          requestedQuizId={requestedQuizId}
          selectedDifficulty={selectedDifficulty}
        />
      ) : (
        <ClassicQuizScreen
          token={token}
          userId={userId}
          requestedQuizId={requestedQuizId}
          selectedDifficulty={selectedDifficulty}
        />
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
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(36),
    gap: moderateScale(10),
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
  heroCard: {
    borderRadius: scale(14),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
  },
  heroTextWrap: {
    flex: 1,
  },
  title: {
    marginTop: 0,
    fontSize: normalizeFont(24),
    lineHeight: verticalScale(30),
  },
  difficultySelector: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: moderateScale(6),
    marginTop: moderateScale(8),
    width: "100%",
  },
  difficultySelectorPhone: {
    flexWrap: "wrap",
    gap: moderateScale(10),
  },
  difficultyButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: scale(1),
    borderColor: "#d1d5db",
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(6),
    minHeight: verticalScale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  difficultyButtonPhone: {
    minHeight: verticalScale(38),
    justifyContent: "center",
    paddingHorizontal: moderateScale(8),
  },
  difficultyButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderWidth: scale(2),
  },
  difficultyButtonText: {
    color: colors.text,
    fontSize: normalizeFont(10),
    fontWeight: "800",
    letterSpacing: moderateScale(0.2),
    textTransform: "uppercase",
  },
  difficultyButtonTextPhone: {
    fontSize: normalizeFont(11),
  },
  difficultyButtonTextActive: {
    color: colors.surface,
    fontWeight: "900",
  },
  warningText: {
    marginTop: moderateScale(6),
    color: "#ffb9b9",
    fontSize: normalizeFont(11),
    lineHeight: verticalScale(16),
  },
});
