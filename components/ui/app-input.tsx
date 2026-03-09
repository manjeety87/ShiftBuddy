import { useAppTheme } from "@/hooks/use-app-theme";
import React, { useState } from "react";
import {
    StyleSheet,
    TextInput,
    View,
    type TextInputProps,
    type ViewStyle,
} from "react-native";
import { AppText } from "./app-text";

interface AppInputProps extends TextInputProps {
  /** Label shown above the input */
  label?: string;
  /** Optional left icon */
  leftIcon?: React.ReactNode;
  /** Additional wrapper style */
  containerStyle?: ViewStyle;
  /** Error message */
  error?: string;
}

/**
 * Theme-aware text input with label, icon slot, and error state.
 */
export function AppInput({
  label,
  leftIcon,
  containerStyle,
  error,
  style,
  ...rest
}: AppInputProps) {
  const { colors, theme } = useAppTheme();
  const r = theme.tokens.radiusScale;
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.accent
      : colors.border;

  return (
    <View style={containerStyle}>
      {label && (
        <AppText variant="captionBold" style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderRadius: 12 * r,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconSlot}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={colors.textSecondary + "88"}
          style={[
            styles.input,
            { color: colors.textPrimary },
            !leftIcon && styles.inputNoIcon,
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error && (
        <AppText variant="caption" color={colors.error} style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    minHeight: 48,
  },
  iconSlot: { paddingLeft: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputNoIcon: { paddingLeft: 14 },
  error: { marginTop: 4 },
});
