import { useThemeStore } from "@/store";
import type { AppTheme, ThemeTokens } from "@/types";
import { useMemo } from "react";

/**
 * Returns the current theme and resolved tokens.
 * The whole app should read colours through this hook.
 */
export function useAppTheme(): { theme: AppTheme; colors: ThemeTokens } {
  const theme = useThemeStore((s) => s.theme);
  return useMemo(() => ({ theme, colors: theme.tokens }), [theme]);
}
