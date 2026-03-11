import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { FadeInView } from "@/components/ui/fade-in-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ocrService } from "@/services";
import { useShiftStore } from "@/store";
import type { Shift } from "@/types";

// ─── Component ──────────────────────────────────────────────────────
export default function UploadShiftScreen() {
  const { colors } = useAppTheme();
  const user = useShiftStore((s) => s.user);
  const workplaces = useShiftStore((s) => s.workplaces);
  const addShift = useShiftStore((s) => s.addShift);

  // Config store for AI key only
  // Use user profile name for schedule matching
  const scanName = user?.name ?? "";

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [parsedShifts, setParsedShifts] = useState<Shift[]>([]);
  const [rawText, setRawText] = useState("");
  const [nameFound, setNameFound] = useState<boolean | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [workplaceId, setWorkplaceId] = useState(workplaces[0]?.id ?? "");
  const [adding, setAdding] = useState(false);

  // ── Pick Image ──
  const pickImage = async () => {
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
      setParsedShifts([]);
      setRawText("");
      setNameFound(null);
      setSelectedIds(new Set());
    }
  };

  // ── Take Photo ──
  const takePhoto = async () => {
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
      setParsedShifts([]);
      setRawText("");
      setNameFound(null);
      setSelectedIds(new Set());
    }
  };

  // ── Process with OCR ──
  const processImage = async () => {
    if (!imageUri) return;
    if (!scanName.trim()) {
      Alert.alert(
        "Name Missing",
        "Please set your name in Settings before scanning the schedule.",
      );
      return;
    }

    setProcessing(true);
    try {
      const result = await ocrService.parseScheduleImage(imageUri, scanName);
      setRawText(result.rawText);
      setNameFound(result.userNameFound);

      if (result.shifts.length > 0) {
        const shifts = ocrService.toShiftObjects(result.shifts, workplaceId);
        setParsedShifts(shifts);
        setSelectedIds(new Set(shifts.map((s) => s.id)));
      } else {
        setParsedShifts([]);
      }
    } catch (err: unknown) {
      console.log("Error", err instanceof Error ? err.message : err);

      const msg =
        err instanceof Error ? err.message : "Failed to process image.";
      Alert.alert(
        "OCR Error",
        msg +
          "\n\nTip: Make sure the image is clear and your name is set in Settings.",
      );
    } finally {
      setProcessing(false);
    }
  };

  // ── Toggle shift selection ──
  const toggleShift = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Add selected shifts ──
  const addSelectedShifts = () => {
    if (adding) return; // prevent double-tap
    const toAdd = parsedShifts.filter((s) => selectedIds.has(s.id));
    if (toAdd.length === 0) {
      Alert.alert(
        "No Shifts Selected",
        "Please select at least one shift to add.",
      );
      return;
    }

    setAdding(true);
    for (const shift of toAdd) {
      addShift(shift);
    }

    Alert.alert(
      "Shifts Added!",
      `${toAdd.length} shift${toAdd.length > 1 ? "s" : ""} added from your schedule.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  // ── Time formatting ──
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const durHrs = (s: Shift) =>
    (
      (new Date(s.endDateTime).getTime() -
        new Date(s.startDateTime).getTime()) /
      3_600_000
    ).toFixed(1);

  const selectedWp = workplaces.find((w) => w.id === workplaceId);

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
            Upload Schedule
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Upload Area ── */}
        <FadeInView delay={50}>
          {imageUri ? (
            <AppCard style={styles.imageCard}>
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                resizeMode="contain"
              />
              <View style={styles.imageActions}>
                <Pressable
                  onPress={() => {
                    setImageUri(null);
                    setParsedShifts([]);
                    setRawText("");
                    setNameFound(null);
                  }}
                  style={[styles.changeBtn, { borderColor: colors.border }]}
                >
                  <AppText variant="captionBold" color={colors.textSecondary}>
                    Change Image
                  </AppText>
                </Pressable>
              </View>
            </AppCard>
          ) : (
            <AppCard style={styles.uploadArea}>
              <View style={styles.uploadInner}>
                <View
                  style={[
                    styles.uploadIconCircle,
                    { backgroundColor: colors.accent + "18" },
                  ]}
                >
                  <IconSymbol
                    name="camera.fill"
                    size={36}
                    color={colors.accent}
                  />
                </View>
                <AppText variant="subheading" center>
                  Upload Schedule Image
                </AppText>
                <AppText
                  variant="body"
                  color={colors.textSecondary}
                  center
                  style={styles.uploadHint}
                >
                  Take a photo or pick from your gallery. AI will extract your
                  shifts automatically.
                </AppText>
                <View style={styles.uploadBtns}>
                  <AppButton
                    label="Take Photo"
                    variant="primary"
                    size="md"
                    onPress={takePhoto}
                    leftIcon={
                      <IconSymbol name="camera.fill" size={18} color="#fff" />
                    }
                    style={styles.uploadBtn}
                  />
                  <AppButton
                    label="Pick from Gallery"
                    variant="outline"
                    size="md"
                    onPress={pickImage}
                    leftIcon={
                      <IconSymbol
                        name="photo.fill"
                        size={18}
                        color={colors.accent}
                      />
                    }
                    style={styles.uploadBtn}
                  />
                </View>
              </View>
            </AppCard>
          )}
        </FadeInView>

        {/* ── Workplace Picker ── */}
        {imageUri && parsedShifts.length === 0 && !processing && (
          <FadeInView delay={100}>
            <AppText variant="subheading" style={styles.sectionTitle}>
              Assign to Workplace
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.wpScroll}
            >
              {workplaces.map((wp) => (
                <Pressable
                  key={wp.id}
                  onPress={() => setWorkplaceId(wp.id)}
                  style={[
                    styles.wpChip,
                    {
                      backgroundColor:
                        workplaceId === wp.id
                          ? wp.color + "22"
                          : colors.surface,
                      borderColor:
                        workplaceId === wp.id ? wp.color : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.wpDot, { backgroundColor: wp.color }]} />
                  <AppText
                    variant="captionBold"
                    color={
                      workplaceId === wp.id ? wp.color : colors.textSecondary
                    }
                  >
                    {wp.name}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          </FadeInView>
        )}

        {/* ── Process Button ── */}
        {imageUri && parsedShifts.length === 0 && (
          <FadeInView delay={150}>
            <AppButton
              label={processing ? "Analyzing..." : "Scan Schedule"}
              variant="primary"
              size="lg"
              fullWidth
              disabled={processing}
              onPress={processImage}
              leftIcon={
                processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <IconSymbol
                    name="doc.text.viewfinder"
                    size={20}
                    color="#fff"
                  />
                )
              }
              style={styles.scanBtn}
            />
          </FadeInView>
        )}

        {/* ── OCR Result: Name Found Status ── */}
        {nameFound !== null && (
          <FadeInView delay={50}>
            {/* AI badge */}
            <View style={styles.aiBadge}>
              <AppText variant="captionBold" color={colors.accent}>
                🤖 Powered by Gemini AI
              </AppText>
            </View>
            <AppCard
              style={[
                styles.statusCard,
                {
                  borderColor: nameFound
                    ? colors.success + "44"
                    : colors.warning + "44",
                },
              ]}
            >
              <View style={styles.statusRow}>
                <IconSymbol
                  name={
                    nameFound
                      ? "checkmark.circle.fill"
                      : "exclamationmark.triangle.fill"
                  }
                  size={22}
                  color={nameFound ? colors.success : colors.warning}
                />
                <View style={styles.flex1}>
                  <AppText
                    variant="bodyBold"
                    color={nameFound ? colors.success : colors.warning}
                  >
                    {nameFound ? "Name Found!" : "Name Not Found"}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {nameFound
                      ? `Found "${scanName}" in the schedule. ${parsedShifts.length} shift${parsedShifts.length !== 1 ? "s" : ""} detected.`
                      : `Could not find "${scanName}" in this schedule. Try a different image or check the name in Settings.`}
                  </AppText>
                </View>
              </View>
            </AppCard>
          </FadeInView>
        )}

        {/* ── Raw Text Preview ── */}
        {rawText.length > 0 && (
          <FadeInView delay={100}>
            <AppText variant="subheading" style={styles.sectionTitle}>
              Extracted Text
            </AppText>
            <AppCard style={styles.rawTextCard}>
              <AppText
                variant="caption"
                color={colors.textSecondary}
                style={styles.rawText}
              >
                {rawText}
              </AppText>
            </AppCard>
          </FadeInView>
        )}

        {/* ── Parsed Shifts ── */}
        {parsedShifts.length > 0 && (
          <FadeInView delay={150}>
            <View style={styles.sectionHeader}>
              <AppText variant="subheading">Detected Shifts</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {selectedIds.size}/{parsedShifts.length} selected
              </AppText>
            </View>

            {parsedShifts.map((shift, idx) => {
              const selected = selectedIds.has(shift.id);
              return (
                <FadeInView key={shift.id} delay={180 + idx * 60}>
                  <Pressable onPress={() => toggleShift(shift.id)}>
                    <AppCard
                      style={[
                        styles.shiftCard,
                        {
                          borderColor: selected
                            ? colors.accent + "66"
                            : colors.border,
                          opacity: selected ? 1 : 0.6,
                        },
                      ]}
                      accentBorder={selected ? selectedWp?.color : undefined}
                    >
                      <View style={styles.shiftRow}>
                        {/* Checkbox */}
                        <View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: selected
                                ? colors.accent
                                : "transparent",
                              borderColor: selected
                                ? colors.accent
                                : colors.border,
                            },
                          ]}
                        >
                          {selected && (
                            <IconSymbol
                              name="checkmark"
                              size={14}
                              color="#fff"
                            />
                          )}
                        </View>
                        <View style={styles.flex1}>
                          <AppText variant="bodyBold">{shift.title}</AppText>
                          <AppText
                            variant="caption"
                            color={colors.textSecondary}
                          >
                            {fmtDate(shift.startDateTime)} ·{" "}
                            {fmtTime(shift.startDateTime)} –{" "}
                            {fmtTime(shift.endDateTime)} ({durHrs(shift)}h)
                          </AppText>
                          <View style={styles.wpLabel}>
                            <View
                              style={[
                                styles.wpDot,
                                {
                                  backgroundColor:
                                    selectedWp?.color ?? colors.accent,
                                },
                              ]}
                            />
                            <AppText
                              variant="label"
                              color={colors.textSecondary}
                            >
                              {selectedWp?.name ?? "No workplace"} · Pending
                            </AppText>
                          </View>
                        </View>
                      </View>
                    </AppCard>
                  </Pressable>
                </FadeInView>
              );
            })}

            {/* Add Selected Button */}
            <View style={styles.addRow}>
              <AppButton
                label={`Add ${selectedIds.size} Shift${selectedIds.size !== 1 ? "s" : ""}`}
                variant="primary"
                size="lg"
                fullWidth
                onPress={addSelectedShifts}
                disabled={adding}
                leftIcon={
                  <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
                }
              />
            </View>
          </FadeInView>
        )}

        {/* ── Cancel ── */}
        <View style={styles.cancelRow}>
          <AppButton
            label="Cancel"
            variant="ghost"
            size="md"
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  headerSpacer: { width: 24 },
  flex1: { flex: 1 },

  // Upload area
  uploadArea: { marginBottom: 16 },
  uploadInner: { alignItems: "center", paddingVertical: 28, gap: 10 },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  uploadHint: { paddingHorizontal: 16, marginBottom: 12 },
  uploadBtns: { flexDirection: "row", gap: 10 },
  uploadBtn: { flex: 1 },

  // Image preview
  imageCard: { marginBottom: 16, padding: 0, overflow: "hidden" },
  preview: { width: "100%", height: 220, borderRadius: 12 },
  imageActions: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
  },
  changeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

  // Section
  sectionTitle: { marginBottom: 10, marginTop: 8 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },

  // Workplace picker
  wpScroll: { marginBottom: 16 },
  wpChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 8,
  },
  wpDot: { width: 8, height: 8, borderRadius: 4 },

  // Scan button
  scanBtn: { marginBottom: 16, marginTop: 4 },

  // Status card
  statusCard: { marginBottom: 12, borderWidth: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  // Raw text
  rawTextCard: { marginBottom: 16, padding: 14 },
  rawText: { fontFamily: "monospace", lineHeight: 18 },

  // Shift cards
  shiftCard: { marginBottom: 10, borderWidth: 1 },
  shiftRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  wpLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  // Add / Cancel
  addRow: { marginTop: 8, marginBottom: 12 },
  cancelRow: { alignItems: "center", marginTop: 4, marginBottom: 8 },
  bottomSpacer: { height: 60 },
  aiBadge: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
});
