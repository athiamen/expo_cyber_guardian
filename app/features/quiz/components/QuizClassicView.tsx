import { Pressable, Text, View } from 'react-native';
import { typography } from '../../../theme/typography';
import type { QuizQuestion } from '../data/quizCatalog';
import type { QuestionEvent } from '../constants/quizGameConstants';
import { quizClassicStyles } from './QuizClassicView.styles';

type QuizClassicViewProps = {
  currentQuestion: QuizQuestion;
  currentQuestionEvent: QuestionEvent | null;
  selectedForCurrent: number | undefined;
  currentExplanation: string | null;
  isCurrentAnswerCorrect: boolean;
  isLastQuestion: boolean;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion: () => void;
  tQuiz: (key: string, options?: Record<string, unknown>) => string;
  styles: any;
};

export function QuizClassicView({
  currentQuestion,
  currentQuestionEvent,
  selectedForCurrent,
  currentExplanation,
  isCurrentAnswerCorrect,
  isLastQuestion,
  onSelectOption,
  onNextQuestion,
  tQuiz,
  styles,
}: QuizClassicViewProps) {
  return (
    <>
      {currentQuestionEvent ? (
        <View style={quizClassicStyles.questionEventCard}>
          <View style={quizClassicStyles.questionEventHeader}>
            <View style={quizClassicStyles.questionEventIconWrap}>
              <Text style={quizClassicStyles.questionEventIcon}>{currentQuestionEvent.icon}</Text>
            </View>
            <Text style={quizClassicStyles.questionEventTitle}>{currentQuestionEvent.title}</Text>
          </View>
          <Text style={quizClassicStyles.questionEventContext}>{currentQuestionEvent.context}</Text>
          <View style={quizClassicStyles.questionEventMessageBox}>
            <Text style={quizClassicStyles.questionEventMessage}>{currentQuestionEvent.message}</Text>
          </View>
        </View>
      ) : null}

      <View style={quizClassicStyles.questionTopRow}>
        <Text style={typography.cardCode}>{currentQuestion.id}</Text>
        <Text style={quizClassicStyles.questionMeta}>{currentQuestion.module}</Text>
      </View>

      <Text style={typography.cardTitle}>{currentQuestion.prompt}</Text>

      <View style={quizClassicStyles.optionsWrap}>
        {currentQuestion.options.map((option, optionIndex) => {
          const isSelected = selectedForCurrent === optionIndex;
          const isCorrectOption = currentQuestion.correctIndex === optionIndex;
          const showCorrectOption = selectedForCurrent !== undefined && isCorrectOption;
          const showWrongSelected = selectedForCurrent !== undefined && isSelected && !isCorrectOption;

          return (
            <Pressable
              key={option}
              onPress={() => onSelectOption(optionIndex)}
              style={[
                quizClassicStyles.optionItem,
                isSelected && quizClassicStyles.optionItemSelected,
                showCorrectOption && quizClassicStyles.optionItemCorrect,
                showWrongSelected && quizClassicStyles.optionItemWrong,
              ]}
              disabled={selectedForCurrent !== undefined}
            >
              <Text
                style={[
                  quizClassicStyles.optionIndex,
                  isSelected && quizClassicStyles.optionIndexSelected,
                  showCorrectOption && quizClassicStyles.optionIndexCorrect,
                  showWrongSelected && quizClassicStyles.optionIndexWrong,
                ]}
              >
                {String.fromCharCode(65 + optionIndex)}
              </Text>
              <Text style={[quizClassicStyles.optionText, isSelected && quizClassicStyles.optionTextSelected]}>{option}</Text>
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
    </>
  );
}
