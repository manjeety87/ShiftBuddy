import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import { cardPadding, cornerRadii } from "@/theme/design-system";

interface AppCardProps {
  children: React.ReactNode;
  style?: any;
  /** Conflict accent bar color (overrides default tertiary) */
  conflictAccent?: string;
  /** Show conflict state (left accent bar + soft background) */
  isConflict?: boolean;
  /** Use nested/inset appearance (surface_lowest background) */
  isNested?: boolean;
  /** Tonal surface tier (default: container) */
  tier?: "lowest" | "low" | "container" | "high" | "highest";
}

export function AppCard({
  children,
  style,
  conflictAccent,
  isConflict,
  isNested,
  tier = "container",
}: AppCardProps) {
  const { theme } = useAppTheme();
  const tokens = theme.tokens;

  const isGlass = tokens.glassOpacity > 0;

  // ── Background tier selection ──────────────────────────────────────
  const tierMap: Record<string, string> = {
    lowest: tokens.surface_lowest,
    low: tokens.surface_container_low,
    container: tokens.surface_container,
    high: tokens.surface_container_high,
    highest: tokens.surface_container_highest,
  };

  const backgroundColor = isNested ? tokens.surface_lowest : tierMap[tier];

  // ── Conflict state styling ─────────────────────────────────────────
  const conflictStyle = isConflict
    ? {
        borderLeftWidth: 4,
        borderLeftColor: conflictAccent ?? tokens.tertiary,
        paddingLeft: 12,
        backgroundColor: tokens.tertiary_container + "0F", // Soft wash
      }
    : {};

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          paddingHorizontal: cardPadding(tokens, 3),
          paddingVertical: cardPadding(tokens, 3),
        },
        conflictStyle,
        style,
      ]}
    >
      {children}
    </View>
  );

  // ── Glass morphism for floating elements (if theme supports it) ─────
  if (!isGlass) {
    return content;
  }

  return (
    <BlurView
      intensity={60}
      tint={tokens.blurTint}
      style={styles.blurContainer}
    >
      {content}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: cornerRadii.lg,
    overflow: "hidden",
  },
  card: {
    borderRadius: cornerRadii.lg,
    // ── NO BORDER — boundaries defined by background shifts only ────
    // Conflict state adds a left accent bar in the style prop
  },
});
