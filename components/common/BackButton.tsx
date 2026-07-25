import { Pressable, StyleProp, ViewStyle } from "react-native";
import React from "react";
import { IconSymbol } from "../ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { StyleSheet } from "react-native";

export interface BackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Size of the circular button */
  size?: number;
  /** Icon size */
  iconSize?: number;
}

/**
 * Consistent back button used across all screens.
 * Circle with arrow icon - matches the HTML design's arrow_back in a circle.
 */
export function BackButton({
  onPress,
  style,
  accessibilityLabel = "Go back",
  size = 40,
  iconSize = 20,
}: BackButtonProps) {
  const { tokens } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: pressed ? tokens.surfacePressed : "transparent",
        },
        style,
      ]}
    >
      <IconSymbol
        name="chevron.left"
        size={iconSize}
        color={tokens.iconPrimary}
        weight="medium"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});