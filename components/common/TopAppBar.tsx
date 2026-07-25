import React, { ReactNode } from "react";
import { View, Text, StyleProp, ViewStyle, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { BackButton } from "./BackButton";
import { useAppTheme } from "@/hooks/use-app-theme";

export interface TopAppBarProps {
  /** Screen title */
  title: string;
  /** Show back button (default: true) */
  showBack?: boolean;
  /** Custom back handler (default: router.back()) */
  onBack?: () => void;
  /** Right side actions */
  actions?: ReactNode;
  /** Left side custom content (replaces back button) */
  leading?: ReactNode;
  /** Background style override */
  style?: StyleProp<ViewStyle>;
  /** Content container style */
  contentStyle?: StyleProp<ViewStyle>;
  /** Elevation/shadow */
  elevated?: boolean;
  /** Use glass/blur background */
  glass?: boolean;
}

/**
 * Consistent top app bar used across all screens.
 * Matches the HTML design: glass background, back button in circle, title, actions on right.
 */
export function TopAppBar({
  title,
  showBack = true,
  onBack,
  actions,
  leading,
  style,
  contentStyle,
  elevated = false,
  glass = true,
}: TopAppBarProps) {
  const { tokens, theme } = useAppTheme();
  const { router } = require("expo-router");

  const handleBack = onBack ?? (() => router.back());
  const isGlass = glass && theme.tokens.glassOpacity > 0;

  return (
    <View
      style={[
        styles.container,
        elevated && styles.elevated,
        { backgroundColor: isGlass ? tokens.glassBackground : tokens.surface },
        style,
      ]}
    >
      {isGlass && (
        <BlurView
          intensity={80}
          tint={theme.tokens.blurTint}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={[styles.content, contentStyle]}>
        {/* Leading / Back Button */}
        <View style={styles.leading}>
          {leading ? (
            leading
          ) : showBack ? (
            <BackButton onPress={handleBack} />
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.titleWrapper}>
          <Text
            style={[
              styles.title,
              {
                color: tokens.textPrimary,
                fontFamily: "Manrope",
                fontWeight: "800",
              },
            ]}
          >
            {title}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {actions}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 0.5,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
  },
  leading: {
    width: 40,
    justifyContent: "center",
  },
  titleWrapper: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.3,
  },
  actions: {
    width: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
});