import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeStore } from "@/store";
import { allThemes } from "@/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const currentThemeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const currentTheme = allThemes.find((t) => t.id === currentThemeId);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="largeTitle" style={styles.title}>
          Settings
        </AppText>

        {/* ── Profile placeholder ── */}
        <AppCard style={styles.card}>
          <AppText variant="overline" style={styles.sectionLabel}>
            PROFILE
          </AppText>
          <AppText variant="body">Alex Johnson</AppText>
          <AppText variant="caption">alex@example.com</AppText>
        </AppCard>

        {/* ── Theme ── */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Theme
        </AppText>

        {/* Current theme preview + navigate to full selector */}
        <Pressable
          onPress={() => router.push("/theme-selector")}
          style={({ pressed }) => [
            styles.themePreviewBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.themePreviewLeft}>
            {/* Mini swatch strip */}
            <View style={styles.miniSwatchStrip}>
              {currentTheme &&
                [
                  currentTheme.tokens.accent,
                  currentTheme.tokens.success,
                  currentTheme.tokens.warning,
                  currentTheme.tokens.error,
                ].map((c, i) => (
                  <View
                    key={i}
                    style={[styles.miniDot, { backgroundColor: c }]}
                  />
                ))}
            </View>
            <View>
              <AppText variant="bodyBold">
                {currentTheme?.name ?? "Dark"}
              </AppText>
              <AppText variant="caption">
                {currentTheme?.category ?? "standard"} · Tap to change
              </AppText>
            </View>
          </View>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* Quick-switch row: 4 popular themes */}
        <AppText variant="caption" style={styles.quickLabel}>
          Quick switch
        </AppText>
        <View style={styles.themeRow}>
          {allThemes.slice(0, 6).map((t) => {
            const isActive = t.id === currentThemeId;
            return (
              <View
                key={t.id}
                style={[
                  styles.themeSwatch,
                  {
                    backgroundColor: t.tokens.background,
                    borderColor: isActive ? t.tokens.accent : t.tokens.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
                onTouchEnd={() => setTheme(t.id)}
              >
                <View
                  style={[
                    styles.swatchInner,
                    { backgroundColor: t.tokens.accent },
                  ]}
                />
                <AppText
                  variant="captionBold"
                  color={t.tokens.textPrimary}
                  style={styles.swatchName}
                  numberOfLines={1}
                >
                  {t.name}
                </AppText>
                {isActive && <AppBadge label="Active" variant="accent" />}
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.push("/theme-selector")}
          style={styles.seeAllBtn}
        >
          <AppText variant="captionBold" color={colors.accent}>
            See all 16 themes →
          </AppText>
        </Pressable>

        {/* ── Placeholder sections ── */}
        <AppCard style={styles.card}>
          <AppText variant="overline" style={styles.sectionLabel}>
            COMING SOON
          </AppText>
          <AppText variant="body" style={styles.comingSoonItem}>
            🔗 Google Calendar Sync
          </AppText>
          <AppText variant="body" style={styles.comingSoonItem}>
            📷 Schedule Image Upload (OCR)
          </AppText>
          <AppText variant="body" style={styles.comingSoonItem}>
            📊 Earnings Dashboard
          </AppText>
          <AppText variant="body" style={styles.comingSoonItem}>
            🔔 Shift Notifications
          </AppText>
        </AppCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { marginBottom: 20 },
  card: { marginBottom: 16 },
  sectionLabel: { marginBottom: 8 },
  sectionTitle: { marginBottom: 12 },
  /* Theme preview button */
  themePreviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  themePreviewLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniSwatchStrip: { flexDirection: "row", gap: 4 },
  miniDot: { width: 14, height: 14, borderRadius: 7 },
  quickLabel: { marginBottom: 10 },
  themeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeSwatch: {
    width: "30%",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 5,
  },
  swatchInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  swatchName: { fontSize: 10 },
  seeAllBtn: { alignSelf: "center", marginTop: 10, marginBottom: 20 },
  comingSoonItem: { marginTop: 6 },
  bottomSpacer: { height: 100 },
});
