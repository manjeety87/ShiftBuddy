import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./app-text";

type AppBadgeVariant = "default" | "success" | "warning" | "error" | "accent";

interface AppBadgeProps {
  /** Badge text */
  label: string;
  /** Semantic variant */
  variant?: AppBadgeVariant;
  /** Custom background colour */
  bg?: string;
  /** Custom text colour */
  fg?: string;
  /** Dot-only mode (no label text, shows a small dot + label beside it) */
  dot?: boolean;
}

/**
 * Small coloured badge / chip used for status indicators,
 * conflict alerts, and category tags.
 */
export function AppBadge({
  label,
  variant = "default",
  bg,
  fg,
  dot = false,
}: AppBadgeProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;

  const bgMap: Record<AppBadgeVariant, string> = {
    default: colors.surface,
    success: colors.success + "22",
    warning: colors.warning + "22",
    error: colors.error + "22",
    accent: colors.accent + "22",
  };
  const fgMap: Record<AppBadgeVariant, string> = {
    default: colors.textSecondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    accent: colors.accent,
  };

  const resolvedBg = bg ?? bgMap[variant];
  const resolvedFg = fg ?? fgMap[variant];

  if (dot) {
    return (
      <View style={styles.dotRow}>
        <View style={[styles.dot, { backgroundColor: resolvedFg }]} />
        <AppText variant="caption" color={resolvedFg}>
          {label}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: resolvedBg,
          borderRadius: 8 * r,
        },
      ]}
    >
      <AppText variant="captionBold" color={resolvedFg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
