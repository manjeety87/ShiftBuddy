import { AppText } from "@/components/ui/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

export interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (name: string) => void;
  style?: StyleProp<ViewStyle>;
  /** Show labels under icons */
  showLabels?: boolean;
}

export interface TabItem {
  name: string; // Route name (e.g., "index", "shifts")
  label: string; // Label (e.g., "Home", "Shifts")
  icon: string; // SF Symbol name (e.g., "house.fill")
  iconFilled?: string; // Optional filled variant
}

/**
 * Floating pill-style bottom tab bar matching the HTML design.
 * - Glass/blur background
 * - Active tab: filled circle with filled icon
 * - Inactive tabs: outlined icons with labels
 * - Centered, floating above content with padding
 */
export function BottomTabBar({
  tabs,
  activeTab,
  onTabPress,
  style,
  showLabels = true,
}: BottomTabBarProps) {
  const { tokens, theme } = useAppTheme();
  const isGlass = theme.tokens.glassOpacity > 0;
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.name === activeTab),
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isGlass
            ? "transparent"
            : `${tokens.surfaceElevated}CC`,
        },
        style,
      ]}
    >
      {isGlass && (
        <BlurView
          intensity={28}
          tint={theme.tokens.blurTint}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.innerContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.name;
          const iconName =
            isActive && tab.iconFilled ? tab.iconFilled : tab.icon;

          return (
            <Pressable
              key={tab.name}
              onPress={() => onTabPress(tab.name)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                pressed && styles.tabPressed,
                {
                  backgroundColor: isActive ? tokens.primary : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isActive && index === activeIndex && styles.iconWrapperActive,
                ]}
              >
                <IconSymbol
                  name={iconName as any}
                  size={isActive ? 22 : 22}
                  color={isActive ? tokens.textOnPrimary : tokens.textSecondary}
                  fill={isActive ? 1 : 0}
                  weight={isActive ? "semibold" : "regular"}
                />
              </View>

              {showLabels && !isActive && (
                <AppText
                  style={[styles.label, { color: tokens.textSecondary }]}
                >
                  {tab.label}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    maxWidth: 448,
    alignSelf: "center",
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#003ec7",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tab: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 56,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tabActive: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  tabPressed: {
    opacity: 0.9,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    lineHeight: 12,
    fontWeight: "600",
  },
});
