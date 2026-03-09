import React, { useEffect } from "react";
import { type ViewStyle } from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

interface FadeInViewProps {
  children: React.ReactNode;
  /** Delay in ms before animation starts (default 0) */
  delay?: number;
  /** Duration of fade in ms (default 400) */
  duration?: number;
  /** Slide distance in pixels (default 18, 0 to disable) */
  slideY?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Fade-in + optional slide-up animation on mount.
 * Use `delay` for staggered list animations.
 */
export function FadeInView({
  children,
  delay = 0,
  duration = 400,
  slideY = 18,
  style,
}: FadeInViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [delay, duration, progress]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [slideY, 0]),
      },
    ],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}
