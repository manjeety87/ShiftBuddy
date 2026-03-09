import { darkTheme, themeMap } from "@/theme";
import type { AppTheme } from "@/types";
import { create } from "zustand";

interface ThemeState {
  /** Currently active theme id */
  themeId: string;
  /** Resolved theme object */
  theme: AppTheme;
  /** Switch to a different theme */
  setTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeId: darkTheme.id,
  theme: darkTheme,
  setTheme: (id: string) => {
    const next = themeMap[id];
    if (next) {
      set({ themeId: id, theme: next });
    }
  },
}));
