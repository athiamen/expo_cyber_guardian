import { RouteProp, useRoute } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../../../lib/responsive";
import { ModulesStackParamList } from "../../../navigation/types";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { resolveCourseVideoUrl } from "../data/courseVideos";

type CourseVideoRoute = RouteProp<ModulesStackParamList, "CourseVideo">;

export function CourseVideoScreen() {
  const { t } = useTranslation();
  const route = useRoute<CourseVideoRoute>();
  const { courseCode, courseTitle, moduleTitle, videoUrl } = route.params;
  const resolvedVideoUrl = videoUrl ?? resolveCourseVideoUrl(courseCode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{t("course.video")}</Text>
        <Text style={[typography.screenTitle, styles.title]}>
          {courseTitle ?? courseCode}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {moduleTitle ?? "Module"}
        </Text>
      </View>

      <View style={styles.playerCard}>
        <Video
          source={{ uri: resolvedVideoUrl }}
          style={styles.player}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>{t("course.videoHelp")}</Text>
        <Pressable style={styles.linkPill}>
          <Text style={styles.linkPillText}>
            {t("course.reference")} : {courseCode}
          </Text>
        </Pressable>
      </View>
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
  heroCard: {
    borderRadius: scale(20),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(18),
  },
  title: {
    marginTop: moderateScale(8),
  },
  body: {
    marginTop: moderateScale(10),
  },
  playerCard: {
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: moderateScale(12),
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: scale(10),
    backgroundColor: "#000000",
    alignContent: "center",
    justifyContent: "center",
  },
  infoCard: {
    borderRadius: scale(14),
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: moderateScale(12),
    gap: moderateScale(8),
  },
  infoText: {
    color: colors.textMuted,
    fontSize: normalizeFont(13),
    lineHeight: verticalScale(19),
  },
  linkPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: scale(1),
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
  },
  linkPillText: {
    color: colors.text,
    fontSize: normalizeFont(12),
    fontWeight: "700",
  },
});
