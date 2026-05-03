import { useLocalSearchParams } from 'expo-router';
import { CourseScreen } from './features/modules/screens/CourseScreen';

export default function CourseRoute() {
  const params = useLocalSearchParams<{ userId?: string }>();
  return <CourseScreen userId={params.userId ?? 'anonymous'} />;
}
