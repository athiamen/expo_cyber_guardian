import { useLocalSearchParams } from "expo-router";
import { CourseJourneyScreen } from "./features/modules/screens/CourseJourneyScreen";

export default function CourseRoute() {
  useLocalSearchParams<{ courseCode?: string }>();
  return <CourseJourneyScreen />;
}
