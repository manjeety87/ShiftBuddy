/**
 * ─── Config Store ───────────────────────────────────────────────────
 *
 * Priority for Gemini API key:
 *   1. Manual override saved in AsyncStorage (user typed key in Settings)
 *   2. EXPO_PUBLIC_GEMINI_API_KEY from .env file
 *   3. Empty string → OCR falls back to demo mode
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const GEMINI_KEY_STORAGE = "shiftbuddy_gemini_api_key";
const FONT_SCALE_STORAGE = "shiftbuddy_font_scale";

// Env-file key (set EXPO_PUBLIC_GEMINI_API_KEY=yourkey in .env)
const ENV_GEMINI_KEY: string = (
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? ""
).trim();

/**
 * Multiplier applied to every AppText variant's fontSize/lineHeight
 * (see components/ui/app-text.tsx). 1 = the design system's original
 * sizes. Default is intentionally under 1 — the original sizes read as
 * oversized on most phones.
 */
export const DEFAULT_FONT_SCALE = 0.9;

export const FONT_SCALE_PRESETS = [
  { label: "Small", value: 0.85 },
  { label: "Default", value: DEFAULT_FONT_SCALE },
  { label: "Large", value: 1.0 },
  { label: "Extra Large", value: 1.15 },
] as const;

interface ConfigState {
  /** Active Gemini API key (env var, or manual override) */
  geminiApiKey: string;
  /** Whether user has a manual override over the env key */
  keyIsManualOverride: boolean;
  /** App-wide text scale multiplier, see FONT_SCALE_PRESETS */
  fontScale: number;
  /** Whether the store has been hydrated from storage */
  hydrated: boolean;
  /** Set/override the Gemini API key (saved to storage) */
  setGeminiApiKey: (key: string) => void;
  /** Clear manual override – fall back to env var */
  clearManualKey: () => void;
  /** Update the app-wide font scale (saved to storage) */
  setFontScale: (scale: number) => void;
  /** Load persisted overrides on app start */
  hydrate: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  geminiApiKey: ENV_GEMINI_KEY,
  keyIsManualOverride: false,
  fontScale: DEFAULT_FONT_SCALE,
  hydrated: false,

  setGeminiApiKey: (key: string) => {
    const trimmed = key.trim();
    set({
      geminiApiKey: trimmed || ENV_GEMINI_KEY,
      keyIsManualOverride: !!trimmed,
    });
    if (trimmed) {
      AsyncStorage.setItem(GEMINI_KEY_STORAGE, trimmed).catch(console.warn);
    } else {
      AsyncStorage.removeItem(GEMINI_KEY_STORAGE).catch(console.warn);
    }
  },

  clearManualKey: () => {
    set({ geminiApiKey: ENV_GEMINI_KEY, keyIsManualOverride: false });
    AsyncStorage.removeItem(GEMINI_KEY_STORAGE).catch(console.warn);
  },

  setFontScale: (scale: number) => {
    set({ fontScale: scale });
    AsyncStorage.setItem(FONT_SCALE_STORAGE, String(scale)).catch(
      console.warn,
    );
  },

  hydrate: async () => {
    try {
      const [savedKey, savedFontScale] = await Promise.all([
        AsyncStorage.getItem(GEMINI_KEY_STORAGE),
        AsyncStorage.getItem(FONT_SCALE_STORAGE),
      ]);

      const parsedFontScale = savedFontScale
        ? Number.parseFloat(savedFontScale)
        : NaN;

      set({
        geminiApiKey: savedKey?.trim() || ENV_GEMINI_KEY,
        keyIsManualOverride: !!savedKey?.trim(),
        fontScale: Number.isFinite(parsedFontScale)
          ? parsedFontScale
          : DEFAULT_FONT_SCALE,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));
