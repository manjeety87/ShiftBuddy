import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useShiftStore, useThemeStore } from "@/store";
import { useEffect } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // ── Hydrate stores on first mount ──────────────────────────────
  const hydrateShifts = useShiftStore((s) => s.hydrate);
  const shiftsHydrated = useShiftStore((s) => s.hydrated);
  const storeUser = useShiftStore((s) => s.user);

  useEffect(() => {
    hydrateShifts();
  }, [hydrateShifts]);

  // ── Onboarding gate ────────────────────────────────────────────
  // After hydration, redirect to profile-setup if user hasn't set their name
  useEffect(() => {
    if (!shiftsHydrated) return;
    if (!storeUser || !storeUser.name.trim()) {
      router.replace("/profile-setup");
    }
  }, [shiftsHydrated, storeUser]);

  const blurTint = useThemeStore((s) => s.theme.tokens.blurTint);

  // Build a React Navigation theme from our tokens so header/background colors stay in sync
  const tokens = useThemeStore((s) => s.theme.tokens);
  const navTheme = {
    ...(blurTint === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(blurTint === "dark" ? DarkTheme : DefaultTheme).colors,
      background: tokens.background,
      card: tokens.surface,
      text: tokens.textPrimary,
      border: tokens.border,
      primary: tokens.accent,
    },
  };

  // Smooth modal transition config
  const modalOptions = {
    headerShown: false,
    presentation: "modal" as const,
    animation:
      Platform.OS === "ios"
        ? ("slide_from_bottom" as const)
        : ("fade_from_bottom" as const),
    animationDuration: 280,
    gestureEnabled: true,
    gestureDirection: "vertical" as const,
  };

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.background },
          animation: "fade" as const,
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
        <Stack.Screen name="add-shift" options={modalOptions} />
        <Stack.Screen name="add-workplace" options={modalOptions} />
        <Stack.Screen name="upload-shift" options={modalOptions} />
        <Stack.Screen name="custom-theme" options={modalOptions} />
        <Stack.Screen name="conflicts" options={modalOptions} />
        <Stack.Screen name="theme-selector" options={modalOptions} />
        <Stack.Screen
          name="modal"
          options={{ ...modalOptions, title: "Modal" }}
        />
      </Stack>
      <StatusBar style={blurTint === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
