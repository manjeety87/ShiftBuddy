import React, { useEffect } from "react";
import { type ViewStyle } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface PulseViewProps {
  children: React.ReactNode;
  /** Pulse scale (default 1.04) */
  scale?: number;
  /** Animation duration per cycle in ms (default 1500) */
  duration?: number;
  /** Whether to animate (default true) */
  active?: boolean;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Gentle breathing/pulse animation. Great for "NOW" badges,
 * active shift indicators, or attention-needing elements.
 */
export function PulseView({
  children,
  scale = 1.04,
  duration = 1500,
  active = true,
  style,
}: PulseViewProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(scale, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1, // infinite
        false,
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [active, scale, duration, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}
