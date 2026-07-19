import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { StatusPill } from "@/components/shifts/StatusPill";
import { WorkplaceChoiceCard } from "@/components/shifts/WorkplaceChoiceCard";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppInput } from "@/components/ui/app-input";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";
import type { Shift, ShiftStatus } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseDateTimeLocal = (date: string, time: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
};

const formatHoursLabel = (hours: number) => {
  if (hours <= 0) return "0h";
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

export default function AddShiftScreen() {
  const { colors, theme } = useAppTheme();
  const workplaces = useShiftStore((s) => s.workplaces);
  const shifts = useShiftStore((s) => s.shifts);
  const addShift = useShiftStore((s) => s.addShift);

  const [title, setTitle] = useState("");
  const [workplaceId, setWorkplaceId] = useState(workplaces[0]?.id ?? "");
  const [date, setDate] = useState(toLocalDateStr(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ShiftStatus>("confirmed");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedWorkplace = useMemo(
    () => workplaces.find((w) => w.id === workplaceId),
    [workplaces, workplaceId],
  );

  const startDate = useMemo(() => {
    try {
      return parseDateTimeLocal(date, startTime);
    } catch {
      return null;
    }
  }, [date, startTime]);

  const endDate = useMemo(() => {
    try {
      return parseDateTimeLocal(date, endTime);
    } catch {
      return null;
    }
  }, [date, endTime]);

  const durationHours = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = (endDate.getTime() - startDate.getTime()) / 3_600_000;
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const estimatedPay = durationHours * (selectedWorkplace?.hourlyRate ?? 0);

  const detectedConflict = useMemo(() => {
    if (!startDate || !endDate || !workplaceId) return null;

    const overlapping = shifts.find((shift) => {
      if (shift.status === "cancelled") return false;

      const existingStart = new Date(shift.startDateTime);
      const existingEnd = new Date(shift.endDateTime);

      const isOverlap = startDate < existingEnd && endDate > existingStart;
      return isOverlap;
    });

    if (!overlapping) return null;

    const overlappingWorkplace = workplaces.find(
      (w) => w.id === overlapping.workplaceId,
    );

    return {
      shift: overlapping,
      workplaceName: overlappingWorkplace?.name ?? "Another workplace",
    };
  }, [startDate, endDate, workplaceId, shifts, workplaces]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = "Shift title is required.";
    if (!workplaceId) nextErrors.workplace = "Please select a workplace.";
    if (!date) nextErrors.date = "Date is required.";
    if (!startTime) nextErrors.startTime = "Start time is required.";
    if (!endTime) nextErrors.endTime = "End time is required.";
    if (durationHours <= 0)
      nextErrors.endTime = "End time must be after start time.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !startDate || !endDate) return;

    const now = new Date().toISOString();

    const shift: Shift = {
      id: Crypto.randomUUID(),
      source: "manual",
      workplaceId,
      title: title.trim(),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      notes: notes.trim() || undefined,
      status,
      createdAt: now,
      updatedAt: now,
      associationType: "workplace",
    };

    addShift(shift);

    Alert.alert(
      "Shift saved",
      `"${shift.title}" has been added successfully.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <IconSymbol name="chevron.left" size={20} color={colors.accent} />
            </Pressable>

            <View style={styles.headerCopy}>
              <AppText variant="label" color={colors.accent}>
                SHIFT ENTRY
              </AppText>
              <AppText variant="title">Add Shift</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Define your next professional engagement with clean scheduling
                details.
              </AppText>
            </View>
          </View>

          <AppCard style={styles.heroCard}>
            <View style={styles.heroInner}>
              <View style={styles.heroLeft}>
                <View
                  style={[
                    styles.heroIconWrap,
                    { backgroundColor: colors.accent + "14" },
                  ]}
                >
                  <IconSymbol
                    name="briefcase.fill"
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="captionBold" color={colors.textSecondary}>
                    NEXT ENTRY
                  </AppText>
                  <AppText variant="heading">
                    {title.trim() || "Untitled Shift"}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {selectedWorkplace?.name || "Choose a workplace"} •{" "}
                    {date || "No date"}
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      status === "confirmed"
                        ? colors.success + "16"
                        : status === "pending"
                          ? colors.warning + "16"
                          : colors.error + "16",
                  },
                ]}
              >
                <AppText
                  variant="captionBold"
                  color={
                    status === "confirmed"
                      ? colors.success
                      : status === "pending"
                        ? colors.warning
                        : colors.error
                  }
                >
                  {status.toUpperCase()}
                </AppText>
              </View>
            </View>
          </AppCard>

          <View style={styles.section}>
            <AppText variant="overline" color={colors.textSecondary}>
              Select Workplace
            </AppText>

            {!!errors.workplace && (
              <AppText
                variant="caption"
                color={colors.error}
                style={styles.errorText}
              >
                {errors.workplace}
              </AppText>
            )}

            <View style={styles.workplaceGrid}>
              {workplaces.map((workplace) => (
                <View key={workplace.id} style={styles.gridItem}>
                  <WorkplaceChoiceCard
                    label={workplace.name}
                    color={workplace.color}
                    selected={workplace.id === workplaceId}
                    onPress={() => {
                      setWorkplaceId(workplace.id);
                      setErrors((prev) => ({ ...prev, workplace: "" }));
                    }}
                  />
                </View>
              ))}

              <View style={styles.gridItem}>
                <WorkplaceChoiceCard
                  label="New workplace"
                  color={colors.accent}
                  isAddNew
                  onPress={() => router.push("/add-workplace")}
                />
              </View>
            </View>
          </View>

          <AppCard style={styles.formCard}>
            <View style={styles.formInner}>
              <AppText variant="overline" color={colors.textSecondary}>
                Schedule Details
              </AppText>

              <AppInput
                label="Shift title"
                placeholder="e.g. Morning Barista"
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
                error={errors.title}
                leftIcon={
                  <IconSymbol
                    name="pencil"
                    size={16}
                    color={colors.textSecondary}
                  />
                }
                containerStyle={styles.fieldSpacing}
              />

              <AppInput
                label="Date"
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={(value) => {
                  setDate(value);
                  setErrors((prev) => ({ ...prev, date: "" }));
                }}
                error={errors.date}
                leftIcon={
                  <IconSymbol
                    name="calendar"
                    size={16}
                    color={colors.textSecondary}
                  />
                }
                containerStyle={styles.fieldSpacing}
              />

              <View style={styles.timeRow}>
                <AppInput
                  label="Start time"
                  placeholder="09:00"
                  value={startTime}
                  onChangeText={(value) => {
                    setStartTime(value);
                    setErrors((prev) => ({ ...prev, startTime: "" }));
                  }}
                  error={errors.startTime}
                  leftIcon={
                    <IconSymbol
                      name="clock.fill"
                      size={16}
                      color={colors.textSecondary}
                    />
                  }
                  containerStyle={styles.timeField}
                />

                <AppInput
                  label="End time"
                  placeholder="17:00"
                  value={endTime}
                  onChangeText={(value) => {
                    setEndTime(value);
                    setErrors((prev) => ({ ...prev, endTime: "" }));
                  }}
                  error={errors.endTime}
                  leftIcon={
                    <IconSymbol
                      name="clock.fill"
                      size={16}
                      color={colors.textSecondary}
                    />
                  }
                  containerStyle={styles.timeField}
                />
              </View>

              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <AppText variant="label" color={colors.textSecondary}>
                    DURATION
                  </AppText>
                  <AppText variant="heading">
                    {formatHoursLabel(durationHours)}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <AppText variant="label" color={colors.textSecondary}>
                    EST. PAY
                  </AppText>
                  <AppText variant="heading">
                    ${estimatedPay > 0 ? estimatedPay.toFixed(2) : "0.00"}
                  </AppText>
                </View>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.formCard}>
            <View style={styles.formInner}>
              <AppText variant="overline" color={colors.textSecondary}>
                Shift Status
              </AppText>

              <View style={styles.statusRow}>
                <StatusPill
                  value="confirmed"
                  selected={status === "confirmed"}
                  onPress={setStatus}
                />
                <StatusPill
                  value="pending"
                  selected={status === "pending"}
                  onPress={setStatus}
                />
                <StatusPill
                  value="cancelled"
                  selected={status === "cancelled"}
                  onPress={setStatus}
                />
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.formCard}>
            <View style={styles.formInner}>
              <AppText variant="overline" color={colors.textSecondary}>
                Internal Notes
              </AppText>

              <AppInput
                placeholder="e.g. Bring uniform, confirm break, arrive 10 minutes early..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
                style={styles.notesInput}
                leftIcon={
                  <IconSymbol
                    name="note.text"
                    size={16}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>
          </AppCard>

          {detectedConflict ? (
            <AppCard
              isConflict
              conflictAccent={colors.warning}
              style={styles.conflictCard}
            >
              <View style={styles.conflictInner}>
                <View
                  style={[
                    styles.warningIconWrap,
                    { backgroundColor: colors.warning + "14" },
                  ]}
                >
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={18}
                    color={colors.warning}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <AppText variant="bodyBold" color={colors.warning}>
                    Conflict Detected
                  </AppText>
                  <AppText
                    variant="caption"
                    color={colors.textSecondary}
                    style={styles.conflictText}
                  >
                    This shift overlaps with your existing{" "}
                    {detectedConflict.workplaceName} shift.
                  </AppText>
                </View>
              </View>
            </AppCard>
          ) : (
            <AppCard style={styles.successCard}>
              <View style={styles.conflictInner}>
                <View
                  style={[
                    styles.warningIconWrap,
                    { backgroundColor: colors.success + "14" },
                  ]}
                >
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color={colors.success}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <AppText variant="bodyBold" color={colors.success}>
                    No Active Conflict
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    This shift fits cleanly into your current schedule.
                  </AppText>
                </View>
              </View>
            </AppCard>
          )}

          <View style={styles.actionWrap}>
            <AppButton
              label="Save Shift Entry"
              fullWidth
              size="lg"
              pill
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 140,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 6,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 2,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  heroCard: {
    marginTop: 4,
  },
  heroInner: {
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  heroIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  section: {
    gap: 10,
  },
  errorText: {
    marginTop: -2,
  },
  workplaceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 6,
    paddingBottom: 12,
  },
  formCard: {},
  formInner: {
    padding: 18,
  },
  fieldSpacing: {
    marginTop: 14,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  timeField: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  notesInput: {
    minHeight: 110,
    paddingTop: 14,
  },
  conflictCard: {},
  successCard: {},
  conflictInner: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  warningIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  conflictText: {
    marginTop: 2,
  },
  actionWrap: {
    marginTop: 6,
  },
});
