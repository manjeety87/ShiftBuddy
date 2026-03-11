import { darkTheme, themeMap } from "@/theme";
import type { AppTheme } from "@/types";
import { create } from "zustand";

interface ThemeState {
  /** Currently active theme id */
  themeId: string;
  /** Resolved theme object */
  theme: AppTheme;
  /** User-created custom themes */
  customThemes: AppTheme[];
  /** Switch to a different theme */
  setTheme: (id: string) => void;
  /** Add or update a custom theme, and optionally activate it */
  saveCustomTheme: (theme: AppTheme, activate?: boolean) => void;
  /** Remove a custom theme by id */
  removeCustomTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: darkTheme.id,
  theme: darkTheme,
  customThemes: [],
  setTheme: (id: string) => {
    const builtIn = themeMap[id];
    if (builtIn) {
      set({ themeId: id, theme: builtIn });
      return;
    }
    const custom = get().customThemes.find((t) => t.id === id);
    if (custom) {
      set({ themeId: id, theme: custom });
    }
  },
  saveCustomTheme: (theme: AppTheme, activate = true) => {
    set((state) => {
      const existing = state.customThemes.findIndex((t) => t.id === theme.id);
      const updated =
        existing >= 0
          ? state.customThemes.map((t) => (t.id === theme.id ? theme : t))
          : [...state.customThemes, theme];
      return {
        customThemes: updated,
        ...(activate ? { themeId: theme.id, theme } : {}),
      };
    });
  },
  removeCustomTheme: (id: string) => {
    set((state) => {
      const updated = state.customThemes.filter((t) => t.id !== id);
      // If the removed theme was active, fall back to dark
      if (state.themeId === id) {
        return {
          customThemes: updated,
          themeId: darkTheme.id,
          theme: darkTheme,
        };
      }
      return { customThemes: updated };
    });
  },
}));

// import { create } from "zustand";
// import { themes } from "@/theme/theme.registry";

// interface ThemeState {
//   themeId: string;
//   setTheme: (id: string) => void;
// }

// export const useThemeStore = create<ThemeState>((set) => ({
//   themeId: "dark",

//   setTheme: (id) =>
//     set(() => ({
//       themeId: id,
//     })),
// }));

// export const getActiveTheme = (themeId: string) =>
//   themes.find((t) => t.id === themeId) ?? themes[0];
