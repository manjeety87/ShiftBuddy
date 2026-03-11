import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppInput } from "@/components/ui/app-input";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Workplace } from "@/types";

// ─── Preset colours ─────────────────────────────────────────────────
const PRESET_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#6366F1",
  "#F97316",
  "#84CC16",
  "#A855F7",
];

// ─── Component ──────────────────────────────────────────────────────
export default function AddWorkplaceScreen() {
  const { colors, theme } = useAppTheme();
  const addWorkplace = useShiftStore((s) => s.addWorkplace);
  const r = theme.tokens.radiusScale;

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (hourlyRate && isNaN(Number(hourlyRate)))
      errs.hourlyRate = "Must be a number";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const workplace: Workplace = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      color,
      address: address.trim() || undefined,
      hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    addWorkplace(workplace);
    Alert.alert("Workplace Added", `"${workplace.name}" has been saved.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <AppScreen safeTop>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="chevron.left" size={24} color={colors.accent} />
          </Pressable>
          <AppText variant="heading" style={styles.flex1} center>
            Add Workplace
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Name ── */}
        <AppInput
          label="Workplace Name"
          placeholder="e.g. Blue Bottle Coffee"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setErrors((e) => ({ ...e, name: "" }));
          }}
          error={errors.name}
          leftIcon={
            <IconSymbol
              name="briefcase.fill"
              size={16}
              color={colors.textSecondary}
            />
          }
          containerStyle={styles.field}
        />

        {/* ── Colour Picker ── */}
        <AppText variant="captionBold" style={styles.sectionLabel}>
          Colour
        </AppText>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((c) => {
            const selected = c === color;
            return (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: c,
                    borderColor: selected ? colors.textPrimary : "transparent",
                    borderWidth: selected ? 3 : 0,
                    borderRadius: 12 * r,
                  },
                ]}
              >
                {selected && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color="#fff"
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Preview */}
        <AppCard style={styles.previewCard} accentBorder={color} padding={14}>
          <View style={styles.previewRow}>
            <View
              style={[
                styles.previewBadge,
                { backgroundColor: color + "22", borderColor: color + "44" },
              ]}
            >
              <IconSymbol name="briefcase.fill" size={20} color={color} />
            </View>
            <View style={styles.flex1}>
              <AppText variant="bodyBold">
                {name.trim() || "Workplace Name"}
              </AppText>
              {hourlyRate ? (
                <AppText variant="caption" color={colors.textSecondary}>
                  ${Number(hourlyRate).toFixed(2)}/hr
                </AppText>
              ) : null}
            </View>
          </View>
        </AppCard>

        {/* ── Hourly Rate ── */}
        <AppInput
          label="Hourly Rate (optional)"
          placeholder="e.g. 18.50"
          value={hourlyRate}
          onChangeText={(t) => {
            setHourlyRate(t);
            setErrors((e) => ({ ...e, hourlyRate: "" }));
          }}
          error={errors.hourlyRate}
          keyboardType="decimal-pad"
          leftIcon={
            <AppText variant="body" color={colors.textSecondary}>
              $
            </AppText>
          }
          containerStyle={styles.field}
        />

        {/* ── Address ── */}
        <AppInput
          label="Address (optional)"
          placeholder="e.g. 123 Main St"
          value={address}
          onChangeText={setAddress}
          leftIcon={
            <IconSymbol name="mappin" size={16} color={colors.textSecondary} />
          }
          containerStyle={styles.field}
        />

        {/* ── Notes ── */}
        <AppInput
          label="Notes (optional)"
          placeholder="e.g. Morning shifts preferred"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          leftIcon={
            <IconSymbol
              name="note.text"
              size={16}
              color={colors.textSecondary}
            />
          }
          containerStyle={styles.field}
        />

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <AppButton
            label="Save Workplace"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSave}
            leftIcon={
              <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
            }
          />
          <AppButton
            label="Cancel"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.back()}
            style={styles.cancelBtn}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerSpacer: { width: 24 },

  field: { marginBottom: 18 },
  sectionLabel: { marginBottom: 10 },

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  previewCard: { marginBottom: 20 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: { marginTop: 8, gap: 8 },
  cancelBtn: { marginTop: 4 },

  flex1: { flex: 1 },
  bottomSpacer: { height: 100 },
});
