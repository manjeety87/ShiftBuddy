import React, { useCallback } from "react";
import { type ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const SPRING_CONFIG = { damping: 15, stiffness: 300, mass: 0.6 };

interface AnimatedPressProps {
  children: React.ReactNode;
  /** Scale when pressed (0-1, default 0.97) */
  scale?: number;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * A wrapper that adds a spring-scale micro-interaction on press.
 * Wrap any card or pressable area in this to get a satisfying tap feel.
 */
export function AnimatedPress({
  children,
  scale = 0.97,
  style,
  onPress,
  disabled,
}: AnimatedPressProps) {
  const pressed = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  const handlePressIn = useCallback(() => {
    pressed.value = withSpring(scale, SPRING_CONFIG);
  }, [pressed, scale]);

  const handlePressOut = useCallback(() => {
    pressed.value = withSpring(1, SPRING_CONFIG);
    // Small delay to let spring finish before firing onPress
    if (onPress && !disabled) {
      onPress();
    }
  }, [pressed, onPress, disabled]);

  return (
    <Animated.View
      style={[animStyle, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={() => {
        pressed.value = withSpring(1, SPRING_CONFIG);
      }}
    >
      {children}
    </Animated.View>
  );
}
