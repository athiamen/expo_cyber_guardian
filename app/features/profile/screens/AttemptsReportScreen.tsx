import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { exportReport, getApiBaseUrl } from "../../../lib/api";
import {
  moderateScale,
  normalizeFont,
  scale,
  verticalScale,
} from "../../../lib/responsive";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

type AttemptsReportScreenProps = {
  token: string;
};

export function AttemptsReportScreen({ token }: AttemptsReportScreenProps) {
  const { t } = useTranslation();
  const tReport = (key: string, options?: Record<string, unknown>) =>
    t(`attemptsReport.${key}`, options);
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 420;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number | null>(null);
  const [successRate, setSuccessRate] = useState<number | null>(null);

  const successCount = useMemo(() => {
    if (attempts === null || successRate === null) {
      return 0;
    }
    return Math.round((attempts * successRate) / 100);
  }, [attempts, successRate]);

  const failureCount = useMemo(() => {
    if (attempts === null) {
      return 0;
    }
    return Math.max(attempts - successCount, 0);
  }, [attempts, successCount]);

  const hasResults = attempts !== null && successRate !== null;

  const loadStats = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await exportReport(
        {
          format: "csv",
          period: "30d",
        },
        token,
      );

      setAttempts(response.stats.attempts);
      setSuccessRate(response.stats.averageSuccessRate);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : tReport("loadError");
      setErrorMessage(`${message} (API: ${getApiBaseUrl()})`);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(isMobile);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={typography.eyebrow}>{tReport("heroEyebrow")}</Text>
        <Text style={[typography.screenTitle, styles.title]}>
          {tReport("heroTitle")}
        </Text>
        <Text style={[typography.body, styles.body]}>
          {tReport("heroBody")}
        </Text>
      </View>

      <View style={styles.card}>
        <Pressable
          style={[styles.loadButton, isLoading && styles.loadButtonDisabled]}
          onPress={loadStats}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.loadButtonText}>{tReport("load")}</Text>
          )}
        </Pressable>

        {hasResults ? (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellFlex1,
                  styles.tableHeaderText,
                ]}
              >
                {tReport("colLabel")}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellFlex2,
                  styles.tableHeaderText,
                ]}
              >
                {tReport("colValue")}
              </Text>
            </View>
            {[
              { label: tReport("attempts"), value: String(attempts) },
              { label: tReport("successes"), value: String(successCount) },
              { label: tReport("failures"), value: String(failureCount) },
              { label: tReport("successRate"), value: `${successRate}%` },
            ].map((row, idx) => (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 !== 0 && styles.tableRowAlt]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellFlex1,
                    styles.tableCellLabel,
                  ]}
                >
                  {row.label}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellFlex2,
                    styles.tableCellValue,
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const createStyles = (isMobile: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: moderateScale(isMobile ? 16 : 24),
      paddingTop: moderateScale(16),
      paddingBottom: moderateScale(24),
      gap: moderateScale(isMobile ? 10 : 14),
    },
    heroCard: {
      borderRadius: scale(20),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(isMobile ? 14 : 18),
    },
    title: {
      marginTop: moderateScale(8),
    },
    body: {
      marginTop: moderateScale(10),
    },
    card: {
      borderRadius: scale(16),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: moderateScale(isMobile ? 12 : 14),
      gap: moderateScale(isMobile ? 10 : 10),
    },
    label: {
      color: colors.text,
      fontSize: normalizeFont(13),
      fontWeight: "700",
      letterSpacing: moderateScale(0.3),
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: moderateScale(8),
    },
    chip: {
      borderRadius: scale(999),
      borderWidth: scale(1),
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(8),
    },
    chipActive: {
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.textMuted,
      fontSize: normalizeFont(12),
      fontWeight: "700",
    },
    chipTextActive: {
      color: colors.accent,
    },
    loadButton: {
      marginTop: moderateScale(6),
      borderRadius: scale(12),
      backgroundColor: colors.accent,
      paddingVertical: moderateScale(isMobile ? 16 : 12),
      alignItems: "center",
      minHeight: isMobile ? 52 : "auto",
      justifyContent: "center",
    },
    loadButtonDisabled: {
      opacity: 0.6,
    },
    loadButtonText: {
      color: colors.background,
      fontSize: normalizeFont(isMobile ? 16 : 14),
      fontWeight: "800",
      letterSpacing: moderateScale(0.2),
    },
    table: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    tableRow: {
      flexDirection: "row",
      backgroundColor: colors.surfaceSoft,
    },
    tableRowAlt: {
      backgroundColor: colors.surface,
    },
    tableHeader: {
      backgroundColor: colors.accent + "22",
    },
    tableCell: {
      paddingHorizontal: moderateScale(isMobile ? 8 : 10),
      paddingVertical: moderateScale(isMobile ? 12 : 9),
      fontSize: normalizeFont(isMobile ? 13 : 12),
    },
    tableCellFlex1: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    tableCellFlex2: {
      flex: 2,
    },
    tableHeaderText: {
      color: colors.accent,
      fontWeight: "800",
      letterSpacing: moderateScale(0.3),
    },
    tableCellLabel: {
      color: colors.textMuted,
      fontWeight: "600",
    },
    tableCellValue: {
      color: colors.text,
    },
    errorText: {
      color: "#ffb9b9",
      fontSize: normalizeFont(12),
      lineHeight: verticalScale(18),
    },
  });
