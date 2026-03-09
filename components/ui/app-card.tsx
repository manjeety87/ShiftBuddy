import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

interface AppCardProps extends ViewProps {
  /** Use glass/blur styling when theme supports it (default auto) */
  glass?: boolean;
  /** Override padding (default 18) */
  padding?: number;
  /** Highlight border colour (e.g. workplace colour) */
  accentBorder?: string;
}

/**
 * Theme-aware card surface.
 * Automatically picks up card colour, border, radius, and shadow from the
 * active theme. When the theme has `glassOpacity > 0` and `glass` is true,
 * it renders a translucent card (real blur effects added in Step 10).
 */
export function AppCard({
  glass,
  padding = 18,
  accentBorder,
  style,
  children,
  ...rest
}: AppCardProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;
  const useGlass = glass ?? theme.tokens.glassOpacity > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: useGlass ? colors.card : colors.card,
          borderColor: accentBorder ?? colors.border,
          borderRadius: 16 * r,
          padding,
          // Subtle shadow for non-glass themes
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: useGlass ? 0.12 : 0.08,
          shadowRadius: useGlass ? 16 : 8,
          elevation: useGlass ? 6 : 3,
        },
        accentBorder && { borderLeftWidth: 3, borderLeftColor: accentBorder },
        style,
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
});
