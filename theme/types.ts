// export type ThemeCategory =
//   | "default"
//   | "developer"
//   | "glass"
//   | "fun"
//   | "premium"
//   | "custom";

// /**
//  * Material Design 3 Surface Hierarchy + Executive Premium tokens
//  * Follows the "Orchestrator" design system (design.md)
//  */
// export interface ThemeTokens {
//   // ── Core Surfaces (Tonal Depth Hierarchy) ────────────────────
//   /** Darkest surface (#0b0e14) — Background floor */
//   surface_darkest: string;
//   /** Very low (#0f1219) — Nested/inset containers */
//   surface_lowest: string;
//   /** Low (#10131a) — Primary background */
//   surface: string;
//   /** Dim (#191c22) — Large structural blocks */
//   surface_container_low: string;
//   /** Default (#1d2026) — Primary cards */
//   surface_container: string;
//   /** High (#272a31) — Elevated/hovered state */
//   surface_container_high: string;
//   /** Highest (#2d3139) — Most elevated cards */
//   surface_container_highest: string;
//   /** Bright (#e8eef7) — Highlight for key info */
//   surface_bright: string;

//   // ── On-Surface Text Colors ────────────────────────────────────
//   textPrimary: string;
//   textSecondary: string;
//   textTertiary: string;

//   // ── Primary Brand Color (Electric Cobalt) ─────────────────────
//   /** #ADC6FF */
//   primary: string;
//   /** #4b8eff — Used for gradients */
//   primary_container: string;
//   /** #adc6ff fixed dim — For text-only buttons */
//   primary_fixed_dim: string;

//   // ── Semantic Colors ──────────────────────────────────────────
//   success: string;
//   /** Burnt Orange/Peach (#ffb595) — For conflicts */
//   tertiary: string;
//   tertiary_container: string;
//   warning: string;
//   error: string;
//   error_container: string;

//   // ── Borders & Dividers ────────────────────────────────────────
//   /** Use at 15% opacity for ghost borders */
//   outline_variant: string;
//   /** Used for subtle dividers in lists */
//   outline: string;

//   // ── Shadows & Elevation ──────────────────────────────────────
//   shadow: string;
//   /** Tinted glow for floating elements */
//   ambient_shadow: string;

//   // ── Backdrop & Overlay ────────────────────────────────────────
//   overlay: string;
//   /** For glass morphism (70% opacity + blur) */
//   blurTint: "light" | "dark";
//   glassOpacity: number;

//   // ── Spacing Scale (Geometric) ────────────────────────────────
//   /** Base spacing multiplier for consistent rhythm */
//   spacingBase: number;

//   // ── Corner Radius (Design System) ────────────────────────────
//   radiusScale: number;

//   // ── Structural Style (added for Brutalist-family themes) ─────
//   /** Border thickness in px for cards/inputs/buttons. Glass themes: 1. Brutalist: 3-5. Default 1 if unset. */
//   borderWidth?: number;
//   /** Whether primary buttons/CTAs use a gradient fill. Brutalist themes set this false for flat color. Default true if unset. */
//   useGradients?: boolean;

//   // ── Backwards Compatibility ──────────────────────────────────
//   /** Alias for primary (backwards compat) */
//   accent?: string;
//   /** Alias for surface_container (backwards compat) */
//   card?: string;
//   /** Alias for surface (backwards compat) */
//   background?: string;
// }

// /**
//  * Complete theme definition with metadata and token collection.
//  */
// export interface AppTheme {
//   id: string;
//   name: string;
//   category: ThemeCategory;
//   tokens: ThemeTokens;
// }

export type ThemeMode = "light" | "dark";

/**
 * These categories are temporarily retained because the current theme selector
 * still groups themes using them. We can simplify them after redesigning the
 * complete theme selector screen.
 */
export type ThemeCategory = "standard" | "developer" | "premium" | "fun";

/**
 * Single semantic theme contract for the complete ShiftBuddy UI.
 *
 * New components should use semantic properties such as:
 * background, surfaceElevated, glassBackground, primary and textPrimary.
 *
 * Compatibility aliases at the bottom keep existing screens working while
 * we migrate them one by one.
 */
export interface ThemeTokens {
  // Appearance
  mode: ThemeMode;

  // App background
  background: string;
  backgroundSecondary: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;

  blobPrimary: string;
  blobSecondary: string;
  blobTertiary: string;
  blobOpacity: number;

  // Surfaces
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  surfaceSelected: string;
  surfacePressed: string;

  // Glass
  glassBackground: string;
  glassBackgroundStrong: string;
  glassBorder: string;
  glassHighlight: string;
  glassTint: "light" | "dark";
  glassBlur: number;
  glassOpacity: number;

  // Text and icons
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;
  textOnDanger: string;

  iconPrimary: string;
  iconSecondary: string;
  iconOnPrimary: string;

  // Brand
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;

  // Semantic states
  success: string;
  successSoft: string;

  warning: string;
  warningSoft: string;

  error: string;
  errorSoft: string;

  conflict: string;
  conflictSoft: string;

  // Structure
  border: string;
  borderStrong: string;
  divider: string;

  overlay: string;
  shadow: string;
  ambientShadow: string;

  // Shape
  radiusSmall: number;
  radiusMedium: number;
  radiusLarge: number;
  radiusXLarge: number;
  radiusPill: number;

  // ── Temporary compatibility aliases ────────────────────────────
  // Existing screens still use these names. We will remove them
  // gradually while refactoring each screen.

  surface_darkest: string;
  surface_lowest: string;
  surface_container_low: string;
  surface_container: string;
  surface_container_high: string;
  surface_container_highest: string;
  surface_bright: string;

  primary_container: string;
  primary_fixed_dim: string;

  tertiary: string;
  tertiary_container: string;

  error_container: string;

  outline_variant: string;
  outline: string;

  ambient_shadow: string;

  blurTint: "light" | "dark";
  spacingBase: number;
  radiusScale: number;
  borderWidth: number;
  useGradients: boolean;

  accent: string;
  card: string;
  gradientStart: string;
  gradientEnd: string;
  highlight: string;
  muted: string;
}

export interface AppTheme {
  id: string;
  name: string;
  description?: string;
  category: ThemeCategory;
  tokens: ThemeTokens;

  /**
   * Temporary compatibility property used by the current theme selector.
   */
  isPremium?: boolean;
}
