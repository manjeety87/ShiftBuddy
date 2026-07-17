// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { router, Stack } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { Platform } from "react-native";
// import "react-native-reanimated";

// import { useShiftStore, useThemeStore } from "@/store";
// import { useEffect, useState } from "react";
// import SplashScreen from "./SplashScreen";

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

// export default function RootLayout() {
//   // ── Hydrate stores on first mount ──────────────────────────────
//   const hydrateShifts = useShiftStore((s) => s.hydrate);
//   const shiftsHydrated = useShiftStore((s) => s.hydrated);
//   const storeUser = useShiftStore((s) => s.user);
//   const [splashComplete, setSplashComplete] = useState(false);

//   useEffect(() => {
//     hydrateShifts();
//   }, [hydrateShifts]);

//   // ── Get theme early (before any conditional returns) ────────────
//   const blurTint = useThemeStore((s) => s.theme.tokens.blurTint);
//   const tokens = useThemeStore((s) => s.theme.tokens);

//   // ── Splash screen gate: Show for minimum duration ────────────────
//   useEffect(() => {
//     if (!shiftsHydrated) return;

//     // Show splash for at least 1.2 seconds for visual effect
//     const splashTimer = setTimeout(() => {
//       setSplashComplete(true);
//     }, 1200);

//     return () => clearTimeout(splashTimer);
//   }, [shiftsHydrated]);

//   // ── Onboarding gate ────────────────────────────────────────────
//   // After splash and hydration, redirect to profile-setup if user hasn't set their name
//   useEffect(() => {
//     if (!splashComplete) return;
//     if (!storeUser || !storeUser.name.trim()) {
//       router.replace("/profile-setup");
//     }
//   }, [splashComplete, storeUser]);

//   // ── Show splash screen during initial load ─────────────────────
//   if (!splashComplete) {
//     return <SplashScreen />;
//   }
//   const navTheme = {
//     ...(blurTint === "dark" ? DarkTheme : DefaultTheme),
//     colors: {
//       ...(blurTint === "dark" ? DarkTheme : DefaultTheme).colors,
//       background: tokens.background || "#10131a",
//       card: tokens.surface || "#10131a",
//       text: tokens.textPrimary || "#e1e2eb",
//       primary: tokens.accent || "#adc6ff",
//     },
//   };

//   // Smooth modal transition config
//   const modalOptions = {
//     headerShown: false,
//     presentation: "modal" as const,
//     animation:
//       Platform.OS === "ios"
//         ? ("slide_from_bottom" as const)
//         : ("fade_from_bottom" as const),
//     animationDuration: 280,
//     gestureEnabled: true,
//     gestureDirection: "vertical" as const,
//   };

//   return (
//     <ThemeProvider value={navTheme}>
//       <Stack
//         screenOptions={{
//           headerShown: false,
//           contentStyle: { backgroundColor: tokens.background },
//           animation: "fade" as const,
//           animationDuration: 200,
//         }}
//       >
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
//         <Stack.Screen name="add-shift" options={modalOptions} />
//         <Stack.Screen name="add-workplace" options={modalOptions} />
//         <Stack.Screen name="upload-shift" options={modalOptions} />
//         <Stack.Screen name="custom-theme" options={modalOptions} />
//         <Stack.Screen name="conflicts" options={modalOptions} />
//         <Stack.Screen name="theme-selector" options={modalOptions} />
//         {/* <Stack.Screen
//           name="modal"
//           options={{ ...modalOptions, title: "Modal" }}
//         /> */}
//       </Stack>
//       <StatusBar style={blurTint === "dark" ? "light" : "dark"} />
//     </ThemeProvider>
//   );
// }

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { router, Stack } from "expo-router";

import { StatusBar } from "expo-status-bar";

import { useEffect, useState } from "react";

import { Platform } from "react-native";

import "react-native-reanimated";

import { useShiftStore, useThemeStore } from "@/store";

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
    if (!shiftsHydrated) {
      return;
    }

    const splashTimer = setTimeout(() => {
      setSplashComplete(true);
    }, 1200);

    return () => {
      clearTimeout(splashTimer);
    };
  }, [shiftsHydrated]);

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
