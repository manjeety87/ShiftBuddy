import { useAppTheme } from "@/hooks/use-app-theme";
import { buttonGradientColors, cornerRadii } from "@/theme/design-system";
import { LinearGradient } from "expo-linear-gradient";
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
  /** Use pill (full) shape */
  pill?: boolean;
}

/**
 * Theme-aware button with gradient support, proper sizing, and design system adherence.
 * Rules:
 * - Primary: Gradient from primary to primary_container (lithographic effect)
 * - Secondary: surface_container background
 * - Outline: Transparent with ghost border (15% outline opacity)
 * - Ghost: Text-only (primary_fixed_dim)
 * - Danger: Error color with on_error text
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
  pill,
  ...rest
}: AppButtonProps) {
  const { colors, theme } = useAppTheme();
  const tokens = theme.tokens;
  const r = theme.tokens.radiusScale;

  // ── Size mapping (Geometric Scale) ─────────────────────────────
  const padY: Record<AppButtonSize, number> = { sm: 10, md: 14, lg: 18 };
  const padX: Record<AppButtonSize, number> = { sm: 16, md: 24, lg: 32 };
  const textVariant: Record<AppButtonSize, any> = {
    sm: "label",
    md: "bodyBold",
    lg: "heading",
  };

  // ── Radius ────────────────────────────────────────────────────────
  const radius = pill ? cornerRadii.full : cornerRadii.lg;

  // ── Variant colors ───────────────────────────────────────────────
  const variantConfig = {
    primary: {
      bg: colors.accent,
      fg: tokens.surface_darkest,
      border: "transparent",
      usesGradient: true,
    },
    secondary: {
      bg: tokens.surface_container,
      fg: colors.text,
      border: tokens.outline_variant + "26", // Ghost border at 15%
      usesGradient: false,
    },
    outline: {
      bg: "transparent",
      fg: colors.accent,
      border: tokens.outline_variant + "26", // Ghost border
      usesGradient: false,
    },
    ghost: {
      bg: "transparent",
      fg: tokens.primary_fixed_dim,
      border: "transparent",
      usesGradient: false,
    },
    danger: {
      bg: colors.error,
      fg: tokens.surface_bright,
      border: "transparent",
      usesGradient: false,
    },
  };

  const config = variantConfig[variant];
  const useGradient = config.usesGradient && !disabled;

  const buttonContent = (
    <>
      {leftIcon}
      <AppText variant={textVariant[size]} color={config.fg}>
        {label}
      </AppText>
      {rightIcon}
    </>
  );

  const pressableStyle = ({ pressed }: { pressed: boolean }): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: padY[size],
    paddingHorizontal: padX[size],
    borderRadius: radius * r,
    borderWidth: 1,
    borderColor: config.border,
    opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
    ...(fullWidth && { width: "100%" }),
  });

  if (useGradient) {
    const [gradStart, gradEnd] = buttonGradientColors(tokens);
    return (
      <Pressable
        style={({ pressed }) => [
          {
            borderRadius: radius * r,
            overflow: "hidden",
          },
          fullWidth && { width: "100%" },
          pressed && { opacity: 0.85 },
        ]}
        disabled={disabled}
        {...rest}
      >
        <LinearGradient
          colors={[gradStart, gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientButton,
            {
              paddingVertical: padY[size],
              paddingHorizontal: padX[size],
            },
          ]}
        >
          <AppText
            variant={textVariant[size]}
            color={tokens.surface_darkest}
            style={styles.buttonText}
          >
            {label}
          </AppText>
          {leftIcon && leftIcon}
          {rightIcon && rightIcon}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [pressableStyle({ pressed }), style as ViewStyle]}
      disabled={disabled}
      {...rest}
    >
      {buttonContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    flex: 1,
    textAlign: "center",
  },
});
