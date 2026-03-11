import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { FadeInView } from "@/components/ui/fade-in-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeStore } from "@/store";
import { darkTheme } from "@/theme";
import type { AppTheme, ThemeTokens } from "@/types";
import * as Crypto from "expo-crypto";

// ─── Color Presets ──────────────────────────────────────────────────
const ACCENT_PRESETS = [
  "#3B82F6",
  "#60A5FA",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#F43F5E",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#64FFDA",
  "#818CF8",
];

const BG_PRESETS = [
  { label: "Pure Black", bg: "#000000", surface: "#111111", card: "#1A1A1A" },
  { label: "Dark", bg: "#0F1117", surface: "#1A1D27", card: "#1E2230" },
  { label: "Navy", bg: "#0B1628", surface: "#112240", card: "#172A4A" },
  { label: "Midnight", bg: "#07080D", surface: "#0E1018", card: "#141722" },
  { label: "Charcoal", bg: "#1C1C1E", surface: "#2C2C2E", card: "#3A3A3C" },
  { label: "Warm Dark", bg: "#1A1614", surface: "#27211E", card: "#332C28" },
  { label: "Light", bg: "#F8F9FB", surface: "#FFFFFF", card: "#FFFFFF" },
  { label: "Cream", bg: "#FFF8EE", surface: "#FFFFFF", card: "#FFFAF3" },
  { label: "Cool Gray", bg: "#F1F5F9", surface: "#FFFFFF", card: "#FFFFFF" },
];

// ─── Editable token keys ────────────────────────────────────────────
type EditableKey =
  | "accent"
  | "background"
  | "surface"
  | "card"
  | "textPrimary"
  | "textSecondary"
  | "success"
  | "warning"
  | "error"
  | "border";

const EDITABLE_FIELDS: { key: EditableKey; label: string; icon: string }[] = [
  { key: "accent", label: "Accent", icon: "paintpalette.fill" },
  { key: "background", label: "Background", icon: "rectangle.fill" },
  { key: "surface", label: "Surface", icon: "square.fill" },
  { key: "card", label: "Card", icon: "rectangle.on.rectangle.fill" },
  { key: "textPrimary", label: "Text", icon: "textformat" },
  { key: "textSecondary", label: "Text 2nd", icon: "textformat.alt" },
  { key: "success", label: "Success", icon: "checkmark.circle.fill" },
  { key: "warning", label: "Warning", icon: "exclamationmark.triangle.fill" },
  { key: "error", label: "Error", icon: "xmark.circle.fill" },
  { key: "border", label: "Border", icon: "square.dashed" },
];

const isValidHex = (c: string) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(c);

// ─── Component ──────────────────────────────────────────────────────
export default function CustomThemeScreen() {
  const { colors: liveColors } = useAppTheme();
  const saveCustomTheme = useThemeStore((s) => s.saveCustomTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const prevThemeId = useRef(useThemeStore.getState().themeId);

  // Working copy of tokens – starts from dark theme base
  const [tokens, setTokens] = useState<ThemeTokens>({
    ...darkTheme.tokens,
  });
  const [themeName, setThemeName] = useState("My Theme");
  const [activeField, setActiveField] = useState<EditableKey>("accent");
  const [hexInput, setHexInput] = useState(tokens.accent);

  // For live preview we temporarily apply the WIP theme
  const previewTheme = useMemo<AppTheme>(
    () => ({
      id: "__preview__",
      name: themeName,
      category: "fun",
      tokens,
      isPremium: false,
    }),
    [tokens, themeName],
  );

  // Apply preview live
  const applyPreview = useCallback(() => {
    saveCustomTheme(previewTheme, true);
  }, [previewTheme, saveCustomTheme]);

  // Update a single token
  const updateToken = useCallback((key: EditableKey, value: string) => {
    setTokens((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-derive gradientStart from accent
      if (key === "accent") {
        next.gradientStart = value;
      }
      // Auto-derive blurTint from background brightness
      if (key === "background") {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        const lum = (r * 299 + g * 587 + b * 114) / 1000;
        next.blurTint = lum > 128 ? "light" : "dark";
        next.textPrimary = lum > 128 ? "#1A1D21" : "#F1F3F5";
        next.textSecondary = lum > 128 ? "#6B7280" : "#9BA1AE";
        next.border = lum > 128 ? "#E5E7EB" : "#2A2F3E";
        next.shadow = lum > 128 ? "#00000014" : "#00000040";
        next.overlay = lum > 128 ? "#00000033" : "#00000066";
        next.muted = lum > 128 ? "#9CA3AF" : "#4B5563";
        next.highlight = next.accent + "18";
      }
      return next;
    });
    setHexInput(value);
  }, []);

  // ── Hex input commit ──
  const commitHex = useCallback(() => {
    if (isValidHex(hexInput)) {
      updateToken(activeField, hexInput.toUpperCase());
    }
  }, [hexInput, activeField, updateToken]);

  // ── Save ──
  const handleSave = useCallback(() => {
    if (!themeName.trim()) {
      Alert.alert("Name required", "Please give your theme a name.");
      return;
    }
    const finalTheme: AppTheme = {
      ...previewTheme,
      id: Crypto.randomUUID(),
      name: themeName.trim(),
    };
    saveCustomTheme(finalTheme, true);
    router.back();
  }, [themeName, previewTheme, saveCustomTheme]);

  // ── Discard ──
  const handleDiscard = useCallback(() => {
    setTheme(prevThemeId.current);
    router.back();
  }, [setTheme]);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <Pressable onPress={handleDiscard} hitSlop={12}>
            <IconSymbol
              name="xmark.circle.fill"
              size={28}
              color={liveColors.textSecondary}
            />
          </Pressable>
          <AppText variant="heading" style={styles.flex1} center>
            Create Theme
          </AppText>
          <Pressable onPress={handleSave} hitSlop={12}>
            <AppText variant="bodyBold" color={liveColors.accent}>
              Save
            </AppText>
          </Pressable>
        </View>

        {/* ── Theme Name ── */}
        <FadeInView delay={0} duration={300}>
          <View
            style={[
              styles.nameRow,
              {
                backgroundColor: liveColors.surface,
                borderColor: liveColors.border,
              },
            ]}
          >
            <IconSymbol
              name="pencil"
              size={16}
              color={liveColors.textSecondary}
            />
            <TextInput
              value={themeName}
              onChangeText={setThemeName}
              placeholder="Theme name"
              placeholderTextColor={liveColors.textSecondary + "88"}
              style={[styles.nameInput, { color: liveColors.textPrimary }]}
              maxLength={24}
            />
          </View>
        </FadeInView>

        {/* ── Live Preview Card ── */}
        <FadeInView delay={50} duration={300}>
          <AppText variant="overline" style={styles.sectionLabel}>
            LIVE PREVIEW
          </AppText>
          <View
            style={[
              styles.previewContainer,
              {
                backgroundColor: tokens.background,
                borderColor: tokens.border,
              },
            ]}
          >
            {/* Mini app preview */}
            <View
              style={[
                styles.previewHeader,
                { backgroundColor: tokens.surface },
              ]}
            >
              <View
                style={[
                  styles.previewBarDot,
                  { backgroundColor: tokens.accent },
                ]}
              />
              <View
                style={[
                  styles.previewBarTitle,
                  { backgroundColor: tokens.textPrimary },
                ]}
              />
            </View>
            <View style={styles.previewBody}>
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: tokens.card,
                    borderColor: tokens.border,
                    borderLeftColor: tokens.accent,
                  },
                ]}
              >
                <View
                  style={[
                    styles.previewTextLine,
                    { backgroundColor: tokens.textPrimary, width: "60%" },
                  ]}
                />
                <View
                  style={[
                    styles.previewTextLine,
                    {
                      backgroundColor: tokens.textSecondary,
                      width: "40%",
                      height: 6,
                    },
                  ]}
                />
              </View>
              <View style={styles.previewBadgeRow}>
                {(
                  [
                    ["accent", tokens.accent],
                    ["success", tokens.success],
                    ["warning", tokens.warning],
                    ["error", tokens.error],
                  ] as const
                ).map(([label, color]) => (
                  <View
                    key={label}
                    style={[
                      styles.previewBadge,
                      { backgroundColor: color + "22", borderColor: color },
                    ]}
                  >
                    <AppText
                      variant="label"
                      color={color}
                      style={{ fontSize: 8 }}
                    >
                      {label}
                    </AppText>
                  </View>
                ))}
              </View>
              <View
                style={[styles.previewBtn, { backgroundColor: tokens.accent }]}
              >
                <AppText
                  variant="captionBold"
                  color="#fff"
                  style={{ fontSize: 9 }}
                >
                  Button
                </AppText>
              </View>
            </View>
            {/* Tab bar */}
            <View
              style={[
                styles.previewTabBar,
                {
                  backgroundColor: tokens.surface,
                  borderTopColor: tokens.border,
                },
              ]}
            >
              {[
                "house.fill",
                "calendar",
                "briefcase.fill",
                "gearshape.fill",
              ].map((icon, i) => (
                <View key={i} style={styles.previewTab}>
                  <IconSymbol
                    name={icon as any}
                    size={14}
                    color={
                      i === 0 ? tokens.accent : tokens.textSecondary + "88"
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        </FadeInView>

        {/* ── Apply Preview Button ── */}
        <Pressable
          onPress={applyPreview}
          style={({ pressed }) => [
            styles.previewApplyBtn,
            {
              backgroundColor: tokens.accent + "18",
              borderColor: tokens.accent + "44",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <IconSymbol name="eye.fill" size={16} color={tokens.accent} />
          <AppText variant="captionBold" color={tokens.accent}>
            Apply Preview to App
          </AppText>
        </Pressable>

        {/* ── Color Fields ── */}
        <FadeInView delay={100} duration={300}>
          <AppText variant="overline" style={styles.sectionLabel}>
            COLOR TOKENS
          </AppText>
          <View style={styles.fieldGrid}>
            {EDITABLE_FIELDS.map((field) => {
              const value = tokens[field.key] as string;
              const isActive = activeField === field.key;
              return (
                <Pressable
                  key={field.key}
                  onPress={() => {
                    setActiveField(field.key);
                    setHexInput(value);
                  }}
                  style={[
                    styles.fieldChip,
                    {
                      backgroundColor: isActive
                        ? liveColors.accent + "18"
                        : liveColors.surface,
                      borderColor: isActive
                        ? liveColors.accent
                        : liveColors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.fieldSwatch,
                      {
                        backgroundColor: value,
                        borderColor: liveColors.border,
                      },
                    ]}
                  />
                  <AppText
                    variant={isActive ? "captionBold" : "caption"}
                    numberOfLines={1}
                    color={
                      isActive ? liveColors.accent : liveColors.textPrimary
                    }
                  >
                    {field.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </FadeInView>

        {/* ── Hex Input ── */}
        <FadeInView delay={150} duration={300}>
          <AppText variant="overline" style={styles.sectionLabel}>
            {activeField.toUpperCase()} COLOR
          </AppText>
          <View style={styles.hexRow}>
            <View
              style={[
                styles.hexPreview,
                {
                  backgroundColor: isValidHex(hexInput) ? hexInput : "#888",
                  borderColor: liveColors.border,
                },
              ]}
            />
            <TextInput
              value={hexInput}
              onChangeText={(t) => {
                setHexInput(t);
                if (isValidHex(t)) {
                  updateToken(activeField, t.toUpperCase());
                }
              }}
              onBlur={commitHex}
              placeholder="#FFFFFF"
              placeholderTextColor={liveColors.textSecondary + "88"}
              style={[
                styles.hexInput,
                {
                  color: liveColors.textPrimary,
                  backgroundColor: liveColors.surface,
                  borderColor: liveColors.border,
                },
              ]}
              autoCapitalize="characters"
              maxLength={7}
            />
          </View>
        </FadeInView>

        {/* ── Accent Presets ── */}
        {activeField === "accent" && (
          <FadeInView delay={0} duration={200}>
            <AppText variant="overline" style={styles.sectionLabel}>
              ACCENT PRESETS
            </AppText>
            <View style={styles.presetGrid}>
              {ACCENT_PRESETS.map((color) => {
                const isSelected = tokens.accent === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => updateToken("accent", color)}
                    style={[
                      styles.presetSwatch,
                      {
                        backgroundColor: color,
                        borderColor: isSelected ? "#fff" : "transparent",
                        transform: [{ scale: isSelected ? 1.15 : 1 }],
                      },
                    ]}
                  >
                    {isSelected && (
                      <IconSymbol name="checkmark" size={14} color="#fff" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </FadeInView>
        )}

        {/* ── Background Presets ── */}
        {(activeField === "background" ||
          activeField === "surface" ||
          activeField === "card") && (
          <FadeInView delay={0} duration={200}>
            <AppText variant="overline" style={styles.sectionLabel}>
              BACKGROUND PRESETS
            </AppText>
            {BG_PRESETS.map((preset) => {
              const isSelected = tokens.background === preset.bg;
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => {
                    updateToken("background", preset.bg);
                    setTokens((prev) => ({
                      ...prev,
                      surface: preset.surface,
                      card: preset.card,
                    }));
                  }}
                  style={[
                    styles.bgPresetRow,
                    {
                      backgroundColor: preset.bg,
                      borderColor: isSelected
                        ? liveColors.accent
                        : liveColors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.bgPresetSwatches}>
                    <View
                      style={[
                        styles.bgPresetDot,
                        { backgroundColor: preset.surface },
                      ]}
                    />
                    <View
                      style={[
                        styles.bgPresetDot,
                        { backgroundColor: preset.card },
                      ]}
                    />
                  </View>
                  <AppText
                    variant={isSelected ? "captionBold" : "caption"}
                    color={
                      parseInt(preset.bg.slice(1), 16) > 0x888888
                        ? "#1A1D21"
                        : "#F1F3F5"
                    }
                  >
                    {preset.label}
                  </AppText>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={16}
                      color={liveColors.accent}
                    />
                  )}
                </Pressable>
              );
            })}
          </FadeInView>
        )}

        {/* ── Actions ── */}
        <View style={styles.actionRow}>
          <AppButton
            label="Discard"
            variant="outline"
            onPress={handleDiscard}
            style={styles.flex1}
          />
          <AppButton
            label="Save Theme"
            variant="primary"
            onPress={handleSave}
            style={styles.flex1}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  flex1: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  nameInput: { flex: 1, fontSize: 16, fontWeight: "600" },

  sectionLabel: { marginBottom: 10, marginTop: 8 },

  // Preview
  previewContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewBarDot: { width: 10, height: 10, borderRadius: 5 },
  previewBarTitle: { height: 8, width: 60, borderRadius: 4 },
  previewBody: { padding: 12, gap: 8 },
  previewCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 10,
    gap: 6,
  },
  previewTextLine: { height: 8, borderRadius: 4 },
  previewBadgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  previewBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  previewTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  previewTab: { alignItems: "center" },

  previewApplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },

  // Fields
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  fieldChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  fieldSwatch: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
  },

  // Hex
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  hexPreview: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  hexInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "SpaceMono",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Presets
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  presetSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  // BG presets
  bgPresetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  bgPresetSwatches: { flexDirection: "row", gap: 4 },
  bgPresetDot: { width: 16, height: 16, borderRadius: 4 },

  // Actions
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },

  bottomSpacer: { height: 60 },
});
