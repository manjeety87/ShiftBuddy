import { useAppTheme } from "@/hooks/use-app-theme";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface GlassHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Whether to include safe area top padding (default true) */
  safeTop?: boolean;
}

/**
 * Translucent header bar with blur effect on iOS.
 * Falls back to a solid tinted surface on Android / non-glass themes.
 */
export function GlassHeader({
  children,
  style,
  safeTop = true,
}: GlassHeaderProps) {
  const { colors, theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isGlass = theme.tokens.glassOpacity > 0;

  const containerStyle: ViewStyle = {
    paddingTop: safeTop ? insets.top + 8 : 8,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  };

  if (isGlass && Platform.OS === "ios") {
    return (
      <View style={[styles.wrapper, style]}>
        <BlurView
          intensity={Math.round(theme.tokens.glassOpacity * 80)}
          tint={theme.tokens.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.overlay,
            { backgroundColor: colors.surface, opacity: 0.3 },
          ]}
        />
        <View style={containerStyle}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: colors.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
