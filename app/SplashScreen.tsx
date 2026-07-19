import { AppText } from "@/components/ui/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SplashScreenProps = {
  onFinish?: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { tokens, theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isDark = theme.tokens.mode === "dark";
  const logoSize = Math.min(Math.max(width * 0.28, 116), 148);
  const progressTrackWidth = Math.min(Math.max(width * 0.42, 160), 240);
  const titleSize = Math.min(Math.max(width * 0.11, 36), 48);

  const glowScale = useRef(new Animated.Value(0.9)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(tokens.background);

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
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    contentFade,
    glowScale,
    logoFloat,
    progress,
    onFinish,
    isDark,
    tokens.background,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, progressTrackWidth],
  });

  const logoTranslateStyle = {
    transform: [{ translateY: logoFloat }],
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={tokens.background}
      />

      <View style={styles.container}>
        {/* Ambient background blobs */}
        <View style={styles.bgLayer}>
          <View
            style={[
              styles.topBlob,
              {
                backgroundColor: `${tokens.primary}1A`,
                width: width * 0.65,
                height: width * 0.65,
                top: -height * 0.08,
                left: -width * 0.18,
              },
            ]}
          />
          <View
            style={[
              styles.bottomBlob,
              {
                backgroundColor: `${tokens.tertiary}12`,
                width: width * 0.48,
                height: width * 0.48,
                bottom: -height * 0.05,
                right: -width * 0.12,
              },
            ]}
          />
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
                  backgroundColor: `${tokens.primary}1A`,
                },
              ]}
            />

            <View
              style={[
                styles.logoCard,
                {
                  width: logoSize,
                  height: logoSize,
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                },
              ]}
            >
              <MaterialIcons
                name="work-history"
                size={68}
                color={tokens.primary}
              />

              <View
                style={[
                  styles.sparkBadge,
                  {
                    backgroundColor: tokens.primary_container,
                  },
                ]}
              >
                <MaterialIcons
                  name="auto-awesome"
                  size={14}
                  color={tokens.iconOnPrimary}
                />
              </View>
            </View>
          </Animated.View>

          <View style={styles.textBlock}>
            <AppText
              variant="largeTitle"
              center
              style={[
                styles.title,
                {
                  color: tokens.textPrimary,
                  fontSize: titleSize,
                  lineHeight: titleSize + 8,
                },
              ]}
            >
              ShiftBuddy
            </AppText>

            <View style={styles.subtitleRow}>
              <View
                style={[
                  styles.line,
                  { backgroundColor: `${tokens.textTertiary}47` },
                ]}
              />
              <AppText
                variant="overline"
                center
                style={[
                  styles.subtitle,
                  {
                    color: tokens.textSecondary,
                  },
                ]}
              >
                All your jobs. One clear schedule.
              </AppText>
              <View
                style={[
                  styles.line,
                  { backgroundColor: `${tokens.textTertiary}47` },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSection}>
          <View style={[styles.progressTrack, { width: progressTrackWidth }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth },
                { backgroundColor: tokens.primary },
              ]}
            />
          </View>

          <AppText
            variant="overline"
            center
            style={[
              styles.loadingText,
              {
                color: `${tokens.textTertiary}B8`,
              },
            ]}
          >
            Synchronizing Workspaces
          </AppText>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View
            style={[
              styles.footerLine,
              { backgroundColor: `${tokens.primary}33` },
            ]}
          />
          <AppText
            variant="overline"
            center
            style={[
              styles.footerVersion,
              {
                color: `${tokens.primary}4D`,
              },
            ]}
          >
            v 2.4.0
          </AppText>
          <View
            style={[
              styles.footerLine,
              { backgroundColor: `${tokens.primary}33` },
            ]}
          />
        </View>

        {/* Subtle texture overlay */}
        <View style={styles.noiseOverlay} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topBlob: {
    position: "absolute",
    borderRadius: 999,
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  bottomBlob: {
    position: "absolute",
    borderRadius: 999,
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
    borderRadius: 999,
  },
  logoCard: {
    borderRadius: 32,
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  textBlock: {
    alignItems: "center",
  },
  title: {
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
  },
  subtitle: {
    letterSpacing: 4,
    marginHorizontal: 12,
  },
  bottomSection: {
    position: "absolute",
    bottom: 84,
    alignItems: "center",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  loadingText: {
    marginTop: 16,
    letterSpacing: 2.4,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    opacity: 0.3,
  },
  footerLine: {
    flex: 1,
    height: 1,
  },
  footerVersion: {
    letterSpacing: 2.4,
    marginHorizontal: 12,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: "#ffffff",
    pointerEvents: "none",
  },
});
