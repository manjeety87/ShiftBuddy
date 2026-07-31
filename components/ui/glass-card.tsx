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
      // Android's `elevation` is a quantized Material lookup table, not a
      // tunable blur — even elevation:2-3 renders a visibly large, tinted
      // halo that no small numeric tweak fixes, so Android gets none at
      // all (the border carries definition instead, matching web's flat
      // look). iOS/web read shadowOpacity/shadowRadius directly and stay
      // soft at these values.
      shadowColor: isGlass ? colors.accent + "15" : colors.shadow,
      shadowOffset: { width: 0, height: isGlass ? 5 : 3 },
      shadowOpacity: isGlass ? 0.14 : 0.06,
      shadowRadius: isGlass ? 14 : 6,
      elevation: Platform.OS === "android" ? 0 : isGlass ? 3 : 2,
    },
    accentBorder && { borderLeftWidth: 3, borderLeftColor: accentBorder },
    style,
  ];

  if (isGlass && Platform.OS !== "web") {
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

  // Fallback for web or non-glass themes (web renders blur via its own CSS path)
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
