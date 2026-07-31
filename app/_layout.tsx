import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";

import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";

import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

import { useFonts } from "expo-font";

import { router, Stack } from "expo-router";

import { StatusBar } from "expo-status-bar";

import { useEffect, useState } from "react";

import { Platform } from "react-native";

import "react-native-reanimated";

import { useConfigStore, useShiftStore, useThemeStore } from "@/store";

import SplashScreen from "./SplashScreen";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const hydrateShifts = useShiftStore((state) => state.hydrate);

  const shiftsHydrated = useShiftStore((state) => state.hydrated);

  const storeUser = useShiftStore((state) => state.user);

  const hydrateTheme = useThemeStore((state) => state.hydrate);

  const tokens = useThemeStore((state) => state.theme.tokens);

  const hydrateConfig = useConfigStore((state) => state.hydrate);

  const configHydrated = useConfigStore((state) => state.hydrated);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    void hydrateShifts();
  }, [hydrateShifts]);

  /*
   * This runs only after the app mounts.
   * It does not run during Expo Router web SSR.
   */
  useEffect(() => {
    void hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    void hydrateConfig();
  }, [hydrateConfig]);

  useEffect(() => {
    if (!shiftsHydrated || !fontsLoaded || !configHydrated) {
      return;
    }

    const splashTimer = setTimeout(() => {
      setSplashComplete(true);
    }, 1200);

    return () => {
      clearTimeout(splashTimer);
    };
  }, [shiftsHydrated, fontsLoaded, configHydrated]);

  useEffect(() => {
    if (!splashComplete) {
      return;
    }

    if (!storeUser || !storeUser.name.trim()) {
      router.replace("/profile-setup");
    }
  }, [splashComplete, storeUser]);

  if (!splashComplete) {
    return <SplashScreen />;
  }

  const isDark = tokens.mode === "dark";

  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseNavigationTheme,

    colors: {
      ...baseNavigationTheme.colors,

      primary: tokens.primary,
      background: tokens.background,
      card: tokens.surfaceElevated,
      text: tokens.textPrimary,
      border: tokens.border,
      notification: tokens.error,
    },
  };

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
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor: tokens.background,
          },

          animation: "fade",

          animationDuration: 200,
        }}
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="profile-setup"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen name="add-shift" options={modalOptions} />

        <Stack.Screen name="add-workplace" options={modalOptions} />

        <Stack.Screen name="upload-shift" options={modalOptions} />

        <Stack.Screen name="custom-theme" options={modalOptions} />

        <Stack.Screen name="conflicts" options={modalOptions} />

        <Stack.Screen name="theme-selector" options={modalOptions} />
      </Stack>

      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
