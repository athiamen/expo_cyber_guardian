import { ResizeMode, Video } from "expo-av";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { WebView } from "react-native-webview";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../../../lib/responsive";
import { useAppTheme } from "../../../theme/useAppTheme";
import {
    getAllModulesWithVideos,
    getVideosByModule,
    VIDEO_CATALOG,
} from "../data/videoCatalog";

export function VideosScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isPhone = width < 420;
  const playerHeight = isPhone ? 240 : 320;
  const { colors, typography } = useAppTheme();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedVideoSource, setSelectedVideoSource] = useState<
    string | number | null
  >(null);
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const modules = getAllModulesWithVideos();
  const displayedVideos =
    selectedModule && selectedModule !== "ALL"
      ? getVideosByModule(selectedModule)
      : VIDEO_CATALOG;

  const openVideo = (videoUrl: string) => {
    setSelectedVideoSource(videoUrl);
  };

  const closeVideo = () => {
    setSelectedVideoSource(null);
  };

  const isYouTubeUrl = (videoUrl: string) => {
    return /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))/.test(
      videoUrl,
    );
  };

  const normalizeVideoUri = (videoUrl: string) => {
    if (/^file:\/\//i.test(videoUrl) || /^https?:\/\//i.test(videoUrl)) {
      return videoUrl;
    }

    // Convert a Windows absolute path like C:\\Users\\name\\video.mp4 to file:///C:/Users/name/video.mp4
    if (/^[a-zA-Z]:\\/.test(videoUrl)) {
      return `file:///${videoUrl.replace(/\\/g, "/")}`;
    }

    return videoUrl;
  };

  const buildYoutubeEmbedUrl = (videoUrl: string) => {
    const videoIdMatch = videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]+)/,
    );
    const videoId = videoIdMatch?.[1] ?? videoUrl;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const buildYoutubeHtml = (videoUrl: string) => {
    const embedUrl = buildYoutubeEmbedUrl(videoUrl);

    return `
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <style>
            html, body {
              margin: 0;
              width: 100%;
              height: 100%;
              background: #0f172a;
              overflow: hidden;
            }
            .frame {
              position: absolute;
              inset: 0;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: 0;
            }
          </style>
        </head>
        <body>
          <div class="frame">
            <iframe
              src="${embedUrl}"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </body>
      </html>
    `;
  };

  const renderModuleTab = (
    moduleCode: string,
    title: string,
    count: number,
  ) => {
    const isSelected = selectedModule === moduleCode;
    return (
      <Pressable
        key={moduleCode}
        style={[styles.moduleTab, isSelected && styles.moduleTabActive]}
        onPress={() => setSelectedModule(moduleCode)}
      >
        <Text
          style={[
            styles.moduleTabText,
            isSelected && styles.moduleTabTextActive,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.moduleTabCount,
            isSelected && styles.moduleTabCountActive,
          ]}
        >
          {count}
        </Text>
      </Pressable>
    );
  };

  const renderVideoItem = ({ item }: any) => (
    <Pressable
      style={styles.videoCard}
      onPress={async () => {
        openVideo(item.videoUrl);
      }}
    >
      <View style={styles.videoHeader}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.videoBadges}>
          {item.difficulty && (
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    item.difficulty === "beginner"
                      ? "#d1fae5"
                      : item.difficulty === "intermediate"
                        ? "#fef3c7"
                        : "#fee2e2",
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyBadgeText,
                  {
                    color:
                      item.difficulty === "beginner"
                        ? "#065f46"
                        : item.difficulty === "intermediate"
                          ? "#92400e"
                          : "#991b1b",
                  },
                ]}
              >
                {item.difficulty === "beginner"
                  ? "Débutant"
                  : item.difficulty === "intermediate"
                    ? "Intermédiaire"
                    : "Avancé"}
              </Text>
            </View>
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationBadgeText}>⏱️ {item.duration}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.videoDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {item.instructor && (
        <Text style={styles.videoInstructor}>👨‍🏫 {item.instructor}</Text>
      )}

      <Pressable
        style={styles.playButton}
        onPress={() => openVideo(item.videoUrl)}
      >
        <Text style={styles.playButtonText}>▶ Regarder la vidéo</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.ambientBackground}>
        <View style={styles.ambientBlobLarge} />
        <View style={styles.ambientBlobSmall} />
      </View>

      <Modal
        visible={selectedVideoSource !== null}
        animationType="slide"
        transparent
        onRequestClose={closeVideo}
      >
        <View style={styles.playerOverlay}>
          <View style={styles.playerCard}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>Lecteur vidéo</Text>
              <Pressable style={styles.closeButton} onPress={closeVideo}>
                <Text style={styles.closeButtonText}>Fermer</Text>
              </Pressable>
            </View>

            {typeof selectedVideoSource === "string" &&
            isYouTubeUrl(selectedVideoSource) ? (
              <WebView
                source={{ html: buildYoutubeHtml(selectedVideoSource) }}
                style={[
                  styles.webView,
                  { height: verticalScale(playerHeight) },
                ]}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                startInLoadingState
                renderLoading={() => (
                  <View
                    style={[
                      styles.loadingContainer,
                      { minHeight: verticalScale(playerHeight) },
                    ]}
                  >
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.loadingText}>
                      Chargement de la vidéo...
                    </Text>
                  </View>
                )}
              />
            ) : selectedVideoSource ? (
              <Video
                source={
                  typeof selectedVideoSource === "number"
                    ? selectedVideoSource
                    : { uri: normalizeVideoUri(selectedVideoSource) }
                }
                style={[
                  styles.webView,
                  { height: verticalScale(playerHeight) },
                ]}
                useNativeControls
                shouldPlay
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : null}
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={[typography.screenTitle, styles.title]}>
          📺 Cours Vidéos
        </Text>
        <Text style={styles.subtitle}>
          Apprenez à votre rythme avec nos vidéos éducatives
        </Text>
      </View>

      {/* Module Tabs */}
      <View style={styles.moduleTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moduleTabsContent}
        >
          <Pressable
            style={[
              styles.moduleTab,
              !selectedModule && styles.moduleTabActive,
            ]}
            onPress={() => setSelectedModule(null)}
          >
            <Text
              style={[
                styles.moduleTabText,
                !selectedModule && styles.moduleTabTextActive,
              ]}
            >
              Tous
            </Text>
            <Text
              style={[
                styles.moduleTabCount,
                !selectedModule && styles.moduleTabCountActive,
              ]}
            >
              {VIDEO_CATALOG.length}
            </Text>
          </Pressable>

          {modules.map((module) =>
            renderModuleTab(module.code, module.title, module.videoCount),
          )}
        </ScrollView>
      </View>

      {/* Videos List */}
      <FlatList
        data={displayedVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.videosList}
        scrollEnabled
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucune vidéo disponible pour ce module.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: any, typography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    ambientBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: verticalScale(220),
    },
    ambientBlobLarge: {
      position: "absolute",
      top: verticalScale(-70),
      right: scale(-56),
      width: scale(220),
      height: scale(220),
      borderRadius: scale(999),
      backgroundColor: "rgba(79, 140, 255, 0.16)",
    },
    ambientBlobSmall: {
      position: "absolute",
      top: verticalScale(24),
      left: scale(-52),
      width: scale(130),
      height: scale(130),
      borderRadius: scale(999),
      backgroundColor: "rgba(245, 158, 11, 0.12)",
    },
    header: {
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(16),
      paddingBottom: moderateScale(12),
    },
    title: {
      color: colors.text,
      marginBottom: moderateScale(4),
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      fontWeight: "500",
    },
    moduleTabsContainer: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    moduleTabsContent: {
      paddingHorizontal: moderateScale(12),
      gap: moderateScale(8),
      paddingVertical: moderateScale(10),
    },
    moduleTab: {
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(8),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      flexDirection: "row",
      gap: moderateScale(6),
      alignItems: "center",
    },
    moduleTabActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    moduleTabText: {
      color: colors.text,
      fontSize: normalizeFont(13),
      fontWeight: "600",
    },
    moduleTabTextActive: {
      color: "#ffffff",
    },
    moduleTabCount: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      fontWeight: "700",
      backgroundColor: colors.background,
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      borderRadius: scale(10),
    },
    moduleTabCountActive: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      color: "#ffffff",
    },
    videosList: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(12),
      gap: moderateScale(12),
    },
    videoCard: {
      backgroundColor: colors.surface,
      borderRadius: scale(12),
      padding: moderateScale(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    videoHeader: {
      marginBottom: moderateScale(10),
    },
    videoTitle: {
      color: colors.text,
      fontSize: normalizeFont(15),
      fontWeight: "700",
      marginBottom: moderateScale(8),
    },
    videoBadges: {
      flexDirection: "row",
      gap: moderateScale(8),
      flexWrap: "wrap",
    },
    difficultyBadge: {
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: scale(6),
    },
    difficultyBadgeText: {
      fontSize: normalizeFont(11),
      fontWeight: "600",
    },
    durationBadge: {
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: scale(6),
      backgroundColor: "#e0f2fe",
    },
    durationBadgeText: {
      color: "#0369a1",
      fontSize: normalizeFont(11),
      fontWeight: "600",
    },
    videoDescription: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      marginBottom: moderateScale(8),
      lineHeight: verticalScale(18),
    },
    videoInstructor: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      marginBottom: moderateScale(10),
      fontWeight: "500",
    },
    playButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(10),
      borderRadius: scale(8),
      alignItems: "center",
    },
    playButtonText: {
      color: "#ffffff",
      fontSize: normalizeFont(13),
      fontWeight: "700",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: moderateScale(40),
    },
    emptyStateText: {
      color: colors.textMuted,
      fontSize: normalizeFont(14),
      fontWeight: "500",
    },
    playerOverlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.72)",
      justifyContent: "center",
      paddingHorizontal: moderateScale(16),
    },
    playerCard: {
      backgroundColor: colors.surface,
      borderRadius: scale(18),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    playerTitle: {
      color: colors.text,
      fontSize: normalizeFont(14),
      fontWeight: "700",
    },
    closeButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(8),
      borderRadius: scale(999),
    },
    closeButtonText: {
      color: "#ffffff",
      fontSize: normalizeFont(12),
      fontWeight: "700",
    },
    webView: {
      width: "100%",
      backgroundColor: colors.background,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      gap: moderateScale(10),
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: normalizeFont(13),
      fontWeight: "500",
    },
  });
