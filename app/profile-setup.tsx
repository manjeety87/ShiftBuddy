/**
 * Profile Setup — Shown on first app launch when no user profile exists.
 * User enters their name + optional email, then gets routed to the main tabs.
 */

import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useShiftStore } from "@/store";

export default function ProfileSetupScreen() {
  const { colors } = useAppTheme();
  const setUser = useShiftStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleGetStarted = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name so we can find your shifts in photos.");
      return;
    }
    setError("");

    const now = new Date().toISOString();
    setUser({
      id: Crypto.randomUUID(),
      name: trimmed,
      email: email.trim() || undefined,
      createdAt: now,
    });

    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration / icon */}
        <View
          style={[styles.iconCircle, { backgroundColor: colors.accent + "22" }]}
        >
          <AppText style={styles.iconEmoji}>📅</AppText>
        </View>

        <AppText
          variant="largeTitle"
          style={[styles.title, { color: colors.textPrimary }]}
        >
          Welcome to ShiftBuddy
        </AppText>
        <AppText
          variant="body"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Track shifts across multiple jobs, scan schedule photos with AI, and
          never miss a conflict.
        </AppText>

        {/* ── Name ── */}
        <AppText
          variant="overline"
          style={[styles.label, { color: colors.textSecondary }]}
        >
          YOUR NAME *
        </AppText>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError("");
            }}
            placeholder="e.g. Manjeet Yadav"
            placeholderTextColor={colors.textSecondary + "88"}
            autoCapitalize="words"
            returnKeyType="next"
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>
        <AppText
          variant="caption"
          style={[styles.hint, { color: colors.textSecondary }]}
        >
          Used to find your name in schedule images (AI OCR).
        </AppText>

        {/* ── Email (optional) ── */}
        <AppText
          variant="overline"
          style={[styles.label, { color: colors.textSecondary }]}
        >
          EMAIL (optional)
        </AppText>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary + "88"}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleGetStarted}
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>

        {/* ── Error ── */}
        {error ? (
          <AppText
            variant="caption"
            style={[styles.error, { color: colors.error }]}
          >
            {error}
          </AppText>
        ) : null}

        {/* ── CTA ── */}
        <AppButton
          label="Get Started →"
          variant="primary"
          size="lg"
          onPress={handleGetStarted}
          style={styles.cta}
        />

        <AppText
          variant="caption"
          style={[styles.privacy, { color: colors.textSecondary }]}
        >
          All data stays on your device. Nothing is uploaded except schedule
          images you choose to scan.
        </AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    alignSelf: "center",
  },
  iconEmoji: { fontSize: 38 },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  label: {
    marginBottom: 6,
    letterSpacing: 1,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
  },
  hint: {
    marginBottom: 20,
    marginLeft: 2,
  },
  error: {
    marginBottom: 12,
    marginLeft: 2,
  },
  cta: {
    marginTop: 16,
    marginBottom: 20,
  },
  privacy: {
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
  },
});
