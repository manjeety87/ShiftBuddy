import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppScreenProps extends ViewProps {
  /** Add safe-area top padding (default true) */
  safeTop?: boolean;
  /** Add safe-area bottom padding (default false) */
  safeBottom?: boolean;
  /** Extra horizontal padding (default 20) */
  px?: number;
}

/**
 * Full-screen container that fills the viewport with the current theme
 * background and respects safe-area insets.
 */
export function AppScreen({
  safeTop = true,
  safeBottom = false,
  px = 0,
  style,
  children,
  ...rest
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: safeTop ? insets.top : 0,
          paddingBottom: safeBottom ? insets.bottom : 0,
          paddingHorizontal: px,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
