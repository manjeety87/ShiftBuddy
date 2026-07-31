import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { ShiftStatus } from "@/types";

type StatusPillProps = {
  value: ShiftStatus;
  selected: boolean;
  onPress: (value: ShiftStatus) => void;
};

const STATUS_META: Record<
  ShiftStatus,
  {
    label: string;
    icon: "checkmark.circle.fill" | "clock.fill" | "xmark.circle.fill";
  }
> = {
  confirmed: { label: "Confirmed", icon: "checkmark.circle.fill" },
  pending: { label: "Pending", icon: "clock.fill" },
  cancelled: { label: "Cancelled", icon: "xmark.circle.fill" },
};

export function StatusPill({ value, selected, onPress }: StatusPillProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;
  const meta = STATUS_META[value];

  const tone =
    value === "confirmed"
      ? colors.success
      : value === "pending"
        ? colors.warning
        : colors.error;

  return (
    <Pressable
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.pill,
        {
          borderRadius: 999 * r,
          backgroundColor: selected ? tone + "16" : colors.surface,
          borderColor: selected ? tone : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <IconSymbol name={meta.icon} size={14} color={tone} />
        <AppText
          variant="captionBold"
          color={selected ? colors.textPrimary : colors.textSecondary}
        >
          {meta.label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
