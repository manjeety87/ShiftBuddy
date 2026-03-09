import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";
import {
    Pressable,
    StyleSheet,
    type PressableProps,
    type ViewStyle,
} from "react-native";
import { AppText } from "./app-text";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
type AppButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends Omit<PressableProps, "children"> {
  /** Label text */
  label: string;
  /** Visual variant */
  variant?: AppButtonVariant;
  /** Size */
  size?: AppButtonSize;
  /** Stretch to fill container width */
  fullWidth?: boolean;
  /** Left icon render function */
  leftIcon?: React.ReactNode;
  /** Right icon render function */
  rightIcon?: React.ReactNode;
}

/**
 * Theme-aware pressable button with multiple variants and sizes.
 */
export function AppButton({
  label,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...rest
}: AppButtonProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;

  // ── Colour mapping ──
  const bg: Record<AppButtonVariant, string> = {
    primary: colors.accent,
    secondary: colors.surface,
    outline: "transparent",
    ghost: "transparent",
    danger: colors.error,
  };
  const fg: Record<AppButtonVariant, string> = {
    primary: "#FFFFFF",
    secondary: colors.textPrimary,
    outline: colors.accent,
    ghost: colors.accent,
    danger: "#FFFFFF",
  };
  const borderColor: Record<AppButtonVariant, string> = {
    primary: "transparent",
    secondary: colors.border,
    outline: colors.accent,
    ghost: "transparent",
    danger: "transparent",
  };

  // ── Size mapping ──
  const padY: Record<AppButtonSize, number> = { sm: 8, md: 12, lg: 16 };
  const padX: Record<AppButtonSize, number> = { sm: 14, md: 20, lg: 28 };
  const radius: Record<AppButtonSize, number> = { sm: 8, md: 12, lg: 16 };
  const textVariant =
    size === "sm"
      ? ("captionBold" as const)
      : size === "lg"
        ? ("subheading" as const)
        : ("bodyBold" as const);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          borderColor: borderColor[variant],
          borderRadius: radius[size] * r,
          paddingVertical: padY[size],
          paddingHorizontal: padX[size],
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
        fullWidth && styles.fullWidth,
        style as ViewStyle,
      ]}
      disabled={disabled}
      {...rest}
    >
      {leftIcon}
      <AppText variant={textVariant} color={fg[variant]}>
        {label}
      </AppText>
      {rightIcon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  fullWidth: { width: "100%" },
});
