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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: theme.tokens.outline_variant,
        tabBarActiveBackgroundColor: `${theme.tokens.primary}1A`,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isGlass ? "transparent" : `${colors.surface}CC`,
          borderTopColor: `${theme.tokens.outline_variant}26`,
          borderTopWidth: 1,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          height: Platform.OS === "ios" ? 94 : 88,
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 24 : 16,
          elevation: 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.3,
          shadowRadius: 24,
        },
        tabBarItemStyle: {
          borderRadius: 12,
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
              style={{
                flex: 1,
                backgroundColor: `${colors.surface}CC`,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
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
        name="explore"
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
