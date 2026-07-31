// import { BlurView } from "expo-blur";
// import React from "react";
// import { StyleSheet, View } from "react-native";

// import { useAppTheme } from "@/hooks/use-app-theme";
// import { cardPadding, cornerRadii } from "@/theme/design-system";

// interface AppCardProps {
//   children: React.ReactNode;
//   style?: any;
//   /** Conflict accent bar color (overrides default tertiary) */
//   conflictAccent?: string;
//   /** Show conflict state (left accent bar + soft background) */
//   isConflict?: boolean;
//   /** Use nested/inset appearance (surface_lowest background) */
//   isNested?: boolean;
//   /** Tonal surface tier (default: container) */
//   tier?: "lowest" | "low" | "container" | "high" | "highest";
// }

// export function AppCard({
//   children,
//   style,
//   conflictAccent,
//   isConflict,
//   isNested,
//   tier = "container",
// }: AppCardProps) {
//   const { theme } = useAppTheme();
//   const tokens = theme.tokens;

//   const isGlass = tokens.glassOpacity > 0;

//   // ── Background tier selection ──────────────────────────────────────
//   const tierMap: Record<string, string> = {
//     lowest: tokens.surface_lowest,
//     low: tokens.surface_container_low,
//     container: tokens.surface_container,
//     high: tokens.surface_container_high,
//     highest: tokens.surface_container_highest,
//   };

//   const backgroundColor = isNested ? tokens.surface_lowest : tierMap[tier];

//   // ── Conflict state styling ─────────────────────────────────────────
//   const conflictStyle = isConflict
//     ? {
//         borderLeftWidth: 4,
//         borderLeftColor: conflictAccent ?? tokens.tertiary,
//         paddingLeft: 12,
//         backgroundColor: tokens.tertiary_container + "0F", // Soft wash
//       }
//     : {};

//   const content = (
//     <View
//       style={[
//         styles.card,
//         {
//           backgroundColor,
//           paddingHorizontal: cardPadding(tokens, 3),
//           paddingVertical: cardPadding(tokens, 3),
//         },
//         conflictStyle,
//         style,
//       ]}
//     >
//       {children}
//     </View>
//   );

//   // ── Glass morphism for floating elements (if theme supports it) ─────
//   if (!isGlass) {
//     return content;
//   }

//   return (
//     <BlurView
//       intensity={60}
//       tint={tokens.blurTint}
//       style={styles.blurContainer}
//     >
//       {content}
//     </BlurView>
//   );
// }

// const styles = StyleSheet.create({
//   blurContainer: {
//     borderRadius: cornerRadii.lg,
//     overflow: "hidden",
//   },
//   card: {
//     borderRadius: cornerRadii.lg,
//     // ── NO BORDER — boundaries defined by background shifts only ────
//     // Conflict state adds a left accent bar in the style prop
//   },
// });

import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";

import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

interface AppCardProps extends Omit<ViewProps, "style"> {
  children: React.ReactNode;

  style?: StyleProp<ViewStyle>;

  padding?: number;
  accentBorder?: string;

  conflictAccent?: string;
  isConflict?: boolean;

  isNested?: boolean;

  tier?: "lowest" | "low" | "container" | "high" | "highest";
}

export function AppCard({
  children,
  style,

  padding = 18,

  accentBorder,
  conflictAccent,

  isConflict = false,
  isNested = false,

  tier = "container",

  ...viewProps
}: AppCardProps) {
  const { tokens } = useAppTheme();

  const tierMap = {
    lowest: tokens.backgroundSecondary,
    low: tokens.surfaceMuted,
    container: tokens.surfaceElevated,
    high: tokens.surfacePressed,
    highest: tokens.surfaceSelected,
  } as const;

  const backgroundColor = isNested
    ? tokens.surfaceMuted
    : tokens.glassOpacity > 0
      ? tokens.glassBackgroundStrong
      : tierMap[tier];

  const leftAccent = isConflict
    ? (conflictAccent ?? tokens.conflict)
    : accentBorder;

  // Android's `elevation` shadow is a quantized Material lookup table, not
  // a continuously tunable blur — even elevation:1-2 renders a visibly
  // large, saturated halo (worse with a tinted shadowColor), and no small
  // numeric tweak fixes that. So Android gets no elevation at all here;
  // the border (below) carries the card definition instead, matching
  // web's flat look. iOS's shadow is genuinely soft/continuous, so it
  // keeps a subtle one.
  const shadowStyle: ViewStyle =
    Platform.OS === "web"
      ? {
          boxShadow: `0px 8px 20px ${tokens.ambientShadow}`,
        }
      : Platform.OS === "android"
        ? {
            elevation: 0,
          }
        : {
            shadowColor: tokens.shadow,
            shadowOpacity: tokens.mode === "dark" ? 0.14 : 0.06,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: 5,
            },
          };

  return (
    <View
      {...viewProps}
      style={[
        styles.card,

        {
          padding,

          borderRadius: tokens.radiusLarge,

          backgroundColor,

          borderColor: accentBorder ?? tokens.glassBorder,

          borderWidth: tokens.borderWidth,

          borderLeftWidth: leftAccent ? 4 : tokens.borderWidth,

          borderLeftColor: leftAccent ?? accentBorder ?? tokens.glassBorder,

          ...shadowStyle,
        },

        isConflict && {
          backgroundColor: tokens.conflictSoft,
        },

        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});
