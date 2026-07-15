/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ORCHESTRATOR DESIGN SYSTEM UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Helper functions for building components that follow the design system.
 * Rules:
 * - No explicit 1px borders; use background shifts instead
 * - Glass morphism for floating elements
 * - Tonal layering for depth (not drop shadows)
 * - Geometric spacing scale
 * - Typography: Manrope (display) + Inter (body)
 */

import { TextStyle, ViewStyle } from "react-native";
import type { ThemeTokens } from "./types";

/**
 * SPACING SCALE (Geometric)
 *
 * Formula: base * (1.414 ^ n) where n is the scale level
 * Results in: 8, 11.3, 16, 22.6, 32, 45.3, 64, 90.5
 */
export function spacingScale(level: number, base: number = 8): number {
  return Math.round(base * Math.pow(1.414, level));
}

/**
 * Apply padding (Card Internal)
 * Default: spacingScale(3) = 1.4rem / 22px
 */
export function cardPadding(tokens: ThemeTokens, level: number = 3): number {
  return spacingScale(level);
}

/**
 * Gap between card groups
 * Default: spacingScale(4) = 2rem / 32px
 */
export function groupGap(tokens: ThemeTokens, level: number = 4): number {
  return spacingScale(level);
}

/**
 * Page margins (desktop/tablet)
 * Default: spacingScale(5) = 2.75rem / 44px or spacingScale(6) = 4rem / 64px
 */
export function pageMargin(tokens: ThemeTokens, level: number = 5): number {
  return spacingScale(level);
}

/**
 * CORNER RADIUS
 */
export const cornerRadii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // Default for cards
  xl: 20,
  full: 9999, // Pill-shaped
} as const;

/**
 * ELEVATION SHADOW (Only for floating elements like modals)
 * Use tinted glow instead of traditional drop shadow
 */
export function ambientShadowStyle(tokens: ThemeTokens): ViewStyle {
  return {
    shadowColor: tokens.shadow,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 48,
    elevation: 24,
  };
}

/**
 * GLASS MORPHISM (For floating headers/navigation)
 * 70% opacity + 20px backdrop blur
 */
export function glassMorphismStyle(tokens: ThemeTokens): ViewStyle {
  return {
    backgroundColor: tokens.surface + "B3", // 70% opacity
    // Note: backdropFilter/blurRadius may need platform-specific implementation
  };
}

/**
 * CARD BACKGROUND (Primary cards default to surface_container)
 */
export function cardBackgroundStyle(tokens: ThemeTokens): ViewStyle {
  return {
    backgroundColor: tokens.surface_container,
    borderRadius: cornerRadii.lg,
  };
}

/**
 * GHOST BORDER (Use thin outline at 15% opacity instead of solid 1px)
 * Only when truly necessary for accessibility
 */
export function ghostBorderStyle(tokens: ThemeTokens): ViewStyle {
  return {
    borderWidth: 1,
    borderColor: tokens.outline_variant + "26", // 15% opacity
    borderRadius: cornerRadii.md,
  };
}

/**
 * LEFT ACCENT BAR (For conflict indicators)
 * 4px left border using tertiary color in place of full outline
 */
export function leftAccentBarStyle(
  tokens: ThemeTokens,
  accentColor: string = tokens.tertiary,
): ViewStyle {
  return {
    borderLeftWidth: 4,
    borderLeftColor: accentColor,
    paddingLeft: 12,
  };
}

/**
 * CONFLICT STATE (Shifted background + left accent bar)
 */
export function conflictCardStyle(tokens: ThemeTokens): ViewStyle {
  return {
    backgroundColor: tokens.tertiary_container + "0f", // Soft tertiary wash
    borderLeftWidth: 4,
    borderLeftColor: tokens.tertiary,
  };
}

/**
 * BUTTON GRADIENT (Primary CTA)
 * Lithographic gradient from primary to primary_container
 */
export function buttonGradientColors(tokens: ThemeTokens): [string, string] {
  return [tokens.primary, tokens.primary_container];
}

/**
 * TEXT STYLES (Typography System)
 */
export const textStyles = {
  displayLarge: {
    fontFamily: "Manrope",
    fontSize: 56,
    fontWeight: "700" as const,
    lineHeight: 64,
  } as TextStyle,

  displayMedium: {
    fontFamily: "Manrope",
    fontSize: 45,
    fontWeight: "700" as const,
    lineHeight: 52,
  } as TextStyle,

  headlineLarge: {
    fontFamily: "Manrope",
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  } as TextStyle,

  headlineMedium: {
    fontFamily: "Manrope",
    fontSize: 28,
    fontWeight: "600" as const,
    lineHeight: 36,
  } as TextStyle,

  bodyLarge: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  } as TextStyle,

  bodySmall: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  } as TextStyle,

  labelLarge: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  labelMedium: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,

  labelSmall: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "600" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,
} as const;

/**
 * SURFACE TRANSITIONS (Tonal layering for state changes)
 */
export namespace surfaces {
  export const default_card = (tokens: ThemeTokens) => tokens.surface_container;
  export const hover_card = (tokens: ThemeTokens) =>
    tokens.surface_container_high;
  export const pressed_card = (tokens: ThemeTokens) =>
    tokens.surface_container_highest;
  export const nested_card = (tokens: ThemeTokens) => tokens.surface_lowest;
}

/**
 * COLOR PALETTE UTILITIES
 */
export namespace colors {
  export const onPrimary = (tokens: ThemeTokens) => tokens.surface_darkest;
  export const onSecondary = (tokens: ThemeTokens) => tokens.textPrimary;
  export const onError = (tokens: ThemeTokens) => tokens.surface_bright;
}
