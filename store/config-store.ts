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

// Env-file key (set EXPO_PUBLIC_GEMINI_API_KEY=yourkey in .env)
const ENV_GEMINI_KEY: string = (
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? ""
).trim();

interface ConfigState {
  /** Active Gemini API key (env var, or manual override) */
  geminiApiKey: string;
  /** Whether user has a manual override over the env key */
  keyIsManualOverride: boolean;
  /** Whether the store has been hydrated from storage */
  hydrated: boolean;
  /** Set/override the Gemini API key (saved to storage) */
  setGeminiApiKey: (key: string) => void;
  /** Clear manual override – fall back to env var */
  clearManualKey: () => void;
  /** Load persisted overrides on app start */
  hydrate: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  geminiApiKey: ENV_GEMINI_KEY,
  keyIsManualOverride: false,
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

  hydrate: async () => {
    try {
      const savedKey = await AsyncStorage.getItem(GEMINI_KEY_STORAGE);
      set({
        geminiApiKey: savedKey?.trim() || ENV_GEMINI_KEY,
        keyIsManualOverride: !!savedKey?.trim(),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
}));
