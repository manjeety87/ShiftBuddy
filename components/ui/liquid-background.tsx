// import { useAppTheme } from "@/hooks/use-app-theme";
// import { BlurView } from "expo-blur";
// import { LinearGradient } from "expo-linear-gradient";
// import React from "react";
// import { StyleSheet, View, useWindowDimensions } from "react-native";

// interface LiquidBackgroundProps {
//   visible?: boolean;
// }

// export function LiquidBackground({ visible = true }: LiquidBackgroundProps) {
//   const { tokens } = useAppTheme();

//   const { width, height } = useWindowDimensions();

//   if (!visible) {
//     return <View pointerEvents="none" style={styles.hiddenBackground} />;
//   }

//   const largestSide = Math.max(width, height);

//   return (
//     <View pointerEvents="none" style={StyleSheet.absoluteFill}>
//       <LinearGradient
//         colors={[tokens.backgroundGradientStart, tokens.backgroundGradientEnd]}
//         start={{
//           x: 0,
//           y: 0,
//         }}
//         end={{
//           x: 1,
//           y: 1,
//         }}
//         style={StyleSheet.absoluteFill}
//       />

//       <View
//         style={[
//           styles.blob,
//           {
//             width: largestSide * 0.58,
//             height: largestSide * 0.58,
//             borderRadius: largestSide,

//             top: -largestSide * 0.18,
//             left: -largestSide * 0.22,

//             backgroundColor: tokens.blobPrimary,

//             opacity: tokens.blobOpacity,
//           },
//         ]}
//       />

//       <View
//         style={[
//           styles.blob,
//           {
//             width: largestSide * 0.46,
//             height: largestSide * 0.46,
//             borderRadius: largestSide,

//             top: height * 0.32,
//             right: -largestSide * 0.2,

//             backgroundColor: tokens.blobSecondary,

//             opacity: tokens.blobOpacity * 0.9,
//           },
//         ]}
//       />

//       <View
//         style={[
//           styles.blob,
//           {
//             width: largestSide * 0.36,
//             height: largestSide * 0.36,
//             borderRadius: largestSide,

//             bottom: -largestSide * 0.16,
//             left: width * 0.08,

//             backgroundColor: tokens.blobTertiary,

//             opacity: tokens.blobOpacity * 0.72,
//           },
//         ]}
//       />

//       <BlurView
//         intensity={34}
//         tint={tokens.glassTint}
//         style={StyleSheet.absoluteFill}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   hiddenBackground: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "transparent",
//   },

//   blob: {
//     position: "absolute",
//     transform: [
//       {
//         scale: 1.12,
//       },
//     ],
//   },
// });

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import React from "react";

import { StyleSheet, View, useWindowDimensions } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

interface LiquidBackgroundProps {
  visible?: boolean;
}

export function LiquidBackground({ visible = true }: LiquidBackgroundProps) {
  const { tokens } = useAppTheme();

  const { width, height } = useWindowDimensions();

  if (!visible) {
    return null;
  }

  const largestSide = Math.max(width, height);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[tokens.backgroundGradientStart, tokens.backgroundGradientEnd]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.blob,
          {
            width: largestSide * 0.58,

            height: largestSide * 0.58,

            borderRadius: largestSide,

            top: -largestSide * 0.18,

            left: -largestSide * 0.22,

            backgroundColor: tokens.blobPrimary,

            opacity: tokens.blobOpacity,
          },
        ]}
      />

      <View
        style={[
          styles.blob,
          {
            width: largestSide * 0.46,

            height: largestSide * 0.46,

            borderRadius: largestSide,

            top: height * 0.32,

            right: -largestSide * 0.2,

            backgroundColor: tokens.blobSecondary,

            opacity: tokens.blobOpacity * 0.9,
          },
        ]}
      />

      <View
        style={[
          styles.blob,
          {
            width: largestSide * 0.36,

            height: largestSide * 0.36,

            borderRadius: largestSide,

            bottom: -largestSide * 0.16,

            left: width * 0.08,

            backgroundColor: tokens.blobTertiary,

            opacity: tokens.blobOpacity * 0.72,
          },
        ]}
      />

      <BlurView
        intensity={34}
        tint={tokens.glassTint}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,

    /*
     * React Native Web now expects
     * pointerEvents inside the style.
     */
    pointerEvents: "none",
  },

  blob: {
    position: "absolute",

    transform: [
      {
        scale: 1.12,
      },
    ],
  },
});
