import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
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
  const [scanCompleted, setScanCompleted] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [assumedPersonal, setAssumedPersonal] = useState(false);
  const [associationType, setAssociationType] = useState<
    "workplace" | "temporary" | "unassigned"
  >(workplaces.length > 0 ? "workplace" : "unassigned");

  const [temporaryWorkplaceName, setTemporaryWorkplaceName] = useState("");
  const [detectedShiftCount, setDetectedShiftCount] = useState(0);

  useEffect(() => {
    /*
     * Do not automatically select a workplace when the user has chosen
     * Temporary or Unassigned.
     */
    if (associationType !== "workplace") {
      return;
    }

    if (workplaces.length === 0) {
      setWorkplaceId("");
      setAssociationType("unassigned");
      return;
    }

    const selectedStillExists = workplaces.some(
      (workplace) => workplace.id === workplaceId,
    );

    if (!workplaceId || !selectedStillExists) {
      setWorkplaceId(workplaces[0].id);
    }
  }, [workplaces, workplaceId, associationType]);

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
      resetScanResult();
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
      resetScanResult();
    }
  };

  const resetScanResult = () => {
    setParsedShifts([]);
    setRawText("");
    setNameFound(null);
    setSelectedIds(new Set());
    setScanCompleted(false);
    setNeedsReview(false);
    setAssumedPersonal(false);
    setDetectedShiftCount(0);
  };

  // ── Process with OCR ──
  const processImage = async () => {
    if (!imageUri) {
      Alert.alert(
        "Image Required",
        "Take a photo or select a schedule image first.",
      );
      return;
    }

    setProcessing(true);

    try {
      /*
       * Scan first.
       * Workplace assignment will happen only after shifts are detected.
       */
      const result = await ocrService.parseScheduleImage(
        imageUri,
        scanName.trim(),
        {
          scheduleMode: "auto",
          workplaceName: "",
          aliases: [],
        },
      );

      console.log("OCR result:", result);

      setRawText(result.rawText);
      setNameFound(result.userNameFound);
      setScanCompleted(true);

      setDetectedShiftCount(
        Array.isArray(result.shifts) ? result.shifts.length : 0,
      );

      setNeedsReview(result.needsReview ?? false);
      setAssumedPersonal(result.assumedPersonalSchedule ?? false);

      const extractedShifts = Array.isArray(result.shifts) ? result.shifts : [];

      console.log("Backend extracted shift count:", extractedShifts.length);

      if (extractedShifts.length === 0) {
        setParsedShifts([]);
        setSelectedIds(new Set());
        return;
      }

      const convertedShifts = ocrService.toShiftObjects(extractedShifts, {
        workplaceId: null,
        associationType: "unassigned",
      });

      console.log("Converted app shifts:", convertedShifts);

      if (convertedShifts.length === 0) {
        throw new Error(
          "The schedule was read successfully, but the detected shift could not be converted. Check the start and end date-time values.",
        );
      }

      setParsedShifts(convertedShifts);
      setSelectedIds(new Set(convertedShifts.map((shift) => shift.id)));

      /*
       * Suggested initial selection after scan:
       * - If saved workplaces exist, do not force one.
       * - Default remains Unassigned until the user chooses.
       */
      setAssociationType("unassigned");
      setWorkplaceId("");
      setTemporaryWorkplaceName("");
    } catch (error: unknown) {
      console.error("OCR processing error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to process the schedule image.";

      Alert.alert(
        "OCR Error",
        `${message}\n\nTry again in a moment or use a clearer schedule image.`,
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
    if (adding) return;

    const toAdd = parsedShifts.filter((shift) => selectedIds.has(shift.id));

    if (toAdd.length === 0) {
      Alert.alert(
        "No Shifts Selected",
        "Please select at least one shift to add.",
      );
      return;
    }

    const selectedWorkplace = workplaces.find(
      (workplace) => workplace.id === workplaceId,
    );

    const assignmentLabel =
      associationType === "workplace"
        ? (selectedWorkplace?.name ?? "Selected workplace")
        : associationType === "temporary"
          ? temporaryWorkplaceName.trim() || "Temporary shift"
          : "Unassigned";

    const saveSelectedShifts = () => {
      setAdding(true);

      for (const shift of toAdd) {
        addShift(shift);
      }

      Alert.alert(
        "Shifts Added",
        `${toAdd.length} shift${
          toAdd.length !== 1 ? "s" : ""
        } added under ${assignmentLabel}.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    };

    const requiresConfirmation =
      needsReview || associationType === "unassigned";

    if (requiresConfirmation) {
      const message =
        associationType === "unassigned"
          ? "No workplace is assigned. These shifts will be saved as Unassigned and can be edited later."
          : `The employee name may not be visible. Confirm that the detected shifts belong under ${assignmentLabel}.`;

      Alert.alert("Confirm Shifts", message, [
        {
          text: "Review Again",
          style: "cancel",
        },
        {
          text: "Save Shifts",
          onPress: saveSelectedShifts,
        },
      ]);

      return;
    }

    saveSelectedShifts();
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

  const currentAssignmentLabel =
    associationType === "workplace"
      ? (selectedWp?.name ?? "Saved Workplace")
      : associationType === "temporary"
        ? temporaryWorkplaceName.trim() || "Temporary Shift"
        : "Unassigned";

  const currentAssignmentColor =
    associationType === "workplace"
      ? (selectedWp?.color ?? colors.accent)
      : associationType === "temporary"
        ? colors.warning
        : colors.textSecondary;

  return (
    <AppScreen>
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

        {/* ── Process Button ── */}
        {imageUri && detectedShiftCount === 0 && (
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
        {scanCompleted && (
          <FadeInView delay={50}>
            <View style={styles.aiBadge}>
              <AppText variant="captionBold" color={colors.accent}>
                🤖 Powered by Gemini AI
              </AppText>
            </View>

            <AppCard style={styles.statusCard}>
              <View style={styles.statusRow}>
                <IconSymbol
                  name={
                    detectedShiftCount > 0
                      ? needsReview
                        ? "exclamationmark.triangle.fill"
                        : "checkmark.circle.fill"
                      : "exclamationmark.triangle.fill"
                  }
                  size={22}
                  color={
                    detectedShiftCount > 0
                      ? needsReview
                        ? colors.warning
                        : colors.success
                      : colors.warning
                  }
                />

                <View style={styles.flex1}>
                  <AppText
                    variant="bodyBold"
                    color={
                      detectedShiftCount > 0
                        ? needsReview
                          ? colors.warning
                          : colors.success
                        : colors.warning
                    }
                  >
                    {detectedShiftCount > 0
                      ? `${detectedShiftCount} shift${
                          detectedShiftCount !== 1 ? "s were" : " was"
                        } detected. Review the details below before adding.`
                      : "Try a clearer image or confirm that the screenshot contains visible shift dates and times."}
                  </AppText>

                  <AppText variant="caption" color={colors.textSecondary}>
                    {detectedShiftCount > 0
                      ? assumedPersonal && !nameFound
                        ? `Your name is not visible, but ${detectedShiftCount} shift${
                            detectedShiftCount !== 1 ? "s were" : " was"
                          } found. Review them before adding.`
                        : needsReview
                          ? `${detectedShiftCount} shift${
                              detectedShiftCount !== 1 ? "s were" : " was"
                            } detected. Confirm the dates and times before saving.`
                          : `${detectedShiftCount} shift${
                              detectedShiftCount !== 1 ? "s are" : " is"
                            } ready to add.`
                      : "Try a clearer image or confirm that the screenshot contains visible shift dates and times."}
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
        {detectedShiftCount > 0 && (
          <FadeInView delay={150}>
            <View style={styles.sectionHeader}>
              <AppText variant="subheading">Detected Shifts</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {selectedIds.size}/{detectedShiftCount} selected
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
                      // accentBorder={selected ? selectedWp?.color : undefined}
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
                                  backgroundColor: currentAssignmentColor,
                                },
                              ]}
                            />
                            <AppText
                              variant="label"
                              color={colors.textSecondary}
                            >
                              {currentAssignmentLabel} · Pending
                            </AppText>
                          </View>
                        </View>
                      </View>
                    </AppCard>
                  </Pressable>
                </FadeInView>
              );
            })}

            {/* ── Shift Assignment ── */}
            {detectedShiftCount > 0 && (
              <FadeInView delay={100}>
                <AppText variant="subheading" style={styles.sectionTitle}>
                  Assign These Shifts
                </AppText>

                <AppText
                  variant="caption"
                  color={colors.textSecondary}
                  style={styles.workplaceHelp}
                >
                  Select a regular workplace, use a temporary company name, or
                  leave the shifts unassigned for now.
                </AppText>

                {/* Saved workplaces */}
                {workplaces.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.wpScroll}
                    contentContainerStyle={styles.wpScrollContent}
                  >
                    {workplaces.map((workplace) => {
                      const selected =
                        associationType === "workplace" &&
                        workplaceId === workplace.id;

                      return (
                        <Pressable
                          key={workplace.id}
                          onPress={() => {
                            setAssociationType("workplace");
                            setWorkplaceId(workplace.id);
                            setTemporaryWorkplaceName("");
                          }}
                          style={[
                            styles.wpChip,
                            {
                              backgroundColor: selected
                                ? workplace.color + "22"
                                : colors.surface,
                              borderColor: selected
                                ? workplace.color
                                : colors.border,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.wpDot,
                              {
                                backgroundColor: workplace.color,
                              },
                            ]}
                          />

                          <AppText
                            variant="captionBold"
                            color={
                              selected ? workplace.color : colors.textSecondary
                            }
                          >
                            {workplace.name}
                          </AppText>

                          {selected && (
                            <IconSymbol
                              name="checkmark.circle.fill"
                              size={16}
                              color={workplace.color}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Add permanent workplace */}
                <Pressable
                  onPress={() => router.push("/add-workplace")}
                  style={[
                    styles.addAnotherWorkplace,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={18}
                    color={colors.accent}
                  />

                  <View style={styles.flex1}>
                    <AppText variant="bodyBold" color={colors.accent}>
                      Add Saved Workplace
                    </AppText>

                    <AppText variant="caption" color={colors.textSecondary}>
                      Use for a regular employer such as BoatHouse or Walmart.
                    </AppText>
                  </View>
                </Pressable>

                {/* Temporary / unassigned */}
                <View style={styles.assignmentOptions}>
                  <Pressable
                    onPress={() => {
                      setAssociationType("temporary");
                      setWorkplaceId("");
                    }}
                    style={[
                      styles.assignmentOption,
                      {
                        borderColor:
                          associationType === "temporary"
                            ? colors.accent
                            : colors.border,
                        backgroundColor:
                          associationType === "temporary"
                            ? colors.accent + "18"
                            : colors.surface,
                      },
                    ]}
                  >
                    <View style={styles.assignmentOptionRow}>
                      <IconSymbol
                        name="clock.fill"
                        size={20}
                        color={
                          associationType === "temporary"
                            ? colors.accent
                            : colors.textSecondary
                        }
                      />

                      <View style={styles.flex1}>
                        <AppText variant="bodyBold">
                          Temporary / One-time Shift
                        </AppText>

                        <AppText variant="caption" color={colors.textSecondary}>
                          For agency, security, event, or occasional work.
                        </AppText>
                      </View>

                      {associationType === "temporary" && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={20}
                          color={colors.accent}
                        />
                      )}
                    </View>
                  </Pressable>

                  {associationType === "temporary" && (
                    <TextInput
                      value={temporaryWorkplaceName}
                      onChangeText={setTemporaryWorkplaceName}
                      placeholder="Agency or company name (optional)"
                      placeholderTextColor={colors.textSecondary}
                      style={[
                        styles.tempInput,
                        {
                          color: colors.text,
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    />
                  )}

                  <Pressable
                    onPress={() => {
                      setAssociationType("unassigned");
                      setWorkplaceId("");
                      setTemporaryWorkplaceName("");
                    }}
                    style={[
                      styles.assignmentOption,
                      {
                        borderColor:
                          associationType === "unassigned"
                            ? colors.accent
                            : colors.border,
                        backgroundColor:
                          associationType === "unassigned"
                            ? colors.accent + "18"
                            : colors.surface,
                      },
                    ]}
                  >
                    <View style={styles.assignmentOptionRow}>
                      <IconSymbol
                        name="questionmark.circle.fill"
                        size={20}
                        color={
                          associationType === "unassigned"
                            ? colors.accent
                            : colors.textSecondary
                        }
                      />

                      <View style={styles.flex1}>
                        <AppText variant="bodyBold">Unassigned for Now</AppText>

                        <AppText variant="caption" color={colors.textSecondary}>
                          Save the shifts now and assign a workplace later.
                        </AppText>
                      </View>

                      {associationType === "unassigned" && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={20}
                          color={colors.accent}
                        />
                      )}
                    </View>
                  </Pressable>
                </View>
              </FadeInView>
            )}

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
  noWorkplaceCard: {
    marginBottom: 16,
  },

  noWorkplaceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  noWorkplaceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  noWorkplaceDescription: {
    marginTop: 4,
    lineHeight: 18,
  },

  addWorkplaceButton: {
    marginTop: 16,
  },

  workplaceHelp: {
    marginBottom: 10,
  },

  wpScrollContent: {
    paddingRight: 12,
  },

  addAnotherWorkplace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  assignmentOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assignmentOptions: {
    gap: 10,
    marginBottom: 16,
  },

  assignmentOption: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },

  tempInput: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
});
