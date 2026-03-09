import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeStore } from "@/store";
import { allThemes } from "@/theme";
import type { AppTheme, ThemeCategory, ThemeTokens } from "@/types";

// ─── Constants ──────────────────────────────────────────────────────

const CATEGORY_ORDER: ThemeCategory[] = [
  "standard",
  "developer",
  "premium",
  "fun",
];

const CATEGORY_META: Record<
  ThemeCategory,
  { label: string; description: string; icon: string }
> = {
  standard: {
    label: "Standard",
    description: "Clean everyday themes",
    icon: "☀️",
  },
  developer: {
    label: "Developer",
    description: "Inspired by your favorite editors",
    icon: "💻",
  },
  premium: {
    label: "Premium",
    description: "Glassmorphism & liquid glass effects",
    icon: "✨",
  },
  fun: {
    label: "Fun",
    description: "Bold, expressive & playful",
    icon: "🎨",
  },
};

// ─── Mini Preview Component ─────────────────────────────────────────

function MiniPreview({ tokens }: { tokens: ThemeTokens }) {
  return (
    <View style={[s.preview, { backgroundColor: tokens.background }]}>
      {/* Status bar dots */}
      <View style={s.previewStatusBar}>
        <View
          style={[s.previewDot, { backgroundColor: tokens.textSecondary }]}
        />
        <View
          style={[s.previewDot, { backgroundColor: tokens.textSecondary }]}
        />
        <View
          style={[s.previewDot, { backgroundColor: tokens.textSecondary }]}
        />
      </View>

      {/* Header bar */}
      <View style={[s.previewHeader, { backgroundColor: tokens.surface }]}>
        <View
          style={[
            s.previewHeaderTitle,
            { backgroundColor: tokens.textPrimary },
          ]}
        />
        <View
          style={[s.previewHeaderDot, { backgroundColor: tokens.accent }]}
        />
      </View>

      {/* Card mockup */}
      <View
        style={[
          s.previewCard,
          {
            backgroundColor: tokens.card,
            borderRadius: 4 * tokens.radiusScale,
          },
        ]}
      >
        <View
          style={[s.previewCardLine, { backgroundColor: tokens.textPrimary }]}
        />
        <View
          style={[
            s.previewCardLineSm,
            { backgroundColor: tokens.textSecondary },
          ]}
        />
        <View style={s.previewCardRow}>
          <View
            style={[
              s.previewPill,
              {
                backgroundColor: tokens.accent,
                borderRadius: 3 * tokens.radiusScale,
              },
            ]}
          />
          <View
            style={[
              s.previewPill,
              {
                backgroundColor: tokens.success,
                borderRadius: 3 * tokens.radiusScale,
              },
            ]}
          />
        </View>
      </View>

      {/* Second card */}
      <View
        style={[
          s.previewCard2,
          {
            backgroundColor: tokens.card,
            borderRadius: 4 * tokens.radiusScale,
          },
        ]}
      >
        <View
          style={[
            s.previewCardLineSm,
            { backgroundColor: tokens.textSecondary },
          ]}
        />
      </View>

      {/* Bottom nav */}
      <View style={[s.previewNav, { backgroundColor: tokens.surface }]}>
        <View style={[s.previewNavDot, { backgroundColor: tokens.accent }]} />
        <View
          style={[s.previewNavDot, { backgroundColor: tokens.textSecondary }]}
        />
        <View
          style={[s.previewNavDot, { backgroundColor: tokens.textSecondary }]}
        />
        <View
          style={[s.previewNavDot, { backgroundColor: tokens.textSecondary }]}
        />
      </View>
    </View>
  );
}

// ─── Color Palette Dots ─────────────────────────────────────────────

function PaletteRow({ tokens }: { tokens: ThemeTokens }) {
  const colors = [
    tokens.accent,
    tokens.success,
    tokens.warning,
    tokens.error,
    tokens.textPrimary,
    tokens.surface,
  ];
  return (
    <View style={s.paletteRow}>
      {colors.map((c, i) => (
        <View key={i} style={[s.paletteDot, { backgroundColor: c }]} />
      ))}
    </View>
  );
}

// ─── Theme Card Component ───────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  currentColors,
  onSelect,
}: {
  theme: AppTheme;
  isActive: boolean;
  currentColors: ThemeTokens;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        s.themeCard,
        {
          backgroundColor: currentColors.card,
          borderColor: isActive ? currentColors.accent : currentColors.border,
          borderWidth: isActive ? 2 : 1,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* Top section: Preview + Info */}
      <View style={s.themeCardTop}>
        <MiniPreview tokens={theme.tokens} />

        <View style={s.themeCardInfo}>
          <View style={s.themeCardNameRow}>
            <AppText
              variant="bodyBold"
              numberOfLines={1}
              style={s.themeCardName}
            >
              {theme.name}
            </AppText>
            {isActive && (
              <IconSymbol
                name="checkmark.circle.fill"
                size={18}
                color={currentColors.accent}
              />
            )}
          </View>

          {/* Badges */}
          <View style={s.themeCardBadges}>
            {theme.isPremium && <AppBadge label="Glass" variant="accent" />}
            {isActive && <AppBadge label="Active" variant="success" />}
          </View>

          {/* Palette */}
          <PaletteRow tokens={theme.tokens} />

          {/* Properties */}
          <View style={s.propRow}>
            <AppText variant="caption" style={s.propLabel}>
              Radius
            </AppText>
            <AppText variant="captionBold">
              {theme.tokens.radiusScale.toFixed(1)}×
            </AppText>
          </View>
          {theme.tokens.glassOpacity > 0 && (
            <View style={s.propRow}>
              <AppText variant="caption" style={s.propLabel}>
                Glass
              </AppText>
              <AppText variant="captionBold">
                {Math.round(theme.tokens.glassOpacity * 100)}%
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────

export default function ThemeSelectorScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const currentThemeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const grouped = useMemo(() => {
    const map: Record<ThemeCategory, AppTheme[]> = {
      standard: [],
      developer: [],
      premium: [],
      fun: [],
    };
    for (const t of allThemes) map[t.category].push(t);
    return map;
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setTheme(id);
    },
    [setTheme],
  );

  return (
    <AppScreen safeTop>
      {/* ── Header ── */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <IconSymbol name="chevron.left" size={22} color={colors.accent} />
          <AppText variant="body" color={colors.accent}>
            Settings
          </AppText>
        </Pressable>
        <AppText variant="heading">Themes</AppText>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Current theme hero ── */}
        <View
          style={[
            s.heroCard,
            {
              backgroundColor: colors.accent + "15",
              borderColor: colors.accent + "40",
            },
          ]}
        >
          <View style={s.heroInner}>
            <MiniPreview
              tokens={
                allThemes.find((t) => t.id === currentThemeId)?.tokens ?? colors
              }
            />
            <View style={s.heroText}>
              <AppText variant="overline">CURRENT THEME</AppText>
              <AppText variant="heading">
                {allThemes.find((t) => t.id === currentThemeId)?.name ?? "—"}
              </AppText>
              <AppBadge
                label={
                  allThemes.find((t) => t.id === currentThemeId)?.category ??
                  "standard"
                }
                variant="accent"
              />
            </View>
          </View>
        </View>

        {/* ── Category Sections ── */}
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const themes = grouped[cat];
          return (
            <View key={cat} style={s.section}>
              {/* Section header */}
              <View style={s.sectionHeader}>
                <AppText variant="title" style={s.sectionIcon}>
                  {meta.icon}
                </AppText>
                <View>
                  <AppText variant="heading">{meta.label}</AppText>
                  <AppText variant="caption">{meta.description}</AppText>
                </View>
              </View>

              {/* Theme cards in this category */}
              {themes.map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  isActive={t.id === currentThemeId}
                  currentColors={colors}
                  onSelect={() => handleSelect(t.id)}
                />
              ))}
            </View>
          );
        })}

        <View style={s.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, width: 100 },
  headerSpacer: { width: 100 },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  /* Hero */
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  heroInner: { flexDirection: "row", alignItems: "center", gap: 16 },
  heroText: { flex: 1, gap: 4 },

  /* Sections */
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIcon: { fontSize: 24 },

  /* Theme Card */
  themeCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  themeCardTop: { flexDirection: "row", gap: 14 },
  themeCardInfo: { flex: 1, gap: 6 },
  themeCardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeCardName: { flex: 1, marginRight: 6 },
  themeCardBadges: { flexDirection: "row", gap: 6 },
  propRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  propLabel: { opacity: 0.6 },

  /* Mini Preview */
  preview: {
    width: 80,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFFFFF20",
  },
  previewStatusBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 2,
    paddingHorizontal: 4,
    paddingTop: 3,
  },
  previewDot: { width: 3, height: 3, borderRadius: 1.5 },
  previewHeader: {
    height: 12,
    marginHorizontal: 4,
    marginTop: 3,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  previewHeaderTitle: { width: 20, height: 3, borderRadius: 1.5 },
  previewHeaderDot: { width: 5, height: 5, borderRadius: 2.5 },
  previewCard: {
    marginHorizontal: 4,
    marginTop: 4,
    padding: 4,
    gap: 3,
  },
  previewCardLine: { width: "70%", height: 3, borderRadius: 1.5 },
  previewCardLineSm: { width: "50%", height: 2.5, borderRadius: 1.25 },
  previewCardRow: { flexDirection: "row", gap: 3, marginTop: 2 },
  previewPill: { width: 16, height: 6 },
  previewCard2: {
    marginHorizontal: 4,
    marginTop: 3,
    padding: 4,
  },
  previewNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  previewNavDot: { width: 6, height: 6, borderRadius: 3 },

  /* Palette */
  paletteRow: { flexDirection: "row", gap: 5, marginVertical: 2 },
  paletteDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFFFFF20",
  },

  bottomSpacer: { height: 100 },
});
