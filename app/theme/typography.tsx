import { StyleSheet } from "react-native";
import { moderateScale, normalizeFont, verticalScale } from "../lib/responsive";
import { colors } from "./colors";

export const typography = StyleSheet.create({
  eyebrow: {
    color: colors.accent,
    fontSize: normalizeFont(12),
    fontWeight: "700",
    letterSpacing: moderateScale(2.4),
    textTransform: "uppercase",
  },
  eyebrowWarning: {
    color: colors.warning,
    fontSize: normalizeFont(12),
    fontWeight: "700",
    letterSpacing: moderateScale(2.4),
    textTransform: "uppercase",
  },
  screenTitle: {
    color: colors.text,
    fontSize: normalizeFont(32),
    fontWeight: "900",
    lineHeight: verticalScale(38),
    letterSpacing: -0.4,
  },
  heroTitle: {
    color: colors.text,
    fontSize: normalizeFont(30),
    fontWeight: "900",
    lineHeight: verticalScale(36),
    letterSpacing: -0.5,
  },
  body: {
    color: colors.textMuted,
    fontSize: normalizeFont(16),
    lineHeight: verticalScale(26),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: normalizeFont(20),
    fontWeight: "800",
    lineHeight: verticalScale(24),
    letterSpacing: -0.2,
  },
  statValue: {
    color: colors.accent,
    fontSize: normalizeFont(24),
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: normalizeFont(11),
    fontWeight: "700",
    letterSpacing: moderateScale(1.2),
    textTransform: "uppercase",
  },
  cardCode: {
    color: colors.warning,
    fontSize: normalizeFont(11),
    fontWeight: "700",
    letterSpacing: moderateScale(1.8),
    textTransform: "uppercase",
  },
  cardTitle: {
    color: colors.text,
    fontSize: normalizeFont(18),
    fontWeight: "800",
    lineHeight: verticalScale(24),
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: normalizeFont(13),
    fontWeight: "500",
    lineHeight: verticalScale(18),
  },
  progressLabel: {
    color: colors.textMuted,
    fontSize: normalizeFont(11),
    fontWeight: "700",
    letterSpacing: moderateScale(1.1),
    textTransform: "uppercase",
  },
});
