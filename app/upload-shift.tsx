import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { WorkplaceChoiceCard } from "@/components/shifts/WorkplaceChoiceCard";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { GlassCard } from "@/components/ui/glass-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ocrService, type OCRParseResult } from "@/services/ocr";
import { useShiftStore } from "@/store";

type Phase = "idle" | "processing" | "review" | "error";

const fmtShiftLine = (
  shift: OCRParseResult["shifts"][number],
): { date: string; time: string } => {
  const start = new Date(shift.startDateTime);
  const end = new Date(shift.endDateTime);
  return {
    date: start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  };
};

export default function UploadShiftScreen() {
  const { colors, tokens } = useAppTheme();

  const user = useShiftStore((s) => s.user);
  const workplaces = useShiftStore((s) => s.workplaces);
  const addShift = useShiftStore((s) => s.addShift);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [parseResult, setParseResult] = useState<OCRParseResult | null>(null);
  const [includedIndexes, setIncludedIndexes] = useState<Set<number>>(
    new Set(),
  );
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string>("");

  const selectedWorkplace = useMemo(
    () => workplaces.find((w) => w.id === selectedWorkplaceId),
    [workplaces, selectedWorkplaceId],
  );

  const resetToIdle = () => {
    setPhase("idle");
    setErrorMessage("");
    setParseResult(null);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow photo library access to upload schedule images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to take schedule photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleScan = async () => {
    if (!imageUri) {
      return;
    }

    setPhase("processing");
    setErrorMessage("");

    try {
      const result = await ocrService.parseScheduleImage(
        imageUri,
        user?.name ?? "",
        { scheduleMode: "auto" },
      );

      if (!result.shifts.length) {
        setErrorMessage(
          result.isWorkSchedule
            ? result.userNameFound
              ? "The schedule was read, but no shift times could be matched. Try a clearer photo."
              : `Couldn't find "${user?.name || "your name"}" on this schedule. Set your name in Settings so we can match your shifts, or add this shift manually.`
            : "This doesn't look like a work schedule. Try a different photo.",
        );
        setPhase("error");
        return;
      }

      setParseResult(result);
      setIncludedIndexes(new Set(result.shifts.map((_, index) => index)));

      const matchedWorkplace = result.detectedWorkplaceName
        ? workplaces.find((w) =>
            w.name
              .toLowerCase()
              .includes(result.detectedWorkplaceName!.toLowerCase()),
          )
        : undefined;

      setSelectedWorkplaceId(matchedWorkplace?.id ?? workplaces[0]?.id ?? "");
      setPhase("review");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while scanning this image.",
      );
      setPhase("error");
    }
  };

  const toggleIncluded = (index: number) => {
    setIncludedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleImport = () => {
    if (!parseResult || !selectedWorkplaceId) {
      return;
    }

    const chosenShifts = parseResult.shifts.filter((_, index) =>
      includedIndexes.has(index),
    );

    const shiftsToAdd = ocrService.toShiftObjects(chosenShifts, {
      workplaceId: selectedWorkplaceId,
      associationType: "workplace",
    });

    shiftsToAdd.forEach((shift) => addShift(shift));

    Alert.alert(
      "Shifts imported",
      `${shiftsToAdd.length} shift${shiftsToAdd.length === 1 ? "" : "s"} added to ${selectedWorkplace?.name ?? "your schedule"}.`,
      [{ text: "OK", onPress: () => router.push("/(tabs)/shifts") }],
    );
  };

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={colors.accent} />
        </Pressable>
        <AppText variant="heading" style={styles.flex1} center>
          Import Schedule
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {phase === "processing" ? (
          <View style={styles.processingWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
            <AppText variant="heading" center style={styles.processingTitle}>
              Reading your schedule
            </AppText>
            <AppText variant="body" color={colors.textSecondary} center>
              AI is extracting shift times from your photo…
            </AppText>
          </View>
        ) : phase === "error" ? (
          <View style={styles.processingWrap}>
            <View
              style={[
                styles.errorIcon,
                { backgroundColor: colors.error + "16" },
              ]}
            >
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={28}
                color={colors.error}
              />
            </View>
            <AppText variant="heading" center>
              Couldn&apos;t import this schedule
            </AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              center
              style={styles.errorText}
            >
              {errorMessage}
            </AppText>
            <AppButton
              label="Try Again"
              onPress={resetToIdle}
              style={styles.retryBtn}
            />
          </View>
        ) : phase === "review" && parseResult ? (
          <>
            {parseResult.matchedEmployeeName ? (
              <AppCard style={styles.hintCard} padding={14}>
                <View style={styles.hintRow}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color={colors.success}
                  />
                  <AppText variant="caption" color={colors.textSecondary}>
                    Matched shifts for{" "}
                    <AppText variant="captionBold">
                      {parseResult.matchedEmployeeName}
                    </AppText>
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            <AppText variant="overline" color={colors.textSecondary}>
              Which workplace is this?
            </AppText>

            {workplaces.length === 0 ? (
              <AppCard style={styles.emptyWorkplaceCard}>
                <AppText variant="body" color={colors.textSecondary} center>
                  Add a workplace first so imported shifts have somewhere to
                  go.
                </AppText>
                <AppButton
                  label="Add Workplace"
                  onPress={() => router.push("/add-workplace")}
                  style={styles.addWorkplaceBtn}
                />
              </AppCard>
            ) : (
              <View style={styles.workplaceGrid}>
                {workplaces.map((workplace) => (
                  <View key={workplace.id} style={styles.gridItem}>
                    <WorkplaceChoiceCard
                      label={workplace.name}
                      color={workplace.color}
                      selected={workplace.id === selectedWorkplaceId}
                      onPress={() => setSelectedWorkplaceId(workplace.id)}
                    />
                  </View>
                ))}
              </View>
            )}

            <AppText
              variant="overline"
              color={colors.textSecondary}
              style={styles.shiftsLabel}
            >
              {includedIndexes.size} of {parseResult.shifts.length} shifts
              selected
            </AppText>

            {parseResult.shifts.map((shift, index) => {
              const included = includedIndexes.has(index);
              const { date, time } = fmtShiftLine(shift);

              return (
                <Pressable
                  key={`${shift.startDateTime}-${index}`}
                  onPress={() => toggleIncluded(index)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                >
                  <AppCard
                    style={styles.shiftRow}
                    padding={14}
                    accentBorder={
                      included ? selectedWorkplace?.color ?? colors.accent : undefined
                    }
                  >
                    <View style={styles.shiftRowInner}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: included
                              ? colors.accent
                              : colors.border,
                            backgroundColor: included
                              ? colors.accent
                              : "transparent",
                          },
                        ]}
                      >
                        {included && (
                          <IconSymbol name="checkmark" size={12} color="#fff" />
                        )}
                      </View>
                      <View style={styles.flex1}>
                        <AppText variant="bodyBold">{shift.title}</AppText>
                        <AppText variant="caption" color={colors.textSecondary}>
                          {date} · {time}
                        </AppText>
                      </View>
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}

            <View style={styles.actions}>
              <AppButton
                label={`Import ${includedIndexes.size} Shift${includedIndexes.size === 1 ? "" : "s"}`}
                onPress={handleImport}
                disabled={includedIndexes.size === 0 || !selectedWorkplaceId}
                fullWidth
              />
              <AppButton
                label="Start Over"
                variant="ghost"
                onPress={resetToIdle}
                fullWidth
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.hero}>
              <AppText variant="title" center>
                Import Your Schedule
              </AppText>
              <AppText
                variant="body"
                color={colors.textSecondary}
                center
                style={styles.heroSubtitle}
              >
                Snap a photo of a paper schedule or a screenshot from another
                app — AI finds your shifts automatically.
              </AppText>
            </View>

            <GlassCard style={styles.uploadCard} padding={24}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} />
              ) : (
                <View
                  style={[
                    styles.uploadIcon,
                    { backgroundColor: colors.accent + "14" },
                  ]}
                >
                  <IconSymbol
                    name="cloud.upload.fill"
                    size={38}
                    color={colors.accent}
                  />
                </View>
              )}

              <AppText variant="bodyBold" center style={styles.uploadTitle}>
                {imageUri ? "Photo ready" : "Choose a photo"}
              </AppText>

              <View style={styles.pickerRow}>
                <Pressable
                  onPress={handlePickImage}
                  style={({ pressed }) => [
                    styles.pickerButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <IconSymbol
                    name="photo.on.rectangle"
                    size={22}
                    color={colors.accent}
                  />
                  <AppText variant="label" color={colors.textSecondary}>
                    GALLERY
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={handleTakePhoto}
                  style={({ pressed }) => [
                    styles.pickerButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <IconSymbol name="camera.fill" size={22} color={colors.accent} />
                  <AppText variant="label" color={colors.textSecondary}>
                    CAMERA
                  </AppText>
                </Pressable>
              </View>
            </GlassCard>

            <Pressable
              onPress={handleScan}
              disabled={!imageUri}
              style={({ pressed }) => [
                styles.cta,
                { opacity: !imageUri ? 0.5 : pressed ? 0.85 : 1 },
              ]}
            >
              <LinearGradient
                colors={[tokens.primaryGradientStart, tokens.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <IconSymbol name="sparkles" size={20} color={tokens.textOnPrimary} />
                <AppText variant="bodyBold" color={tokens.textOnPrimary}>
                  Scan Schedule
                </AppText>
              </LinearGradient>
            </Pressable>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 8,
  },
  headerSpacer: { width: 24 },
  flex1: { flex: 1 },

  scroll: { paddingHorizontal: 20, paddingBottom: 60, gap: 14 },

  hero: { gap: 8, marginTop: 8, marginBottom: 4 },
  heroSubtitle: { marginTop: 2 },

  uploadCard: { alignItems: "center", gap: 14 },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  uploadTitle: { marginTop: 4 },
  pickerRow: { flexDirection: "row", gap: 12, width: "100%" },
  pickerButton: {
    flex: 1,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  cta: { borderRadius: 999, overflow: "hidden", marginTop: 4 },
  ctaGradient: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  processingWrap: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 80,
    paddingHorizontal: 12,
  },
  processingTitle: { marginTop: 12 },

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  errorText: { paddingHorizontal: 8 },
  retryBtn: { marginTop: 12, minWidth: 160 },

  hintCard: {},
  hintRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  workplaceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridItem: { width: "50%", paddingHorizontal: 6, paddingBottom: 12 },
  emptyWorkplaceCard: { alignItems: "center", gap: 12 },
  addWorkplaceBtn: { minWidth: 180 },

  shiftsLabel: { marginTop: 6 },
  shiftRow: {},
  shiftRowInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: { gap: 10, marginTop: 8 },

  bottomSpacer: { height: 40 },
});
