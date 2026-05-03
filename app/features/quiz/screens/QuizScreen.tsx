import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
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
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextWrap}>
            <Text style={typography.eyebrow}>{tQuiz("heroEyebrow")}</Text>
            <Text style={[typography.screenTitle, styles.title]}>
              {quizTitle}
            </Text>
            <Text style={[typography.body, styles.body]}>
              {tQuiz("heroBody")}
            </Text>
            <View style={styles.difficultySelector}>
              {(["easy", "medium", "hard"] as QuizDifficulty[]).map(
                (difficulty) => {
                  const isActive = selectedDifficulty === difficulty;
                  const label =
                    difficulty === "easy"
                      ? "Débutant"
                      : difficulty === "medium"
                        ? "Intermediaire"
                        : "Expert";

                  return (
                    <Pressable
                      key={difficulty}
                      style={[
                        styles.difficultyButton,
                        isActive && styles.difficultyButtonActive,
                      ]}
                      onPress={() => setSelectedDifficulty(difficulty)}
                    >
                      <Text
                        style={[
                          styles.difficultyButtonText,
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
            <View style={styles.quizContextChip}>
              <Text style={styles.quizContextText}>
                {quizTitle} • {requestedQuizId}
              </Text>
            </View>
            {errorMessage ? (
              <Text style={styles.warningText}>{errorMessage}</Text>
            ) : null}
          </View>
          <Image
            source={require("../../../../assets/images/cyber_guardian.png")}
            style={styles.heroImage}
          />
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
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: moderateScale(14),
  },
  heroTextWrap: {
    flex: 1,
  },
  title: {
    marginTop: moderateScale(8),
  },
  body: {
    marginTop: moderateScale(10),
    maxWidth: scale(320),
  },
  difficultySelector: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: moderateScale(8),
    marginTop: moderateScale(12),
    width: "100%",
  },
  difficultyButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: scale(2),
    borderColor: "#d1d5db",
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(8),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  difficultyButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderWidth: 3,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
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
    fontWeight: "900",
  },
  heroImage: {
    width: scale(220),
    maxWidth: "42%",
    height: verticalScale(160),
    borderRadius: scale(12),
    resizeMode: "cover",
  },
  quizContextChip: {
    marginTop: moderateScale(10),
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
  },
  quizContextText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: "700",
    letterSpacing: moderateScale(0.2),
  },
  warningText: {
    marginTop: moderateScale(8),
    color: "#ffb9b9",
    fontSize: normalizeFont(12),
    lineHeight: verticalScale(18),
  },
});
