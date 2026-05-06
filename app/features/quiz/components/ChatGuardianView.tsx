import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { useAppTheme } from "../../../theme/useAppTheme";
import {
  CHAT_GUARDIAN_ACTIONS,
  CHAT_GUARDIAN_CONTACTS,
  type ChatGuardianScenario,
} from "../data/chatGuardianData";
import type { QuizQuestion } from "../data/quizCatalog";

type ChatGuardianViewProps = {
  currentScenario: ChatGuardianScenario;
  currentQuestion: QuizQuestion;
  selectedForCurrent: number | undefined;
  typingMessageIndex: number;
  currentExplanation: string | null;
  isCurrentAnswerCorrect: boolean;
  isLastQuestion: boolean;
  onSelectContact: (contactName: string) => void;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion: () => void;
  tQuiz: (key: string, options?: Record<string, unknown>) => string;
};

const TypingDot = ({
  delay,
  colors,
  styles,
}: {
  delay: number;
  colors: ReturnType<typeof useAppTheme>["colors"];
  styles: ReturnType<typeof createStyles>;
}) => {
  const [opacity, setOpacity] = useState(0.5);

  useEffect(() => {
    const timer = setInterval(
      () => {
        setOpacity((prev) => (prev === 0.5 ? 1 : 0.5));
      },
      600 + delay * 200,
    );

    return () => clearInterval(timer);
  }, [delay]);

  return (
    <View
      style={[styles.typingDot, { opacity, backgroundColor: colors.textMuted }]}
    />
  );
};

const TypingIndicator = ({
  colors,
  styles,
}: {
  colors: ReturnType<typeof useAppTheme>["colors"];
  styles: ReturnType<typeof createStyles>;
}) => {
  return (
    <View
      style={[styles.typingBubble, { backgroundColor: colors.surfaceSoft }]}
    >
      <TypingDot delay={0} colors={colors} styles={styles} />
      <TypingDot delay={1} colors={colors} styles={styles} />
      <TypingDot delay={2} colors={colors} styles={styles} />
    </View>
  );
};

export function ChatGuardianView({
  currentScenario,
  currentQuestion,
  selectedForCurrent,
  typingMessageIndex,
  currentExplanation,
  isCurrentAnswerCorrect,
  isLastQuestion,
  onSelectContact,
  onSelectOption,
  onNextQuestion,
  tQuiz,
}: ChatGuardianViewProps) {
  const { colors, typography } = useAppTheme();
  const { width } = useWindowDimensions();
  const isPhone = width < 420;

  const styles = useMemo(
    () => createStyles(colors, typography, isPhone),
    [colors, typography, isPhone],
  );

  return (
    <View style={styles.board}>
      {/* Contacts Panel */}
      <View style={styles.contactsPanel}>
        <Text style={[typography.eyebrow, styles.panelEyebrow]}>
          {tQuiz("activeContacts")}
        </Text>
        <View style={styles.contactsList}>
          {CHAT_GUARDIAN_CONTACTS.map((contact) => {
            const isActiveContact =
              contact.name === currentScenario.contactName;
            return (
              <Pressable
                key={contact.name}
                onPress={() => onSelectContact(contact.name)}
                style={[
                  styles.contactRow,
                  isActiveContact && styles.contactRowActive,
                ]}
              >
                <View
                  style={[
                    styles.contactAvatarWrap,
                    isActiveContact && {
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <Text style={styles.contactAvatar}>{contact.emoji}</Text>
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[typography.statLabel, styles.contactName]}>
                    {contact.name}
                  </Text>
                  <Text style={[typography.cardMeta, styles.contactSubtitle]}>
                    {contact.subtitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.threatDot,
                    contact.threat === "safe" && {
                      backgroundColor: colors.success,
                    },
                    contact.threat === "warning" && {
                      backgroundColor: colors.warning,
                    },
                    contact.threat === "danger" && {
                      backgroundColor: colors.error,
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Chat Panel */}
      <View style={styles.chatPanel}>
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={[typography.sectionTitle, styles.contactNameHeader]}>
              {currentScenario.contactName}
            </Text>
            <Text style={[typography.cardTitle, styles.headline]}>
              {currentScenario.headline}
            </Text>
            <Text style={[typography.body, styles.intro]}>
              {currentScenario.intro}
            </Text>
          </View>
          <View
            style={[
              styles.threatChip,
              { backgroundColor: colors.warningContainer },
            ]}
          >
            <Text
              style={[
                typography.statLabel,
                { color: colors.onWarningContainer },
              ]}
            >
              {currentScenario.flags.length} {tQuiz("alerts")}
            </Text>
          </View>
        </View>

        {/* Messages Thread */}
        <View style={styles.thread}>
          {currentScenario.messages.map((message, messageIndex) => {
            const shouldShowMessage = messageIndex < typingMessageIndex;
            if (!shouldShowMessage) return null;

            return (
              <View
                key={`${message.sender}-${messageIndex}`}
                style={[
                  styles.messageBubble,
                  styles.messageIncoming,
                  { backgroundColor: colors.surfaceSoft },
                ]}
              >
                <Text style={[typography.statLabel, styles.messageSender]}>
                  {message.sender}
                </Text>
                <Text style={[typography.body, styles.messageText]}>
                  {message.text}
                </Text>
                <Text style={[typography.cardMeta, styles.messageTime]}>
                  {message.time}
                </Text>
              </View>
            );
          })}
          {typingMessageIndex < currentScenario.messages.length &&
            selectedForCurrent === undefined && (
              <TypingIndicator colors={colors} styles={styles} />
            )}
        </View>

        {/* Alert Box */}
        <View style={[styles.alertBox, { backgroundColor: colors.surface }]}>
          <Text style={[typography.sectionTitle, styles.alertTitle]}>
            {tQuiz("alertSignals")}
          </Text>
          <View style={styles.alertList}>
            {currentScenario.flags.map((flag) => (
              <Text key={flag} style={[typography.body, styles.alertItem]}>
                • {flag}
              </Text>
            ))}
          </View>
        </View>

        {/* Action Prompt */}
        <Text style={[typography.sectionTitle, styles.actionPrompt]}>
          {tQuiz("chooseBestReaction")}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedForCurrent === optionIndex;
            const isCorrectOption =
              currentQuestion.correctIndex === optionIndex;
            const showCorrectOption =
              selectedForCurrent !== undefined && isCorrectOption;
            const showWrongSelected =
              selectedForCurrent !== undefined &&
              isSelected &&
              !isCorrectOption;
            const actionMeta = CHAT_GUARDIAN_ACTIONS[optionIndex];

            return (
              <Pressable
                key={option}
                onPress={() => onSelectOption(optionIndex)}
                style={[
                  styles.actionButton,
                  isSelected && {
                    borderColor: colors.accent,
                    backgroundColor: colors.accentContainer,
                  },
                  showCorrectOption && {
                    borderColor: colors.quizItemCompletedBorder,
                    backgroundColor: colors.quizItemCompletedBg,
                  },
                  showWrongSelected && {
                    borderColor: colors.error,
                    backgroundColor: colors.surfaceSoft,
                  },
                ]}
                disabled={selectedForCurrent !== undefined}
              >
                <Text style={[typography.statValue, styles.actionIcon]}>
                  {actionMeta?.icon ?? "•"}
                </Text>
                <Text
                  style={[
                    typography.cardTitle,
                    styles.actionTitle,
                    { color: colors.text },
                  ]}
                >
                  {option}
                </Text>
                <Text
                  style={[
                    typography.cardMeta,
                    styles.actionHint,
                    { color: colors.textMuted },
                  ]}
                >
                  {actionMeta?.hint ?? ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Feedback Card */}
        {currentExplanation && (
          <View
            style={[
              styles.feedbackCard,
              isCurrentAnswerCorrect
                ? {
                    backgroundColor: colors.quizItemCompletedBg,
                    borderColor: colors.quizItemCompletedBorder,
                  }
                : {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.error,
                  },
            ]}
          >
            <Text style={[typography.sectionTitle, { color: colors.text }]}>
              {isCurrentAnswerCorrect
                ? tQuiz("correctAnswerTitle")
                : tQuiz("wrongAnswerTitle")}
            </Text>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              {currentExplanation}
            </Text>
          </View>
        )}

        {/* Auto Next Label */}
        <Text style={[typography.progressLabel, styles.autoNextLabel]}>
          {selectedForCurrent === undefined
            ? tQuiz("chooseAnswer")
            : tQuiz("readExplanation")}
        </Text>

        {/* Next Button */}
        {selectedForCurrent !== undefined && (
          <Pressable
            onPress={onNextQuestion}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.accent, shadowColor: colors.accent },
            ]}
          >
            <Text style={[typography.statValue, { color: colors.background }]}>
              {isLastQuestion ? tQuiz("showResult") : tQuiz("nextQuestion")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>["colors"],
  typography: ReturnType<typeof useAppTheme>["typography"],
  isPhone: boolean,
) =>
  StyleSheet.create({
    // Typing Indicator
    typingDot: {
      width: scale(8),
      height: scale(8),
      borderRadius: scale(4),
      marginHorizontal: scale(2),
    },
    typingBubble: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(8),
      borderRadius: scale(16),
      marginVertical: verticalScale(4),
      alignSelf: "flex-start",
      maxWidth: "70%",
    },

    // Board
    board: {
      flex: 1,
      flexDirection: isPhone ? "column" : "row",
      gap: moderateScale(12),
      backgroundColor: colors.background,
    },

    // Contacts Panel
    contactsPanel: {
      width: isPhone ? "100%" : scale(220),
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(12),
    },
    panelEyebrow: {
      marginBottom: verticalScale(8),
      color: colors.textMuted,
    },
    contactsList: {
      gap: moderateScale(6),
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(8),
      paddingVertical: moderateScale(6),
      paddingHorizontal: moderateScale(4),
      borderRadius: scale(8),
    },
    contactRowActive: {
      backgroundColor: colors.accentContainer,
    },
    contactAvatarWrap: {
      borderWidth: scale(1.5),
      borderColor: colors.border,
      borderRadius: scale(20),
      padding: moderateScale(4),
    },
    contactAvatar: {
      fontSize: normalizeFont(18),
    },
    contactTextWrap: {
      flex: 1,
    },
    contactName: {
      fontWeight: "700",
    },
    contactSubtitle: {
      fontSize: normalizeFont(11),
    },
    threatDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(5),
    },

    // Chat Panel
    chatPanel: {
      flex: 1,
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(12),
      gap: moderateScale(10),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: verticalScale(8),
    },
    headerTextWrap: {
      flex: 1,
    },
    contactNameHeader: {
      fontSize: normalizeFont(18),
    },
    headline: {
      fontSize: normalizeFont(16),
      marginVertical: verticalScale(2),
    },
    intro: {
      fontSize: normalizeFont(14),
      color: colors.textMuted,
    },
    threatChip: {
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: scale(12),
    },

    // Thread
    thread: {
      flex: 1,
      gap: moderateScale(6),
    },
    messageBubble: {
      padding: moderateScale(10),
      borderRadius: scale(12),
      maxWidth: "80%",
    },
    messageIncoming: {
      alignSelf: "flex-start",
    },
    messageSender: {
      fontSize: normalizeFont(11),
      marginBottom: verticalScale(2),
    },
    messageText: {
      fontSize: normalizeFont(14),
    },
    messageTime: {
      fontSize: normalizeFont(10),
      marginTop: verticalScale(2),
      alignSelf: "flex-end",
    },

    // Alert Box
    alertBox: {
      borderRadius: scale(10),
      padding: moderateScale(10),
    },
    alertTitle: {
      marginBottom: verticalScale(6),
    },
    alertList: {
      gap: verticalScale(4),
    },
    alertItem: {
      fontSize: normalizeFont(13),
    },

    // Actions
    actionPrompt: {
      marginTop: verticalScale(8),
    },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: moderateScale(8),
    },
    actionButton: {
      flex: 1,
      minWidth: isPhone ? "48%" : scale(140),
      borderWidth: scale(1.5),
      borderColor: colors.border,
      borderRadius: scale(10),
      padding: moderateScale(10),
      alignItems: "center",
      gap: verticalScale(4),
    },
    actionIcon: {
      fontSize: normalizeFont(20),
    },
    actionTitle: {
      textAlign: "center",
      fontSize: normalizeFont(13),
    },
    actionHint: {
      textAlign: "center",
      fontSize: normalizeFont(11),
    },

    // Feedback
    feedbackCard: {
      borderWidth: scale(1.5),
      borderRadius: scale(10),
      padding: moderateScale(12),
      gap: verticalScale(6),
    },

    // Auto Next Label
    autoNextLabel: {
      textAlign: "center",
      fontSize: normalizeFont(12),
      color: colors.textMuted,
    },

    // Primary Button
    primaryButton: {
      borderRadius: scale(12),
      paddingVertical: moderateScale(12),
      alignItems: "center",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
  });
