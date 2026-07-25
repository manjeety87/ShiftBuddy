import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";

import { BottomTabBar, type TabItem } from "@/components/common/BottomTabBar";

export default function TabLayout() {
  const tabs: TabItem[] = [
    { name: "index", label: "Home", icon: "house" },
    { name: "shifts", label: "Shifts", icon: "clock.fill" },
    { name: "calendar", label: "Calendar", icon: "calendar" },
    { name: "workplaces", label: "Jobs", icon: "briefcase.fill" },
    { name: "settings", label: "Settings", icon: "gearshape.fill" },
  ];

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => (
        <BottomTabBar
          tabs={tabs}
          activeTab={props.state.routeNames[props.state.index]}
          onTabPress={(name) => props.navigation.navigate(name as never)}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="shifts" options={{ title: "Shifts" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="workplaces" options={{ title: "Jobs" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
