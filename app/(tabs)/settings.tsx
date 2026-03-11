import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { AppBadge } from "@/components/ui/app-badge";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore, useThemeStore } from "@/store";
import { allThemes } from "@/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const currentThemeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const currentTheme = allThemes.find((t) => t.id === currentThemeId);

  // Shift store (user profile)
  const storeUser = useShiftStore((s) => s.user);
  const updateUser = useShiftStore((s) => s.updateUser);

  const [nameInput, setNameInput] = useState(storeUser?.name ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNameInput(storeUser?.name ?? "");
  }, [storeUser?.name]);

  const handleSaveName = () => {
    if (nameInput.trim()) updateUser({ name: nameInput.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <AppText variant="body">
            {storeUser?.name || "Set your name in AI Scanner below"}
          </AppText>
          {storeUser?.email ? (
            <AppText variant="caption">{storeUser.email}</AppText>
          ) : null}
        </AppCard>

        {/* ── OCR Name for AI Schedule Scanner ── */}
        <AppText variant="heading" style={styles.sectionTitle}>
          AI Schedule Scanner
        </AppText>
        <AppCard style={styles.card}>
          <AppText variant="overline" style={styles.sectionLabel}>
            YOUR NAME (for schedule matching)
          </AppText>
          <AppText
            variant="caption"
            color={colors.textSecondary}
            style={styles.configHint}
          >
            We use this to find your shifts when scanning a schedule photo.
          </AppText>
          <View style={[styles.inputRow, { borderColor: colors.border }]}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Manjeet Yadav"
              placeholderTextColor={colors.textSecondary + "88"}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              style={[
                styles.configInput,
                { color: colors.textPrimary, flex: 1 },
              ]}
            />
            <IconSymbol
              name="person.fill"
              size={18}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.saveBtnRow}>
            <AppButton
              label={saved ? "✓ Saved!" : "Save Name"}
              variant={saved ? "outline" : "primary"}
              size="md"
              onPress={handleSaveName}
              style={styles.saveBtn}
            />
            <View style={styles.statusDot}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <AppText variant="caption" color={colors.success}>
                AI OCR Active
              </AppText>
            </View>
          </View>
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

        {/* Quick-switch row: 6 popular themes */}
        <AppText variant="caption" style={styles.quickLabel}>
          Quick switch
        </AppText>
        <View style={styles.themeRow}>
          {allThemes.slice(0, 6).map((t) => {
            const isActive = t.id === currentThemeId;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTheme(t.id)}
                style={({ pressed }) => [
                  styles.themeSwatch,
                  {
                    backgroundColor: t.tokens.background,
                    borderColor: isActive ? t.tokens.accent : t.tokens.border,
                    borderWidth: isActive ? 2 : 1,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
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
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.push("/theme-selector")}
          style={styles.seeAllBtn}
        >
          <AppText variant="captionBold" color={colors.accent}>
            See all {allThemes.length} themes →
          </AppText>
        </Pressable>

        {/* Create custom theme */}
        <Pressable
          onPress={() => router.push("/custom-theme")}
          style={({ pressed }) => [
            styles.linkCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.accent + "44",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <IconSymbol
            name="paintpalette.fill"
            size={20}
            color={colors.accent}
          />
          <View style={styles.flex1}>
            <AppText variant="bodyBold">Create Custom Theme</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Pick your own colors with live preview
            </AppText>
          </View>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* ── Quick Links ── */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Quick Links
        </AppText>

        <Pressable
          onPress={() => router.push("/add-workplace")}
          style={({ pressed }) => [
            styles.linkCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <IconSymbol name="briefcase.fill" size={20} color={colors.accent} />
          <View style={styles.flex1}>
            <AppText variant="bodyBold">Add Workplace</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Add a new job or employer
            </AppText>
          </View>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.textSecondary}
          />
        </Pressable>

        <Pressable
          onPress={() => router.push("/add-shift")}
          style={({ pressed }) => [
            styles.linkCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <IconSymbol
            name="plus.circle.fill"
            size={20}
            color={colors.success}
          />
          <View style={styles.flex1}>
            <AppText variant="bodyBold">Add Shift</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Manually add a new shift
            </AppText>
          </View>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colors.textSecondary}
          />
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
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  flex1: { flex: 1 },
  comingSoonItem: { marginTop: 6 },
  bottomSpacer: { height: 100 },
  // Config inputs
  configHint: { marginBottom: 10, lineHeight: 18 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  configInput: {
    fontSize: 14,
    fontFamily: "monospace",
    padding: 0,
  },
  saveBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
  },
  saveBtn: { flexShrink: 0 },
  statusDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
