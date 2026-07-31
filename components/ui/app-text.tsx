import { useAppTheme } from "@/hooks/use-app-theme";
import { useConfigStore } from "@/store";
import { resolveFontFamily } from "@/theme/design-system";
import React from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

type AppTextVariant =
  | "largeTitle"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "bodyBold"
  | "caption"
  | "captionBold"
  | "label"
  | "overline";

interface AppTextProps extends TextProps {
  /** Typographic variant — controls size, weight, and line-height */
  variant?: AppTextVariant;
  /** Colour override — otherwise defaults by variant (primary or secondary) */
  color?: string;
  /** Center text */
  center?: boolean;
}

interface VariantMetrics {
  family: "Manrope" | "Inter";
  weight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: TextStyle["textTransform"];
}

/**
 * Base metrics at fontScale = 1. Actual rendered size is
 * fontSize/lineHeight * the user's Settings > Font Size scale
 * (store/config-store.ts), so this table is intentionally unscaled.
 */
const VARIANT_METRICS: Record<AppTextVariant, VariantMetrics> = {
  largeTitle: {
    family: "Manrope",
    weight: 800,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  title: {
    family: "Manrope",
    weight: 800,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  heading: {
    family: "Manrope",
    weight: 700,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  subheading: {
    family: "Manrope",
    weight: 600,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    family: "Inter",
    weight: 400,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyBold: {
    family: "Inter",
    weight: 600,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    family: "Inter",
    weight: 400,
    fontSize: 12,
    lineHeight: 16,
  },
  captionBold: {
    family: "Inter",
    weight: 600,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    family: "Inter",
    weight: 600,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1,
  },
  overline: {
    family: "Inter",
    weight: 700,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
};

/**
 * Theme-aware text primitive.
 * Always reads colour from the active theme unless overridden.
 */
export function AppText({
  variant = "body",
  color,
  center,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { colors } = useAppTheme();
  const fontScale = useConfigStore((state) => state.fontScale);

  const isSecondary =
    variant === "caption" ||
    variant === "captionBold" ||
    variant === "overline" ||
    variant === "label";

  const resolvedColor =
    color ?? (isSecondary ? colors.textSecondary : colors.textPrimary);

  const metrics = VARIANT_METRICS[variant];

  const variantStyle: TextStyle = {
    fontFamily: resolveFontFamily(metrics.family, metrics.weight),
    fontWeight: String(metrics.weight) as TextStyle["fontWeight"],
    fontSize: metrics.fontSize * fontScale,
    lineHeight: metrics.lineHeight * fontScale,
    letterSpacing: metrics.letterSpacing,
    textTransform: metrics.textTransform,
  };

  return (
    <Text
      style={[
        variantStyle,
        { color: resolvedColor },
        center && styles.center,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
});
