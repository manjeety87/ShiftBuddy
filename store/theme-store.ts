// import type { AppTheme } from "@/theme";
// import { oceanFrostTheme, themeMap } from "@/theme";
// import { create } from "zustand";

// interface ThemeState {
//   themeId: string;
//   theme: AppTheme;
//   customThemes: AppTheme[];
//   setTheme: (id: string) => void;
//   saveCustomTheme: (theme: AppTheme, activate?: boolean) => void;
//   removeCustomTheme: (id: string) => void;
// }

// export const useThemeStore = create<ThemeState>((set, get) => ({
//   themeId: oceanFrostTheme.id,
//   theme: oceanFrostTheme,
//   customThemes: [],

//   setTheme: (id: string) => {
//     const builtIn = themeMap[id];
//     if (builtIn) {
//       set({ themeId: id, theme: builtIn });
//       return;
//     }

//     const custom = get().customThemes.find((t) => t.id === id);
//     if (custom) {
//       set({ themeId: id, theme: custom });
//     }
//   },

//   saveCustomTheme: (theme: AppTheme, activate = true) => {
//     set((state) => {
//       const existing = state.customThemes.findIndex((t) => t.id === theme.id);
//       const updated =
//         existing >= 0
//           ? state.customThemes.map((t) => (t.id === theme.id ? theme : t))
//           : [...state.customThemes, theme];

//       return {
//         customThemes: updated,
//         ...(activate ? { themeId: theme.id, theme } : {}),
//       };
//     });
//   },

//   removeCustomTheme: (id: string) => {
//     set((state) => {
//       const updated = state.customThemes.filter((t) => t.id !== id);

//       if (state.themeId === id) {
//         return {
//           customThemes: updated,
//           themeId: oceanFrostTheme.id,
//           theme: oceanFrostTheme,
//         };
//       }

//       return { customThemes: updated };
//     });
//   },
// }));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";

import { defaultTheme, themeMap, type AppTheme } from "@/theme";

const THEME_STORAGE_KEY = "shiftbuddy-theme-preferences";

const LEGACY_THEME_STORAGE_KEY = "shiftbuddy-theme";

interface PersistedThemeState {
  themeId: string;
  customThemes: AppTheme[];
}

interface ThemeState {
  themeId: string;
  theme: AppTheme;
  customThemes: AppTheme[];

  hasHydrated: boolean;
  isHydrating: boolean;

  hydrate: () => Promise<void>;

  setTheme: (id: string) => void;

  saveCustomTheme: (theme: AppTheme, activate?: boolean) => void;

  removeCustomTheme: (id: string) => void;

  resetTheme: () => void;
}

function canUseStorage(): boolean {
  if (Platform.OS !== "web") {
    return true;
  }

  return typeof window !== "undefined";
}

function resolveTheme(id: string, customThemes: AppTheme[]): AppTheme {
  const builtInTheme = themeMap[id];

  if (builtInTheme) {
    return builtInTheme;
  }

  const customTheme = customThemes.find((theme) => theme.id === id);

  return customTheme ?? defaultTheme;
}

function isAppTheme(value: unknown): value is AppTheme {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const theme = value as Partial<AppTheme>;

  return (
    typeof theme.id === "string" &&
    typeof theme.name === "string" &&
    typeof theme.category === "string" &&
    typeof theme.tokens === "object" &&
    theme.tokens !== null
  );
}

function parseStoredPreferences(
  storedValue: string,
): PersistedThemeState | null {
  try {
    const parsed = JSON.parse(storedValue) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    /*
     * Supports both:
     *
     * Manual storage:
     * {
     *   themeId,
     *   customThemes
     * }
     *
     * Old Zustand persist storage:
     * {
     *   state: {
     *     themeId,
     *     customThemes
     *   }
     * }
     */
    const parsedRecord = parsed as Record<string, unknown>;

    const possibleState =
      typeof parsedRecord.state === "object" && parsedRecord.state !== null
        ? parsedRecord.state
        : parsedRecord;

    const state = possibleState as Record<string, unknown>;

    const themeId =
      typeof state.themeId === "string" ? state.themeId : defaultTheme.id;

    const customThemes = Array.isArray(state.customThemes)
      ? state.customThemes.filter(isAppTheme)
      : [];

    return {
      themeId,
      customThemes,
    };
  } catch {
    return null;
  }
}

async function loadThemePreferences(): Promise<{
  preferences: PersistedThemeState;
  storageKey: string;
} | null> {
  if (!canUseStorage()) {
    return null;
  }

  const currentStoredValue = await AsyncStorage.getItem(THEME_STORAGE_KEY);

  if (currentStoredValue) {
    const preferences = parseStoredPreferences(currentStoredValue);

    if (preferences) {
      return {
        preferences,
        storageKey: THEME_STORAGE_KEY,
      };
    }
  }

  const legacyStoredValue = await AsyncStorage.getItem(
    LEGACY_THEME_STORAGE_KEY,
  );

  if (!legacyStoredValue) {
    return null;
  }

  const legacyPreferences = parseStoredPreferences(legacyStoredValue);

  if (!legacyPreferences) {
    return null;
  }

  return {
    preferences: legacyPreferences,
    storageKey: LEGACY_THEME_STORAGE_KEY,
  };
}

async function saveThemePreferences(
  preferences: PersistedThemeState,
): Promise<void> {
  if (!canUseStorage()) {
    return;
  }

  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn("Unable to save the selected theme.", error);
  }
}

async function removeSavedTheme(): Promise<void> {
  if (!canUseStorage()) {
    return;
  }

  try {
    await Promise.all([
      AsyncStorage.removeItem(THEME_STORAGE_KEY),

      AsyncStorage.removeItem(LEGACY_THEME_STORAGE_KEY),
    ]);
  } catch (error) {
    console.warn("Unable to clear the saved theme.", error);
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeId: defaultTheme.id,
  theme: defaultTheme,
  customThemes: [],

  hasHydrated: false,
  isHydrating: false,

  hydrate: async () => {
    const currentState = get();

    if (currentState.hasHydrated || currentState.isHydrating) {
      return;
    }

    /*
     * Expo Router renders web pages on the server.
     * AsyncStorage must not run during server rendering.
     */
    if (!canUseStorage()) {
      return;
    }

    set({
      isHydrating: true,
    });

    try {
      const savedResult = await loadThemePreferences();

      if (!savedResult) {
        set({
          hasHydrated: true,
          isHydrating: false,
        });

        return;
      }

      const { preferences, storageKey } = savedResult;

      const customThemes = preferences.customThemes;

      const theme = resolveTheme(preferences.themeId, customThemes);

      set({
        themeId: theme.id,
        theme,
        customThemes,
        hasHydrated: true,
        isHydrating: false,
      });

      /*
       * Migrate old Zustand storage to the
       * new storage format.
       */
      if (storageKey === LEGACY_THEME_STORAGE_KEY) {
        await saveThemePreferences({
          themeId: theme.id,
          customThemes,
        });

        await AsyncStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Unable to restore the saved theme.", error);

      set({
        themeId: defaultTheme.id,
        theme: defaultTheme,
        customThemes: [],
        hasHydrated: true,
        isHydrating: false,
      });
    }
  },

  setTheme: (id) => {
    const customThemes = get().customThemes;

    const theme = resolveTheme(id, customThemes);

    set({
      themeId: theme.id,
      theme,
    });

    void saveThemePreferences({
      themeId: theme.id,
      customThemes,
    });
  },

  saveCustomTheme: (theme, activate = true) => {
    const currentState = get();

    const alreadyExists = currentState.customThemes.some(
      (item) => item.id === theme.id,
    );

    const customThemes = alreadyExists
      ? currentState.customThemes.map((item) =>
          item.id === theme.id ? theme : item,
        )
      : [...currentState.customThemes, theme];

    const nextTheme = activate ? theme : currentState.theme;

    set({
      customThemes,
      themeId: nextTheme.id,
      theme: nextTheme,
    });

    void saveThemePreferences({
      themeId: nextTheme.id,
      customThemes,
    });
  },

  removeCustomTheme: (id) => {
    const currentState = get();

    const customThemes = currentState.customThemes.filter(
      (theme) => theme.id !== id,
    );

    const removedActiveTheme = currentState.themeId === id;

    const nextTheme = removedActiveTheme ? defaultTheme : currentState.theme;

    set({
      customThemes,
      themeId: nextTheme.id,
      theme: nextTheme,
    });

    void saveThemePreferences({
      themeId: nextTheme.id,
      customThemes,
    });
  },

  resetTheme: () => {
    set({
      themeId: defaultTheme.id,
      theme: defaultTheme,
      customThemes: [],
    });

    void removeSavedTheme();
  },
}));
