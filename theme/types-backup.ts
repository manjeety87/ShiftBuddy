export type ThemeCategory =
  | "default"
  | "developer"
  | "glass"
  | "fun"
  | "premium"
  | "custom";

/**
 * Material Design 3 Surface Hierarchy + Executive Premium tokens
 * Follows the "Orchestrator" design system (design.md)
 */
export interface ThemeTokens {
  // ── Core Surfaces (Tonal Depth Hierarchy) ────────────────────
  /** Darkest surface (#0b0e14) — Background floor */
  surface_darkest: string;
  /** Very low (#0f1219) — Nested/inset containers */
  surface_lowest: string;
  /** Low (#10131a) — Primary background */
  surface: string;
  /** Dim (#191c22) — Large structural blocks */
  surface_container_low: string;
  /** Default (#1d2026) — Primary cards */
  surface_container: string;
  /** High (#272a31) — Elevated/hovered state */
  surface_container_high: string;
  /** Highest (#2d3139) — Most elevated cards */
  surface_container_highest: string;
  /** Bright (#e8eef7) — Highlight for key info */
  surface_bright: string;

  // ── On-Surface Text Colors ────────────────────────────────────
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // ── Primary Brand Color (Electric Cobalt) ─────────────────────
  /** #ADC6FF */
  primary: string;
  /** #4b8eff — Used for gradients */
  primary_container: string;
  /** #adc6ff fixed dim — For text-only buttons */
  primary_fixed_dim: string;

  // ── Semantic Colors ──────────────────────────────────────────
  success: string;
  /** Burnt Orange/Peach (#ffb595) — For conflicts */
  tertiary: string;
  tertiary_container: string;
  warning: string;
  error: string;
  error_container: string;

  // ── Borders & Dividers ────────────────────────────────────────
  /** Use at 15% opacity for ghost borders */
  outline_variant: string;
  /** Used for subtle dividers in lists */
  outline: string;

  // ── Shadows & Elevation ──────────────────────────────────────
  shadow: string;
  /** Tinted glow for floating elements */
  ambient_shadow: string;

  // ── Backdrop & Overlay ────────────────────────────────────────
  overlay: string;
  /** For glass morphism (70% opacity + blur) */
  blurTint: "light" | "dark";
  glassOpacity: number;

  // ── Spacing Scale (Geometric) ────────────────────────────────
  /** Base spacing multiplier for consistent rhythm */
  spacingBase: number;

  // ── Corner Radius (Design System) ────────────────────────────
  radiusScale: number;

  // ── Backwards Compatibility ──────────────────────────────────
  /** Alias for primary (backwards compat) */
  accent?: string;
  /** Alias for surface_container (backwards compat) */
  card?: string;
  /** Alias for surface (backwards compat) */
  background?: string;
}

/**
 * Complete theme definition with metadata and token collection.
 */
export interface AppTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  tokens: ThemeTokens;
}
