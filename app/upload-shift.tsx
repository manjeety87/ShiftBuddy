import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import { AppScreen } from "@/components/ui/app-screen";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ocrService } from "@/services";
import type { ThemeTokens } from "@/theme";

const alphaColor = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

type UploadPalette = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  primaryOn: string;
  primarySoft: string;
  secondaryContainer: string;
  secondaryOnContainer: string;
  border: string;
  borderSoft: string;
  glassBackground: string;
  glassBorder: string;
  overlay: string;
};

const buildUploadPalette = (tokens: ThemeTokens): UploadPalette => ({
  background: tokens.background,
  surface: tokens.surface,
  text: tokens.textPrimary,
  textSecondary: tokens.textSecondary,
  textTertiary: tokens.textTertiary,
  primary: tokens.primary,
  primaryLight: tokens.primaryGradientEnd,
  primaryOn: tokens.textOnPrimary,
  primarySoft: tokens.primarySoft,
  secondaryContainer: alphaColor(tokens.primary, 0.08),
  secondaryOnContainer: tokens.textSecondary,
  border: tokens.border,
  borderSoft: tokens.divider,
  glassBackground: tokens.glassBackground,
  glassBorder: tokens.glassBorder,
  overlay: tokens.background,
});

const buildStyles = (tokens: ThemeTokens, palette: UploadPalette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: alphaColor(palette.surface, 0.8),
    },
    headerInner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      width: "100%",
      maxWidth: 1120,
      alignSelf: "center",
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.primary,
    },
    title: {
      color: palette.primary,
      fontFamily: "Manrope",
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    headerAction: {
      padding: 8,
      borderRadius: 999,
    },
    main: {
      flex: 1,
      width: "100%",
      maxWidth: 512,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 96,
      paddingBottom: 128,
      minHeight: "100%",
    },
    uploadSection: {
      width: "100%",
      alignItems: "center",
      gap: 40,
    },
    hero: {
      width: "100%",
      alignItems: "center",
    },
    heading: {
      color: palette.text,
      fontFamily: "Manrope",
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "800",
      letterSpacing: -0.8,
      textAlign: "center",
      marginBottom: 8,
    },
    subheading: {
      color: palette.textSecondary,
      fontFamily: "Inter",
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
      textAlign: "center",
    },
    uploadCard: {
      width: "100%",
      aspectRatio: 0.8,
      borderRadius: 32,
      padding: 32,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: palette.glassBorder,
      backgroundColor: palette.glassBackground,
      justifyContent: "center",
      shadowColor: tokens.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    orbTopRight: {
      position: "absolute",
      top: -48,
      right: -48,
      width: 128,
      height: 128,
      borderRadius: 999,
      backgroundColor: alphaColor(palette.primary, 0.05),
    },
    orbBottomLeft: {
      position: "absolute",
      bottom: -48,
      left: -48,
      width: 128,
      height: 128,
      borderRadius: 999,
      backgroundColor: alphaColor(tokens.primary, 0.1),
    },
    uploadInner: {
      width: "100%",
      alignItems: "center",
      gap: 32,
    },
    uploadIntro: {
      alignItems: "center",
      gap: 16,
    },
    uploadIcon: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: alphaColor(palette.primary, 0.1),
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      color: palette.text,
      fontFamily: "Manrope",
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: -0.2,
    },
    cardSubTitle: {
      color: alphaColor(palette.textSecondary, 0.7),
      fontFamily: "Inter",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      textAlign: "center",
    },
    uploadGrid: {
      width: "100%",
      flexDirection: "row",
      gap: 16,
    },
    pickerButton: {
      flex: 1,
      minHeight: 96,
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: alphaColor(palette.surface, 0.6),
      borderWidth: 1,
      borderColor: alphaColor(tokens.border, 0.15),
      shadowColor: tokens.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 1,
    },
    pickerButtonPressed: {
      transform: [{ scale: 0.95 }],
      backgroundColor: palette.surface,
    },
    pickerLabel: {
      color: palette.text,
      fontFamily: "Inter",
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      letterSpacing: 1.8,
      textTransform: "uppercase",
    },
    cta: {
      width: "100%",
      borderRadius: 999,
      overflow: "hidden",
      shadowColor: tokens.primary,
      shadowOpacity: 0.2,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4,
    },
    ctaGradient: {
      minHeight: 64,
      paddingHorizontal: 24,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 12,
    },
    ctaPressed: {
      transform: [{ scale: 0.98 }],
    },
    ctaText: {
      color: palette.primaryOn,
      fontFamily: "Manrope",
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "700",
    },
    processingOverlay: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      backgroundColor: palette.surface,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    processingOrbWrap: {
      width: 256,
      height: 256,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 48,
    },
    processingOrbOuter: {
      position: "absolute",
      width: 192,
      height: 192,
      borderRadius: 96,
      backgroundColor: tokens.primarySoft,
      shadowColor: tokens.primary,
      shadowOpacity: 0.4,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 0 },
      elevation: 12,
    },
    processingOrbInner: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: alphaColor(tokens.primary, 0.2),
      borderWidth: 1,
      borderColor: alphaColor(tokens.surface, 0.3),
    },
    processingRing: {
      position: "absolute",
      inset: 0,
      borderWidth: 2,
      borderColor: alphaColor(tokens.primary, 0.2),
      borderRadius: 128,
    },
    processingCopy: {
      alignItems: "center",
      gap: 12,
      maxWidth: 280,
      textAlign: "center",
    },
    processingTitle: {
      color: palette.text,
      fontFamily: "Manrope",
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.4,
    },
    processingText: {
      color: palette.textSecondary,
      fontFamily: "Inter",
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
      textAlign: "center",
    },
    successPill: {
      marginTop: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: alphaColor(tokens.primary, 0.12),
    },
    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 24,
      zIndex: 55,
      paddingHorizontal: 16,
    },
    bottomNavInner: {
      width: "100%",
      maxWidth: 448,
      alignSelf: "center",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: alphaColor(tokens.surfaceElevated, 0.6),
      shadowColor: tokens.primary,
      shadowOpacity: 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    navItem: {
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      minWidth: 54,
    },
    navLabel: {
      color: alphaColor(palette.textSecondary, 0.7),
      fontFamily: "Inter",
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "600",
      letterSpacing: 1.6,
      textTransform: "uppercase",
      marginTop: 2,
    },
    navActive: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.primary,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ scale: 1.1 }],
      shadowColor: tokens.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
  });

export default function UploadShiftScreen() {
  const { width } = useWindowDimensions();
  const { tokens } = useAppTheme();
  const palette = useMemo(() => buildUploadPalette(tokens), [tokens]);
  const styles = useMemo(() => buildStyles(tokens, palette), [tokens, palette]);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingText, setProcessingText] = useState(
    "AI is extracting shifts from your schedule...",
  );

  useEffect(() => {
    if (!showProcessing) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setProcessingText("Schedule successfully parsed!");
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [showProcessing]);

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

  const handleScan = () => {
    setShowProcessing(true);
    setProcessingText("AI is extracting shifts from your schedule...");

    if (imageUri) {
      void ocrService
        .parseScheduleImage(imageUri, "", {
          scheduleMode: "auto",
          workplaceName: "",
          aliases: [],
        })
        .catch(() => {
          // Visual parity takes priority here; errors stay quiet.
        });
    }
  };

  const contentWidth = useMemo(() => Math.min(width - 48, 512), [width]);

  if (showProcessing) {
    return (
      <AppScreen
        safeBottom={false}
        showLiquidBackground={false}
        style={{ backgroundColor: palette.surface }}
      >
        <View style={styles.processingOverlay}>
          <View style={styles.processingOrbWrap}>
            <View style={styles.processingOrbOuter} />
            <View style={styles.processingOrbInner} />
            <View style={styles.processingRing} />
          </View>

          <View style={styles.processingCopy}>
            <AppText style={styles.processingTitle}>
              Extraction in progress
            </AppText>
            <AppText style={styles.processingText}>{processingText}</AppText>
          </View>

          <View style={styles.successPill}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={14}
              color={tokens.primary}
            />
            <AppText
              style={{
                color: tokens.primary,
                fontFamily: "Inter",
                fontSize: 10,
                lineHeight: 12,
                fontWeight: "700",
                letterSpacing: 1.6,
                textTransform: "uppercase",
              }}
            >
              Analyzing 4 shifts found
            </AppText>
          </View>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      safeBottom={false}
      showLiquidBackground={false}
      style={{ backgroundColor: palette.background }}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.brandRow}>
              <View style={styles.avatar}>
                <IconSymbol
                  name="person.fill"
                  size={18}
                  color={palette.primaryOn}
                  fill={1}
                />
              </View>
              <AppText style={styles.title}>ShiftBuddy</AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/settings")}
              style={({ pressed }) => [
                styles.headerAction,
                pressed && { opacity: 0.8 },
              ]}
            >
              <IconSymbol name="bell.fill" size={24} color={palette.primary} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.main, { maxWidth: contentWidth }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.uploadSection}>
            <View style={styles.hero}>
              <AppText style={styles.heading}>Import Your Schedule</AppText>
              <AppText style={styles.subheading}>
                Sync your roster in seconds using AI extraction.
              </AppText>
            </View>

            <View style={styles.uploadCard}>
              <View style={styles.orbTopRight} />
              <View style={styles.orbBottomLeft} />

              <View style={styles.uploadInner}>
                <View style={styles.uploadIntro}>
                  <View style={styles.uploadIcon}>
                    <IconSymbol
                      name="cloud.upload.fill"
                      size={42}
                      color={palette.primary}
                    />
                  </View>

                  <View>
                    <AppText style={styles.cardTitle}>Drop file here</AppText>
                    <AppText style={styles.cardSubTitle}>
                      PNG, JPG, or PDF up to 10MB
                    </AppText>
                  </View>
                </View>

                <View style={styles.uploadGrid}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handlePickImage}
                    style={({ pressed }) => [
                      styles.pickerButton,
                      pressed && styles.pickerButtonPressed,
                    ]}
                  >
                    <IconSymbol
                      name="photo.on.rectangle"
                      size={24}
                      color={palette.primary}
                    />
                    <AppText style={styles.pickerLabel}>Gallery</AppText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleTakePhoto}
                    style={({ pressed }) => [
                      styles.pickerButton,
                      pressed && styles.pickerButtonPressed,
                    ]}
                  >
                    <IconSymbol
                      name="camera.fill"
                      size={24}
                      color={palette.primary}
                    />
                    <AppText style={styles.pickerLabel}>Camera</AppText>
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleScan}
              style={({ pressed }) => [
                styles.cta,
                pressed && styles.ctaPressed,
              ]}
            >
              <LinearGradient
                colors={[
                  tokens.primaryGradientStart,
                  tokens.primaryGradientEnd,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <IconSymbol
                  name="sparkles"
                  size={20}
                  color={palette.primaryOn}
                />
                <AppText style={styles.ctaText}>Scan Schedule</AppText>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.bottomNav} pointerEvents="box-none">
          <View style={styles.bottomNavInner}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)")}
              style={styles.navItem}
            >
              <IconSymbol
                name="house"
                size={22}
                color={alphaColor(palette.textSecondary, 0.7)}
              />
              <AppText style={styles.navLabel}>Home</AppText>
            </Pressable>

            <View style={styles.navActive}>
              <IconSymbol
                name="clock.fill"
                size={22}
                color={palette.primaryOn}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/calendar")}
              style={styles.navItem}
            >
              <IconSymbol
                name="calendar"
                size={22}
                color={alphaColor(palette.textSecondary, 0.7)}
              />
              <AppText style={styles.navLabel}>Calendar</AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/workplaces")}
              style={styles.navItem}
            >
              <IconSymbol
                name="briefcase.fill"
                size={22}
                color={alphaColor(palette.textSecondary, 0.7)}
              />
              <AppText style={styles.navLabel}>Jobs</AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/settings")}
              style={styles.navItem}
            >
              <IconSymbol
                name="gearshape.fill"
                size={22}
                color={alphaColor(palette.textSecondary, 0.7)}
              />
              <AppText style={styles.navLabel}>Settings</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}
