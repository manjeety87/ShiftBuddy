import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppInput } from "@/components/ui/app-input";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift, ShiftStatus } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseDateTimeLocal = (date: string, time: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
};

// ─── Component ──────────────────────────────────────────────────────
export default function AddShiftScreen() {
  const { colors } = useAppTheme();
  const workplaces = useShiftStore((s) => s.workplaces);
  const addShift = useShiftStore((s) => s.addShift);

  // Form state
  const [title, setTitle] = useState("");
  const [workplaceId, setWorkplaceId] = useState(workplaces[0]?.id ?? "");
  const [date, setDate] = useState(toLocalDateStr(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ShiftStatus>("confirmed");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedWp = useMemo(
    () => workplaces.find((w) => w.id === workplaceId),
    [workplaces, workplaceId],
  );

  // Computed duration
  const duration = useMemo(() => {
    try {
      const s = parseDateTimeLocal(date, startTime);
      const e = parseDateTimeLocal(date, endTime);
      const diff = (e.getTime() - s.getTime()) / 3_600_000;
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  }, [date, startTime, endTime]);

  const estPay = duration * (selectedWp?.hourlyRate ?? 0);

  // ── Validate & Submit ──
  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!workplaceId) errs.workplace = "Select a workplace";
    if (!date) errs.date = "Date is required";
    if (!startTime) errs.startTime = "Start time required";
    if (!endTime) errs.endTime = "End time required";
    if (duration <= 0) errs.endTime = "End must be after start";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const shift: Shift = {
      id: Crypto.randomUUID(),
      source: "manual",
      workplaceId,
      title: title.trim(),
      startDateTime: parseDateTimeLocal(date, startTime).toISOString(),
      endDateTime: parseDateTimeLocal(date, endTime).toISOString(),
      notes: notes.trim() || undefined,
      status,
      createdAt: now,
      updatedAt: now,
    };

    addShift(shift);
    Alert.alert("Shift Added", `"${shift.title}" has been saved.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  // ── Status options ──
  const statuses: { value: ShiftStatus; label: string; color: string }[] = [
    { value: "confirmed", label: "Confirmed", color: colors.success },
    { value: "pending", label: "Pending", color: colors.warning },
  ];

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
            Add Shift
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Title ── */}
        <AppInput
          label="Shift Title"
          placeholder="e.g. Morning Barista"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setErrors((e) => ({ ...e, title: "" }));
          }}
          error={errors.title}
          leftIcon={
            <IconSymbol name="pencil" size={16} color={colors.textSecondary} />
          }
          containerStyle={styles.field}
        />

        {/* ── Workplace Selector ── */}
        <AppText variant="captionBold" style={styles.sectionLabel}>
          Workplace
        </AppText>
        {errors.workplace ? (
          <AppText
            variant="caption"
            color={colors.error}
            style={styles.errText}
          >
            {errors.workplace}
          </AppText>
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wpScroll}
        >
          {workplaces.map((wp) => {
            const selected = wp.id === workplaceId;
            return (
              <Pressable
                key={wp.id}
                onPress={() => {
                  setWorkplaceId(wp.id);
                  setErrors((e) => ({ ...e, workplace: "" }));
                }}
                style={({ pressed }) => [
                  styles.wpChip,
                  {
                    backgroundColor: selected
                      ? wp.color + "22"
                      : colors.surface,
                    borderColor: selected ? wp.color : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={[styles.wpDot, { backgroundColor: wp.color }]} />
                <AppText
                  variant={selected ? "captionBold" : "caption"}
                  color={selected ? wp.color : colors.textPrimary}
                >
                  {wp.name}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Date & Time ── */}
        <View style={styles.row}>
          <AppInput
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={(t) => {
              setDate(t);
              setErrors((e) => ({ ...e, date: "" }));
            }}
            error={errors.date}
            leftIcon={
              <IconSymbol
                name="calendar"
                size={16}
                color={colors.textSecondary}
              />
            }
            containerStyle={styles.flex1}
          />
        </View>

        <View style={styles.timeRow}>
          <AppInput
            label="Start"
            placeholder="HH:MM"
            value={startTime}
            onChangeText={(t) => {
              setStartTime(t);
              setErrors((e) => ({ ...e, startTime: "" }));
            }}
            error={errors.startTime}
            leftIcon={
              <IconSymbol
                name="clock.fill"
                size={16}
                color={colors.textSecondary}
              />
            }
            containerStyle={styles.flex1}
          />
          <View style={styles.timeDash}>
            <AppText variant="body" color={colors.textSecondary}>
              →
            </AppText>
          </View>
          <AppInput
            label="End"
            placeholder="HH:MM"
            value={endTime}
            onChangeText={(t) => {
              setEndTime(t);
              setErrors((e) => ({ ...e, endTime: "" }));
            }}
            error={errors.endTime}
            leftIcon={
              <IconSymbol
                name="clock.fill"
                size={16}
                color={colors.textSecondary}
              />
            }
            containerStyle={styles.flex1}
          />
        </View>

        {/* ── Duration & Pay Preview ── */}
        {duration > 0 && (
          <AppCard style={styles.previewCard} padding={14}>
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <IconSymbol name="clock.fill" size={16} color={colors.accent} />
                <AppText variant="bodyBold" color={colors.accent}>
                  {duration.toFixed(1)}h
                </AppText>
              </View>
              {selectedWp?.hourlyRate != null && (
                <View style={styles.previewItem}>
                  <IconSymbol
                    name="dollarsign.circle.fill"
                    size={16}
                    color={colors.success}
                  />
                  <AppText variant="bodyBold" color={colors.success}>
                    ${estPay.toFixed(2)}
                  </AppText>
                </View>
              )}
              <View style={styles.previewItem}>
                <View
                  style={[
                    styles.wpDotSm,
                    { backgroundColor: selectedWp?.color ?? colors.accent },
                  ]}
                />
                <AppText variant="caption" color={colors.textSecondary}>
                  {selectedWp?.name ?? "—"}
                </AppText>
              </View>
            </View>
          </AppCard>
        )}

        {/* ── Status ── */}
        <AppText variant="captionBold" style={styles.sectionLabel}>
          Status
        </AppText>
        <View style={styles.statusRow}>
          {statuses.map((s) => {
            const active = status === s.value;
            return (
              <Pressable
                key={s.value}
                onPress={() => setStatus(s.value)}
                style={({ pressed }) => [
                  styles.statusChip,
                  {
                    backgroundColor: active ? s.color + "22" : colors.surface,
                    borderColor: active ? s.color : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                {active && (
                  <View
                    style={[styles.statusDot, { backgroundColor: s.color }]}
                  />
                )}
                <AppText
                  variant={active ? "captionBold" : "caption"}
                  color={active ? s.color : colors.textPrimary}
                >
                  {s.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* ── Notes ── */}
        <AppInput
          label="Notes (optional)"
          placeholder="Any additional details..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          leftIcon={
            <IconSymbol
              name="note.text"
              size={16}
              color={colors.textSecondary}
            />
          }
          containerStyle={styles.field}
        />

        {/* ── Action Buttons ── */}
        <View style={styles.actions}>
          <AppButton
            label="Save Shift"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSave}
            leftIcon={
              <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
            }
          />
          <AppButton
            label="Cancel"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.back()}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  headerSpacer: { width: 24 },

  // Fields
  field: { marginBottom: 18 },
  sectionLabel: { marginBottom: 8 },
  errText: { marginBottom: 4 },

  // Workplace chips
  wpScroll: { gap: 8, paddingBottom: 18 },
  wpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  wpDot: { width: 10, height: 10, borderRadius: 5 },
  wpDotSm: { width: 7, height: 7, borderRadius: 3.5 },

  // Date / time
  row: { marginBottom: 12 },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 16,
  },
  timeDash: { paddingBottom: 14 },

  // Preview
  previewCard: { marginBottom: 18 },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Status
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  // Notes
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },

  // Actions
  actions: { gap: 10, marginTop: 8 },

  // Shared
  flex1: { flex: 1 },
  bottomSpacer: { height: 60 },
});
