// import { useThemeStore } from "@/store/theme-store";

// export function useAppTheme() {
//   const theme = useThemeStore((s) => s.theme);

//   const t = theme.tokens;
//   const accent = t.accent ?? t.primary;
//   const background = t.background ?? t.surface;
//   const card = t.card ?? t.surface_container;
//   const border = t.outline;

//   return {
//     theme,
//     colors: {
//       background,
//       surface: t.surface,
//       card,

//       text: t.textPrimary,
//       textPrimary: t.textPrimary,
//       textSecondary: t.textSecondary,
//       textTertiary: t.textTertiary,

//       accent,

//       success: t.success,
//       warning: t.warning,
//       error: t.error,
//       shadow: t.shadow,

//       border,
//     },
//   };
// }

import { useThemeStore } from "@/store/theme-store";

export function useAppTheme() {
  const theme = useThemeStore((state) => state.theme);

  const tokens = theme.tokens;

  return {
    theme,
    tokens,
    isDark: tokens.mode === "dark",

    /**
     * Temporary compatibility map.
     *
     * Existing screens can continue using colors.
     * New components should use tokens directly.
     */
    colors: {
      background: tokens.background,
      surface: tokens.surface,
      card: tokens.surfaceElevated,

      text: tokens.textPrimary,
      textPrimary: tokens.textPrimary,
      textSecondary: tokens.textSecondary,
      textTertiary: tokens.textTertiary,

      accent: tokens.primary,

      success: tokens.success,
      warning: tokens.warning,
      error: tokens.error,

      shadow: tokens.shadow,
      border: tokens.border,
    },
  };
}
