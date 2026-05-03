import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CHAT_GUARDIAN_ACTIONS, CHAT_GUARDIAN_CONTACTS, type ChatGuardianScenario } from '../data/chatGuardianData';
import type { QuizQuestion } from '../data/quizCatalog';
import { chatGuardianStyles } from './ChatGuardianView.styles';

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
  styles: {
    feedbackCard: any;
    feedbackCardSuccess: any;
    feedbackCardError: any;
    feedbackTitle: any;
    feedbackBody: any;
    autoNextLabel: any;
    primaryButton: any;
    primaryButtonText: any;
  };
};

const TypingDot = ({ delay }: { delay: number }) => {
  const [opacity, setOpacity] = useState(0.5);

  useEffect(() => {
    const timer = setInterval(() => {
      setOpacity((prev) => (prev === 0.5 ? 1 : 0.5));
    }, 600 + delay * 200);

    return () => clearInterval(timer);
  }, [delay]);

  return <View style={[chatGuardianStyles.chatGuardianTypingDot, { opacity }]} />;
};

const TypingIndicator = () => {
  return (
    <View style={chatGuardianStyles.chatGuardianTypingBubble}>
      <TypingDot delay={0} />
      <TypingDot delay={1} />
      <TypingDot delay={2} />
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
    styles,
}: ChatGuardianViewProps) {
  return (
    <View style={chatGuardianStyles.chatGuardianBoard}>
      <View style={chatGuardianStyles.chatGuardianContactsPanel}>
        <Text style={chatGuardianStyles.chatGuardianPanelEyebrow}>Contacts actifs</Text>
        <View style={chatGuardianStyles.chatGuardianContactsList}>
          {CHAT_GUARDIAN_CONTACTS.map((contact) => {
            const isActiveContact = contact.name === currentScenario.contactName;
            return (
              <Pressable
                key={contact.name}
                onPress={() => onSelectContact(contact.name)}
                style={[chatGuardianStyles.chatGuardianContactRow, isActiveContact && chatGuardianStyles.chatGuardianContactRowActive]}
              >
                <View style={chatGuardianStyles.chatGuardianContactAvatarWrap}>
                  <Text style={chatGuardianStyles.chatGuardianContactAvatar}>{contact.emoji}</Text>
                </View>
                <View style={chatGuardianStyles.chatGuardianContactTextWrap}>
                  <Text style={chatGuardianStyles.chatGuardianContactName}>{contact.name}</Text>
                  <Text style={chatGuardianStyles.chatGuardianContactSubtitle}>{contact.subtitle}</Text>
                </View>
                <View
                  style={[
                    chatGuardianStyles.chatGuardianThreatDot,
                    contact.threat === 'safe'
                      ? chatGuardianStyles.chatGuardianThreatSafe
                      : contact.threat === 'warning'
                        ? chatGuardianStyles.chatGuardianThreatWarning
                        : chatGuardianStyles.chatGuardianThreatDanger,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={chatGuardianStyles.chatGuardianChatPanel}>
        <View style={chatGuardianStyles.chatGuardianHeader}>
          <View style={chatGuardianStyles.chatGuardianHeaderTextWrap}>
            <Text style={chatGuardianStyles.chatGuardianContactName}>{currentScenario.contactName}</Text>
            <Text style={chatGuardianStyles.chatGuardianHeadline}>{currentScenario.headline}</Text>
            <Text style={chatGuardianStyles.chatGuardianIntro}>{currentScenario.intro}</Text>
          </View>
          <View style={chatGuardianStyles.chatGuardianThreatChip}>
            <Text style={chatGuardianStyles.chatGuardianThreatChipText}>{currentScenario.flags.length} alertes</Text>
          </View>
        </View>

        <View style={chatGuardianStyles.chatGuardianThread}>
          {currentScenario.messages.map((message, messageIndex) => {
            const shouldShowMessage = messageIndex < typingMessageIndex;

            if (!shouldShowMessage) {
              return null;
            }

            return (
              <View key={`${message.sender}-${messageIndex}`} style={[chatGuardianStyles.chatGuardianMessageBubble, chatGuardianStyles.chatGuardianMessageIncoming]}>
                <Text style={chatGuardianStyles.chatGuardianMessageSender}>{message.sender}</Text>
                <Text style={chatGuardianStyles.chatGuardianMessageText}>{message.text}</Text>
                <Text style={chatGuardianStyles.chatGuardianMessageTime}>{message.time}</Text>
              </View>
            );
          })}
          {typingMessageIndex < currentScenario.messages.length && selectedForCurrent === undefined ? (
            <TypingIndicator />
          ) : null}
        </View>

        <View style={chatGuardianStyles.chatGuardianAlertBox}>
          <Text style={chatGuardianStyles.chatGuardianAlertTitle}>Signaux d alerte</Text>
          <View style={chatGuardianStyles.chatGuardianAlertList}>
            {currentScenario.flags.map((flag) => (
              <Text key={flag} style={chatGuardianStyles.chatGuardianAlertItem}>• {flag}</Text>
            ))}
          </View>
        </View>

        <Text style={chatGuardianStyles.chatGuardianActionPrompt}>Choisis la meilleure réaction</Text>

        <View style={chatGuardianStyles.chatGuardianActions}>
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedForCurrent === optionIndex;
            const isCorrectOption = currentQuestion.correctIndex === optionIndex;
            const showCorrectOption = selectedForCurrent !== undefined && isCorrectOption;
            const showWrongSelected = selectedForCurrent !== undefined && isSelected && !isCorrectOption;
            const actionMeta = CHAT_GUARDIAN_ACTIONS[optionIndex];

            return (
              <Pressable
                key={option}
                onPress={() => onSelectOption(optionIndex)}
                style={[
                  chatGuardianStyles.chatGuardianActionButton,
                  isSelected && chatGuardianStyles.chatGuardianActionButtonSelected,
                  showCorrectOption && chatGuardianStyles.chatGuardianActionButtonCorrect,
                  showWrongSelected && chatGuardianStyles.chatGuardianActionButtonWrong,
                ]}
                disabled={selectedForCurrent !== undefined}
              >
                <Text style={chatGuardianStyles.chatGuardianActionIcon}>{actionMeta?.icon ?? '•'}</Text>
                <Text style={[chatGuardianStyles.chatGuardianActionTitle, isSelected && chatGuardianStyles.chatGuardianActionTitleSelected]}>{option}</Text>
                <Text style={[chatGuardianStyles.chatGuardianActionHint, isSelected && chatGuardianStyles.chatGuardianActionHintSelected]}>{actionMeta?.hint ?? ''}</Text>
              </Pressable>
            );
          })}
        </View>

        {currentExplanation ? (
          <View style={[styles.feedbackCard, isCurrentAnswerCorrect ? styles.feedbackCardSuccess : styles.feedbackCardError]}>
            <Text style={styles.feedbackTitle}>
              {isCurrentAnswerCorrect ? tQuiz('correctAnswerTitle') : tQuiz('wrongAnswerTitle')}
            </Text>
            <Text style={styles.feedbackBody}>{currentExplanation}</Text>
          </View>
        ) : null}

        <Text style={styles.autoNextLabel}>
          {selectedForCurrent === undefined ? tQuiz('chooseAnswer') : tQuiz('readExplanation')}
        </Text>

        {selectedForCurrent !== undefined ? (
          <Pressable onPress={onNextQuestion} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {isLastQuestion ? tQuiz('showResult') : tQuiz('nextQuestion')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
