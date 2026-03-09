import React from "react";
import { StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";

interface DividerProps {
  /** Optional center label */
  label?: string;
  /** Vertical spacing (default 16) */
  spacing?: number;
}

/**
 * Theme-aware horizontal divider with optional centered label.
 */
export function Divider({ label, spacing = 16 }: DividerProps) {
  const { colors } = useAppTheme();

  if (label) {
    return (
      <View style={[styles.labelRow, { marginVertical: spacing }]}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <AppText variant="label" color={colors.textSecondary}>
          {label}
        </AppText>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.simple,
        { backgroundColor: colors.border, marginVertical: spacing },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  simple: { height: StyleSheet.hairlineWidth },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
