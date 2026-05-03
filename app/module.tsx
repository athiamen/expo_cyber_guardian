import { useLocalSearchParams } from "expo-router";
import { ModuleCoursesScreen } from "./features/modules/screens/ModuleCoursesScreen";

export default function ModuleRoute() {
  useLocalSearchParams<{ moduleCode?: string }>();

  return <ModuleCoursesScreen />;
}
