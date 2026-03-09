import React from "react";
import { StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";

interface ProgressBarProps {
  /** Progress value 0–1 */
  progress: number;
  /** Bar colour (defaults to accent) */
  color?: string;
  /** Label text above the bar */
  label?: string;
  /** Show percentage text */
  showPercent?: boolean;
  /** Bar height (default 6) */
  height?: number;
}

/**
 * A slim progress bar with optional label.
 * Great for earnings progress, shift completion, etc.
 */
export function ProgressBar({
  progress,
  color,
  label,
  showPercent = false,
  height = 6,
}: ProgressBarProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;
  const barColor = color ?? colors.accent;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.container}>
      {(label || showPercent) && (
        <View style={styles.topRow}>
          {label && (
            <AppText variant="caption" color={colors.textSecondary}>
              {label}
            </AppText>
          )}
          {showPercent && (
            <AppText variant="captionBold" color={barColor}>
              {Math.round(clampedProgress * 100)}%
            </AppText>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.surface,
            height,
            borderRadius: (height / 2) * r,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: `${clampedProgress * 100}%`,
              height,
              borderRadius: (height / 2) * r,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: { overflow: "hidden" },
  fill: {},
});
