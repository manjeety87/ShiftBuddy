import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";

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

  const isSecondary =
    variant === "caption" ||
    variant === "captionBold" ||
    variant === "overline" ||
    variant === "label";

  const resolvedColor =
    color ?? (isSecondary ? colors.textSecondary : colors.textPrimary);

  return (
    <Text
      style={[
        variantStyles[variant],
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

const variantStyles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 41,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  subheading: { fontSize: 17, fontWeight: "600", lineHeight: 22 },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 21 },
  bodyBold: { fontSize: 15, fontWeight: "600", lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    lineHeight: 14,
  },
  overline: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    lineHeight: 14,
    textTransform: "uppercase",
  },
});
