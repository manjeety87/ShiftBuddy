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
 * active theme. Premium glass themes get a refined translucent appearance.
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
          borderColor: accentBorder
            ? accentBorder + "66"
            : useGlass
              ? colors.border
              : colors.border,
          borderRadius: 16 * r,
          padding,
          // Enhanced shadow system
          shadowColor: useGlass ? colors.accent + "15" : colors.shadow,
          shadowOffset: { width: 0, height: useGlass ? 6 : 4 },
          shadowOpacity: useGlass ? 0.2 : 0.08,
          shadowRadius: useGlass ? 20 : 8,
          elevation: useGlass ? 8 : 3,
        },
        accentBorder && {
          borderLeftWidth: 3,
          borderLeftColor: accentBorder,
        },
        useGlass && {
          borderWidth: 0.5,
        },
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
