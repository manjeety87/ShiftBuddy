import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { Platform, StyleProp, ViewStyle } from "react-native";

/**
 * Unified cross-platform icon component.
 * - iOS: Uses native SF Symbols via expo-symbols (supports weight, FILL, variable fonts)
 * - Android/Web: Falls back to MaterialCommunityIcons from @expo/vector-icons — the same
 *   icon font already used directly by the tab bar and Home screen, which is confirmed to
 *   actually render on-device (MaterialIcons was swapped out after persisting as blank).
 *
 * Icon names use SF Symbol naming convention. Add mappings in ICON_MAP for Android fallback.
 */

const ICON_MAP = {
  // Navigation
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.up": "chevron-up",
  "chevron.down": "chevron-down",
  "arrow.backward": "arrow-left",
  "arrow.forward": "arrow-right",
  xmark: "close",

  // Tab Bar / Main Navigation
  "house.fill": "home",
  house: "home-outline",
  "text.badge.plus": "clock-outline",
  calendar: "calendar-month",
  "briefcase.fill": "briefcase-outline",
  "gearshape.fill": "cog",
  gearshape: "cog-outline",

  // Actions
  plus: "plus",
  "plus.circle.fill": "plus-circle",
  "plus.app.fill": "plus-circle",
  "camera.fill": "camera",
  "photo.fill": "image",
  "photo.on.rectangle": "image-multiple",
  "cloud.upload.fill": "cloud-upload-outline",
  "doc.text.fill": "file-document-outline",
  magnifyingglass: "magnify",
  "bell.fill": "bell-outline",
  "bell.badge.fill": "bell-ring-outline",

  // Shift/Status
  "clock.fill": "clock-outline",
  clock: "clock-outline",
  checkmark: "check",
  "checkmark.circle.fill": "check-circle",
  "checkmark.circle": "check-circle-outline",
  "exclamationmark.triangle.fill": "alert",
  "exclamationmark.circle.fill": "alert-circle",
  "questionmark.circle.fill": "help-circle",
  "xmark.circle.fill": "close-circle",
  "trash.fill": "trash-can-outline",
  "flag.fill": "flag",
  flag: "flag-outline",
  "safari.fill": "compass",
  safari: "compass-outline",
  pencil: "pencil",
  "pencil.fill": "pencil",

  // Workplace/Location
  "mappin.and.ellipse": "map-marker",
  mappin: "map-marker",
  "location.fill": "map-marker",
  "building.2.fill": "domain",
  "building.2": "domain",

  // Notes/Text
  "note.text": "note-text-outline",

  // User/Profile
  "person.fill": "account",
  "person.circle.fill": "account-circle",
  "person.crop.circle.fill": "account-circle",

  // Settings/Config
  "slider.horizontal.3": "tune",
  "paintpalette.fill": "palette",
  "sun.max.fill": "white-balance-sunny",
  "eye.fill": "eye",

  // OCR/Upload
  "doc.text.viewfinder": "text-box-search-outline",
  viewfinder: "camera",
  sparkles: "creation",

  // Time/Calendar
  "calendar.badge.plus": "calendar-plus",
  "calendar.badge.clock": "calendar-clock",
  "clock.badge.checkmark": "check-all",

  // Conflict/Alert
  "exclamationmark.2": "alert-octagon",
  "exclamationmark.octagon.fill": "alert-decagram",

  // Money/Earnings
  "dollarsign.circle.fill": "currency-usd",
  "creditcard.fill": "credit-card-outline",

  // Sync/Refresh
  "arrow.clockwise": "refresh",
  "arrow.triangle.2.circlepath": "sync",
  "arrow.triangle.2.circlepath.circle.fill": "sync-circle",

  // More
  ellipsis: "dots-vertical",
  "ellipsis.circle": "dots-horizontal-circle",
  "line.3.horizontal": "menu",
  "line.3.horizontal.decrease": "menu",
} as const;

export type IconName = keyof typeof ICON_MAP;

export interface IconSymbolProps {
  /** SF Symbol name (e.g., "house.fill", "chevron.right") */
  name: IconName;
  /** Icon size in points */
  size?: number;
  /** Icon color (any valid React Native color) */
  color?: string;
  /** Additional style */
  style?: StyleProp<ViewStyle>;
  /** SF Symbol weight (iOS only) */
  weight?: SymbolWeight;
  /** SF Symbol FILL value 0-1 (iOS only) - maps to font-variation-settings FILL axis */
  fill?: 0 | 0.25 | 0.5 | 0.75 | 1;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Unified icon component using SF Symbols on iOS, Material Icons elsewhere.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <IconSymbol name="house.fill" size={24} color="#0052FF" />
 *
 * // Filled variant (iOS only - uses FILL axis)
 * <IconSymbol name="house.fill" fill={1} size={28} color="#0052FF" />
 *
 * // Outlined variant (iOS only)
 * <IconSymbol name="house" fill={0} size={28} color="#0052FF" />
 * ```
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
  fill = 0,
  accessibilityLabel,
}: IconSymbolProps) {
  const materialName = ICON_MAP[name];

  if (Platform.OS === "ios") {
    // Use native SF Symbols on iOS with variable font support
    const symbolProps: SymbolViewProps = {
      name: name as SymbolViewProps["name"],
      weight,
      tintColor: color,
      style: [{ width: size, height: size }, style] as StyleProp<ViewStyle>,
      accessibilityLabel,
    };

    // Apply FILL variation via font-variation-settings
    if (fill > 0) {
      return (
        <SymbolView
          {...symbolProps}
          style={[
            symbolProps.style,
            {
              fontVariationSettings: `'FILL' ${fill}, 'wght' ${weightToValue(
                weight,
              )}`,
            } as ViewStyle,
          ]}
        />
      );
    }

    return <SymbolView {...symbolProps} />;
  }

  // Android / Web fallback: MaterialCommunityIcons
  if (!materialName) {
    console.warn(
      `[IconSymbol] No MaterialCommunityIcons mapping for SF Symbol: "${name}"`,
    );
  }

  return (
    <MaterialCommunityIcons
      name={(materialName ?? "help-circle") as any}
      size={size}
      color={color}
      style={style as any}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

function weightToValue(weight: string): number {
  switch (weight) {
    case "ultralight":
      return 100;
    case "thin":
      return 200;
    case "light":
      return 300;
    case "regular":
      return 400;
    case "medium":
      return 500;
    case "semibold":
      return 600;
    case "bold":
      return 700;
    case "heavy":
      return 800;
    case "black":
      return 900;
    default:
      return 400;
  }
}

// Re-export for convenience
export type { SymbolWeight } from "expo-symbols";
export type { StyleProp, ViewStyle } from "react-native";

