import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { AnimatedPress } from "@/components/ui/animated-press";
import { AppBadge } from "@/components/ui/app-badge";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { FadeInView } from "@/components/ui/fade-in-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeStore } from "@/store";
import { allThemes } from "@/theme";
import type { AppTheme, ThemeCategory, ThemeTokens } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = (SCREEN_W - 20 * 2 - 12) / 2; // 2 columns with gap

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
function MiniPreview({
  tokens,
  size = "small",
}: {
  tokens: ThemeTokens;
  size?: "small" | "large";
}) {
  const isLarge = size === "large";
  return (
    <View
      style={[
        isLarge ? s.previewLarge : s.preview,
        { backgroundColor: tokens.background },
      ]}
    >
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

      {/* Gradient accent bar */}
      <View
        style={[s.previewAccentBar, { backgroundColor: tokens.gradientStart }]}
      />

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

// ─── Theme Grid Card ────────────────────────────────────────────────
function ThemeGridCard({
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
    <AnimatedPress scale={0.96}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          s.gridCard,
          {
            width: CARD_W,
            backgroundColor: currentColors.card,
            borderColor: isActive ? currentColors.accent : currentColors.border,
            borderWidth: isActive ? 2 : 1,
            opacity: pressed ? 0.85 : 1,
            borderRadius: 16 * currentColors.radiusScale,
          },
        ]}
      >
        <MiniPreview tokens={theme.tokens} />

        <View style={s.gridCardInfo}>
          <View style={s.gridCardNameRow}>
            <AppText
              variant="captionBold"
              numberOfLines={1}
              style={s.gridCardName}
            >
              {theme.name}
            </AppText>
            {isActive && (
              <IconSymbol
                name="checkmark.circle.fill"
                size={14}
                color={currentColors.accent}
              />
            )}
          </View>

          {/* Colour dots */}
          <View style={s.colorDots}>
            {[
              theme.tokens.accent,
              theme.tokens.success,
              theme.tokens.warning,
              theme.tokens.error,
            ].map((c, i) => (
              <View key={i} style={[s.colorDot, { backgroundColor: c }]} />
            ))}
          </View>

          {/* Badges */}
          <View style={s.gridBadges}>
            {theme.isPremium && <AppBadge label="Glass" variant="accent" />}
            {isActive && <AppBadge label="Active" variant="success" />}
          </View>
        </View>
      </Pressable>
    </AnimatedPress>
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

  const currentTheme = allThemes.find((t) => t.id === currentThemeId);

  return (
    <AppScreen safeTop>
      {/* ── Header ── */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <IconSymbol name="chevron.left" size={22} color={colors.accent} />
          <AppText variant="body" color={colors.accent}>
            Back
          </AppText>
        </Pressable>
        <AppText variant="heading">Themes</AppText>
        <View style={s.headerSpacer}>
          <AppBadge label={`${allThemes.length}`} variant="accent" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Current theme hero ── */}
        <FadeInView delay={0}>
          <View
            style={[
              s.heroCard,
              {
                backgroundColor: colors.accent + "12",
                borderColor: colors.accent + "40",
              },
            ]}
          >
            <View style={s.heroInner}>
              <MiniPreview
                tokens={currentTheme?.tokens ?? colors}
                size="large"
              />
              <View style={s.heroText}>
                <AppText variant="overline">CURRENT THEME</AppText>
                <AppText variant="heading">{currentTheme?.name ?? "—"}</AppText>
                <View style={s.heroBadges}>
                  <AppBadge
                    label={currentTheme?.category ?? "standard"}
                    variant="accent"
                  />
                  {currentTheme?.isPremium && (
                    <AppBadge label="Premium" variant="warning" />
                  )}
                </View>
                {/* Palette row */}
                <View style={s.heroPalette}>
                  {currentTheme &&
                    [
                      currentTheme.tokens.accent,
                      currentTheme.tokens.success,
                      currentTheme.tokens.warning,
                      currentTheme.tokens.error,
                      currentTheme.tokens.gradientStart,
                      currentTheme.tokens.gradientEnd,
                    ].map((c, i) => (
                      <View
                        key={i}
                        style={[s.heroPaletteDot, { backgroundColor: c }]}
                      />
                    ))}
                </View>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* ── Category Sections ── */}
        {CATEGORY_ORDER.map((cat, catIdx) => {
          const meta = CATEGORY_META[cat];
          const themes = grouped[cat];
          return (
            <FadeInView key={cat} delay={80 + catIdx * 60}>
              <View style={s.section}>
                {/* Section header */}
                <View style={s.sectionHeader}>
                  <AppText variant="title" style={s.sectionIcon}>
                    {meta.icon}
                  </AppText>
                  <View style={s.flex1}>
                    <AppText variant="heading">{meta.label}</AppText>
                    <AppText variant="caption">{meta.description}</AppText>
                  </View>
                  <AppBadge label={`${themes.length}`} variant="accent" />
                </View>

                {/* Grid of theme cards */}
                <View style={s.grid}>
                  {themes.map((t) => (
                    <ThemeGridCard
                      key={t.id}
                      theme={t}
                      isActive={t.id === currentThemeId}
                      currentColors={colors}
                      onSelect={() => handleSelect(t.id)}
                    />
                  ))}
                </View>
              </View>
            </FadeInView>
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
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, width: 80 },
  headerSpacer: { width: 80, alignItems: "flex-end" },

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
  heroBadges: { flexDirection: "row", gap: 6, marginTop: 2 },
  heroPalette: { flexDirection: "row", gap: 5, marginTop: 6 },
  heroPaletteDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFFFFF20",
  },

  /* Sections */
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIcon: { fontSize: 24 },

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  /* Grid Theme Card */
  gridCard: {
    padding: 10,
    gap: 8,
  },
  gridCardInfo: { gap: 4 },
  gridCardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridCardName: { flex: 1, marginRight: 4 },
  gridBadges: { flexDirection: "row", gap: 4, flexWrap: "wrap" },

  /* Color dots */
  colorDots: { flexDirection: "row", gap: 4 },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFFFFF15",
  },

  /* Mini Preview (small — for grid cards) */
  preview: {
    width: "100%",
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFFFFF20",
  },
  /* Mini Preview (large — for hero) */
  previewLarge: {
    width: 90,
    height: 130,
    borderRadius: 10,
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
    height: 10,
    marginHorizontal: 4,
    marginTop: 3,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  previewHeaderTitle: { width: 18, height: 2.5, borderRadius: 1 },
  previewHeaderDot: { width: 4, height: 4, borderRadius: 2 },
  previewCard: {
    marginHorizontal: 4,
    marginTop: 3,
    padding: 4,
    gap: 2,
  },
  previewCardLine: { width: "65%", height: 2.5, borderRadius: 1 },
  previewCardLineSm: { width: "45%", height: 2, borderRadius: 1 },
  previewCardRow: { flexDirection: "row", gap: 3, marginTop: 1 },
  previewPill: { width: 14, height: 5 },
  previewCard2: {
    marginHorizontal: 4,
    marginTop: 2,
    padding: 3,
  },
  previewAccentBar: {
    marginHorizontal: 4,
    marginTop: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.7,
  },
  previewNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  previewNavDot: { width: 5, height: 5, borderRadius: 2.5 },

  /* Shared */
  flex1: { flex: 1 },
  bottomSpacer: { height: 100 },
});
