// import { useAppTheme } from "@/hooks/use-app-theme";
// import React from "react";
// import { StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export function AppScreen({ children }: { children: React.ReactNode }) {
//   const { colors } = useAppTheme();

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         {
//           backgroundColor: colors.background,
//         },
//       ]}
//     >
//       {children}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";

import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { LiquidBackground } from "./liquid-background";

interface AppScreenProps {
  children: React.ReactNode;

  safeTop?: boolean;
  safeBottom?: boolean;

  showLiquidBackground?: boolean;

  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({
  children,

  safeTop = true,
  safeBottom = false,

  showLiquidBackground = true,

  style,
  contentStyle,
}: AppScreenProps) {
  const { tokens } = useAppTheme();

  const edges: Edge[] = ["left", "right"];

  if (safeTop) {
    edges.push("top");
  }

  if (safeBottom) {
    edges.push("bottom");
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: tokens.background,
        },
        style,
      ]}
    >
      <LiquidBackground visible={showLiquidBackground} />

      <SafeAreaView style={[styles.content, contentStyle]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },

  content: {
    flex: 1,
  },
});
