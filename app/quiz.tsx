import { useLocalSearchParams } from 'expo-router';
import { QuizScreen } from './features/quiz/screens/QuizScreen';

export default function QuizRoute() {
  const params = useLocalSearchParams<{ token?: string; userId?: string }>();

  return <QuizScreen token={params.token} userId={params.userId ?? 'anonymous'} />;
}
