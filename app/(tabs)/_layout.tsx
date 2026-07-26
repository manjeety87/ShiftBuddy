import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function TabLayout() {
  const { colors, theme } = useAppTheme();
  const isGlass = theme.tokens.glassOpacity > 0;
  const r = theme.tokens.radiusScale;
  // Brutalist (r=0) -> sharp rectangle nav, flush with edges (no floating
  // pill — the doc's "no border-radius ever" rule applies to nav too).
  // Glass themes -> floating pill lifted off the bottom edge, like the
  // reference: margins on all sides + fully rounded corners.
  const navRadius = 28 * r;
  const navMargin = r > 0 ? 16 : 0;
  const strokeWidth = theme.tokens.borderWidth ?? 1;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: theme.tokens.outline_variant,
        tabBarActiveBackgroundColor: `${theme.tokens.primary}1A`,
        tabBarStyle: {
          position: "absolute",
          left: navMargin,
          right: navMargin,
          bottom: navMargin,
          backgroundColor: isGlass ? "transparent" : `${colors.surface}CC`,
          borderWidth: strokeWidth,
          borderColor: `${theme.tokens.outline_variant}${r > 0 ? "26" : "FF"}`,
          borderRadius: navRadius,
          height: Platform.OS === "ios" ? 84 : 78,
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 20 : 12,
          overflow: "hidden",
          ...(Platform.OS === "web"
            ? {
                boxShadow: isGlass
                  ? `0px 12px 28px ${theme.tokens.ambientShadow}`
                  : "none",
              }
            : {
                elevation: isGlass ? 12 : 0,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: isGlass ? 0.28 : 0,
                shadowRadius: 28,
              }),
        },
        tabBarItemStyle: {
          borderRadius: 12 * r,
          marginHorizontal: 2,
          marginVertical: 4,
          minHeight: 42,
          overflow: "hidden",
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontSize: 11,
              fontWeight: focused ? "700" : "600",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color,
            }}
          >
            {children}
          </Text>
        ),
        tabBarIconStyle: {
          marginTop: 1,
        },
        tabBarBackground: () =>
          isGlass ? (
            <BlurView
              intensity={30}
              tint={theme.tokens.blurTint}
              experimentalBlurMethod="dimezisBlurView"
              style={{
                flex: 1,
                backgroundColor: `${colors.surface}CC`,
                borderRadius: navRadius,
              }}
            />
          ) : null,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={22}
              name={focused ? "view-dashboard" : "view-dashboard-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shifts"
        options={{
          title: "Shifts",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={22}
              name={focused ? "text-box-multiple" : "text-box-multiple-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={22}
              name={focused ? "calendar-month" : "calendar-month-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workplaces"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={22}
              name={focused ? "briefcase" : "briefcase-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              size={22}
              name={focused ? "cog" : "cog-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
