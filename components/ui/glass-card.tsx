import { useAppTheme } from "@/hooks/use-app-theme";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
  /** Override padding (default 18) */
  padding?: number;
  /** Highlight border colour */
  accentBorder?: string;
  /** Blur intensity 1-100 (default auto from theme) */
  intensity?: number;
}

/**
 * Glassmorphic card that uses blur on iOS and translucent fallback on Android.
 * Automatically adapts to the active theme's glass settings.
 */
export function GlassCard({
  padding = 18,
  accentBorder,
  intensity,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;
  const isGlass = theme.tokens.glassOpacity > 0;
  const blurIntensity =
    intensity ?? Math.round(theme.tokens.glassOpacity * 100);
  const borderRadius = 16 * r;

  const cardStyle = [
    styles.card,
    {
      borderRadius,
      borderColor: accentBorder
        ? accentBorder + "66"
        : isGlass
          ? colors.border
          : colors.border,
      shadowColor: isGlass ? colors.accent + "15" : colors.shadow,
      shadowOffset: { width: 0, height: isGlass ? 8 : 4 },
      shadowOpacity: isGlass ? 0.25 : 0.08,
      shadowRadius: isGlass ? 24 : 8,
      elevation: isGlass ? 8 : 3,
    },
    accentBorder && { borderLeftWidth: 3, borderLeftColor: accentBorder },
    style,
  ];

  if (isGlass && Platform.OS === "ios") {
    return (
      <View style={[styles.blurWrapper, { borderRadius }]} {...rest}>
        <BlurView
          intensity={blurIntensity}
          tint={theme.tokens.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.blurOverlay,
            { backgroundColor: colors.card, opacity: 0.35 },
          ]}
        />
        <View style={[cardStyle, styles.glassBorder, { padding }]}>
          {children}
        </View>
      </View>
    );
  }

  // Fallback for Android or non-glass themes
  return (
    <View
      style={[
        cardStyle,
        {
          backgroundColor: isGlass ? colors.card : colors.card,
          padding,
        },
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  blurWrapper: {
    overflow: "hidden",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glassBorder: {
    backgroundColor: "transparent",
    borderWidth: 0.5,
  },
});
