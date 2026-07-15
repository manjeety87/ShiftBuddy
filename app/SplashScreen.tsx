import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type SplashScreenProps = {
  onFinish?: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const glowScale = useRef(new Animated.Value(0.9)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.05,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 0.92,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoFloat, {
            toValue: -6,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoFloat, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.timing(progress, {
        toValue: 1,
        duration: 2600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish?.();
      // Example if using expo-router:
      // router.replace("/(tabs)");
    }, 3000);

    return () => clearTimeout(timer);
  }, [contentFade, glowScale, logoFloat, progress, onFinish]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160],
  });

  const logoTranslateStyle = useMemo(
    () => ({
      transform: [{ translateY: logoFloat }],
    }),
    [logoFloat],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Ambient background glows */}
        <View style={styles.bgLayer}>
          <View style={styles.topGlow} />
          <View style={styles.bottomGlow} />
        </View>

        <Animated.View
          style={[
            styles.centerContent,
            { opacity: contentFade, transform: [{ translateY: 8 }] },
          ]}
        >
          <Animated.View style={[styles.logoWrap, logoTranslateStyle]}>
            <Animated.View
              style={[
                styles.outerGlow,
                {
                  transform: [{ scale: glowScale }],
                },
              ]}
            />

            <View style={styles.logoCard}>
              <MaterialIcons
                name="work-history"
                size={68}
                color={COLORS.primary}
              />

              <View style={styles.sparkBadge}>
                <MaterialIcons name="auto-awesome" size={14} color="#002e69" />
              </View>
            </View>
          </Animated.View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>ShiftsBuddy</Text>

            <View style={styles.subtitleRow}>
              <View style={styles.line} />
              <Text style={styles.subtitle}>THE ORCHESTRATOR</Text>
              <View style={styles.line} />
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSection}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>

          <Text style={styles.loadingText}>
            PREPARING YOUR EXECUTIVE DASHBOARD
          </Text>
        </View>

        {/* subtle texture substitute */}
        <View pointerEvents="none" style={styles.noiseOverlay} />
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  background: "#10131a",
  surface: "#1d2026",
  surfaceHigh: "#32353c",
  outline: "#8b90a0",
  outlineVariant: "#414755",
  primary: "#adc6ff",
  primaryDeep: "#4b8eff",
  text: "#e1e2eb",
  tertiary: "#ffb595",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: "absolute",
    top: -height * 0.08,
    left: -width * 0.18,
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: 999,
    backgroundColor: "rgba(173,198,255,0.10)",
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  bottomGlow: {
    position: "absolute",
    bottom: -height * 0.05,
    right: -width * 0.12,
    width: width * 0.48,
    height: width * 0.48,
    borderRadius: 999,
    backgroundColor: "rgba(255,181,149,0.07)",
    transform: [{ scaleX: 1.15 }, { scaleY: 1.15 }],
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    marginBottom: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  outerGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(173,198,255,0.14)",
  },
  logoCard: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(65,71,85,0.35)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  sparkBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: COLORS.primaryDeep,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primaryDeep,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  textBlock: {
    alignItems: "center",
  },
  title: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  line: {
    width: 34,
    height: 1,
    backgroundColor: "rgba(139,144,160,0.28)",
  },
  subtitle: {
    color: COLORS.outline,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    marginHorizontal: 12,
  },
  bottomSection: {
    position: "absolute",
    bottom: 84,
    alignItems: "center",
  },
  progressTrack: {
    width: 160,
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceHigh,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    marginTop: 16,
    color: "rgba(139,144,160,0.72)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.4,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: "#ffffff",
  },
});
