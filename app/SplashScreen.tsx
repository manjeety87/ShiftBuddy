import { useAppTheme } from "@/hooks/use-app-theme";
import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiquidBackground } from "@/components/ui/liquid-background";

export default function SplashScreen() {
  const { tokens } = useAppTheme();

  const [logoAnim] = useState(() => new Animated.Value(0));
  const [taglineAnim] = useState(() => new Animated.Value(0));
  const [footerAnim] = useState(() => new Animated.Value(0));
  const [orbAnim] = useState(() => new Animated.Value(0));
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Logo + title entrance - fade in, scale up, settle
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();

    // Tagline entrance - delayed fade in
    Animated.timing(taglineAnim, {
      toValue: 1,
      duration: 1000,
      delay: 800,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();

    // Footer entrance - settles at 30% opacity
    Animated.timing(footerAnim, {
      toValue: 1,
      duration: 2000,
      delay: 1500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Loading orb - continuous pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Logo card - continuous gentle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [logoAnim, taglineAnim, footerAnim, orbAnim, floatAnim]);

  // Interpolations
  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const taglineTranslateY = taglineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const footerOpacity = footerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const orbScale = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const orbOpacity = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const floatScale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <View style={[styles.root, { backgroundColor: tokens.background }]}>
      <LiquidBackground />

      <View style={styles.mainContent}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoCardWrap,
              {
                transform: [
                  { translateY: floatTranslateY },
                  { scale: floatScale },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.logoCard,
                {
                  backgroundColor: tokens.surfaceElevated,
                  borderColor: tokens.glassHighlight,
                  shadowColor: tokens.primary,
                },
              ]}
            >
              <View style={styles.iconBox}>
                <View
                  style={[
                    styles.iconRing,
                    { borderColor: `${tokens.primary}33` },
                  ]}
                />

                <IconSymbol
                  name="safari.fill"
                  size={60}
                  color={tokens.primary}
                  fill={1}
                />

                <View
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: tokens.primaryPressed,
                      borderColor: tokens.surfaceElevated,
                    },
                  ]}
                />
              </View>
            </View>
          </Animated.View>

          <AppText
            variant="largeTitle"
            center
            style={[styles.title, { color: tokens.primary }]}
          >
            ShiftBuddy
          </AppText>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineWrap,
            {
              opacity: taglineAnim,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          <AppText
            variant="subheading"
            center
            style={[styles.tagline, { color: `${tokens.primary}CC` }]}
          >
            All your jobs. One clear schedule.
          </AppText>
        </Animated.View>
      </View>

      {/* High-End Loading Indicator */}
      <View style={styles.bottomSection}>
        <View style={styles.orbContainer}>
          <Animated.View
            style={[
              styles.orb,
              {
                transform: [{ scale: orbScale }],
                opacity: orbOpacity,
                backgroundColor: tokens.glassBackground,
                borderColor: tokens.glassBorder,
              },
            ]}
          />

          <View
            style={[styles.orbInnerGlow, { backgroundColor: tokens.primary }]}
          />
        </View>

        <AppText
          variant="overline"
          center
          style={[styles.loadingText, { color: `${tokens.primary}66` }]}
        >
          Synchronizing Workspaces
        </AppText>
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <View
          style={[styles.footerLine, { backgroundColor: `${tokens.primary}33` }]}
        />

        <AppText
          variant="label"
          center
          style={[styles.footerVersion, { color: tokens.primary }]}
        >
          v 2.4.0
        </AppText>

        <View
          style={[styles.footerLine, { backgroundColor: `${tokens.primary}33` }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    alignItems: "center",
    gap: 48,
  },
  logoSection: {
    alignItems: "center",
  },
  logoCardWrap: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCard: {
    width: 128,
    height: 128,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.12,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
  iconBox: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 40,
  },
  accentDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  title: {
    letterSpacing: -0.9,
  },
  taglineWrap: {
    maxWidth: 300,
  },
  tagline: {
    letterSpacing: 0.4,
    lineHeight: 26,
  },
  bottomSection: {
    position: "absolute",
    bottom: 96,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  orbContainer: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  orb: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  orbInnerGlow: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  loadingText: {
    letterSpacing: 2,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  footerLine: {
    flex: 1,
    height: 1,
  },
  footerVersion: {
    textTransform: "uppercase",
    marginHorizontal: 16,
  },
});
