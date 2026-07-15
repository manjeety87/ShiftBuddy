import type { AppTheme } from "@/theme";
import { orchestratorTheme, themeMap } from "@/theme";
import { create } from "zustand";

interface ThemeState {
  themeId: string;
  theme: AppTheme;
  customThemes: AppTheme[];
  setTheme: (id: string) => void;
  saveCustomTheme: (theme: AppTheme, activate?: boolean) => void;
  removeCustomTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: orchestratorTheme.id,
  theme: orchestratorTheme,
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

      if (state.themeId === id) {
        return {
          customThemes: updated,
          themeId: orchestratorTheme.id,
          theme: orchestratorTheme,
        };
      }

      return { customThemes: updated };
    });
  },
}));
