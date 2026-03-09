import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useThemeStore } from "@/store";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
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

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-shift"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="conflicts"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="theme-selector"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={blurTint === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
