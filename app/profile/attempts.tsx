import { useLocalSearchParams } from 'expo-router';
import { AttemptsReportScreen } from '../features/profile/screens/AttemptsReportScreen';

export default function AttemptsRoute() {
  const params = useLocalSearchParams<{ token?: string }>();

  if (!params.token) {
    return null;
  }

  return <AttemptsReportScreen token={params.token} />;
}
