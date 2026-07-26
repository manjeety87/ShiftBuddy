import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";

type WorkplaceChoiceCardProps = {
  label: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  isAddNew?: boolean;
};

export function WorkplaceChoiceCard({
  label,
  color,
  selected = false,
  onPress,
  isAddNew = false,
}: WorkplaceChoiceCardProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: 16 * r,
          backgroundColor: isAddNew
            ? colors.background
            : selected
              ? color + "16"
              : colors.surface,
          borderColor: isAddNew
            ? colors.border + "66"
            : selected
              ? color
              : colors.border,
          borderStyle: isAddNew ? "dashed" : "solid",
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      {isAddNew ? (
        <>
          <View
            style={[
              styles.addIconWrap,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <IconSymbol name="plus" size={16} color={colors.accent} />
          </View>
          <AppText variant="bodyBold">New workplace</AppText>
        </>
      ) : (
        <>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: color,
                shadowColor: color,
              },
            ]}
          />
          <AppText
            variant="bodyBold"
            color={selected ? colors.textPrimary : colors.textSecondary}
            numberOfLines={1}
          >
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    borderWidth: 1.25,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  addIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
