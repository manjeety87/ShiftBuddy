import { StyleProp, ViewStyle, TextStyle, ReactNode } from "react-native";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Right side action */
  action?: ReactNode;
  /** Action onPress (if action is a string, renders as text button) */
  onActionPress?: () => void;
  /** Action label (if action is string) */
  actionLabel?: string;
  /** Show divider line below */
  showDivider?: boolean;
  /** Style override */
  style?: StyleProp<ViewStyle>;
  /** Title style override */
  titleStyle?: TextStyle;
  /** Subtitle style override */
  subtitleStyle?: TextStyle;
  /** Left icon */
  leftIcon?: string;
  /** Left icon color */
  leftIconColor?: string;
}

/**
 * Consistent section header used across screens.
 * Matches the HTML design: icon + title, optional subtitle, action on right.
 */
export function SectionHeader({
  title,
  subtitle,
  action,
  onActionPress,
  actionLabel,
  showDivider = false,
  style,
  titleStyle,
  subtitleStyle,
  leftIcon,
  leftIconColor,
}: SectionHeaderProps) {
  const { tokens } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {/* Left side: icon + title */}
        <View style={styles.left}>
          {leftIcon && (
            <IconSymbol
              name={leftIcon as any}
              size={18}
              color={leftIconColor ?? tokens.primary}
              weight="semibold"
            />
          )}
          <View style={styles.textWrapper}>
            <Text
              style={[
                styles.title,
                {
                  color: tokens.textPrimary,
                  fontFamily: "Manrope",
                  fontWeight: "800",
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: tokens.textTertiary,
                    fontFamily: "Inter",
                  },
                  subtitleStyle,
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right side: action */}
        {action ? (
          <Pressable onPress={onActionPress} style={styles.actionWrapper}>
            {action}
          </Pressable>
        ) : actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} style={styles.actionWrapper}>
            <Text
              style={[
                styles.actionText,
                {
                  color: tokens.primary,
                  fontFamily: "Inter",
                  fontWeight: "600",
                },
              ]}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: tokens.divider },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  textWrapper: {
    gap: 2,
  },
  title: {
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginHorizontal: -20,
  },
});