import { useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  type BlurEvent,
  type FocusEvent,
  type TextInputProps,
} from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/theme";

// --- Animation tuning (focus ring only: color + border width) -----------------

/** How long the border takes to reach full glow / back to idle (ms). */
const FOCUS_RING_DURATION_MS = 220;

/** `focusProgress` is 0 = blurred, 1 = focused; these are the border widths at each end. */
const BORDER_WIDTH_BLURRED = 1;
const BORDER_WIDTH_FOCUSED = 2.5;

// -----------------------------------------------------------------------------

type AuthPalette = (typeof Colors)["light"];

type GlowingTextInputProps = TextInputProps & {
  palette: AuthPalette;
  /** Passed through from callers for a stable API; ring colors use `palette` only. */
  colorScheme: "light" | "dark";
  inputSurface: string;
};

export function GlowingTextInput({
  palette,
  colorScheme: _unusedColorScheme,
  inputSurface,
  style,
  onFocus,
  onBlur,
  onChangeText,
  ...textInputProps
}: GlowingTextInputProps) {
  /** 0 = not focused, 1 = focused — drives border color and width. */
  const focusProgress = useSharedValue(0);

  const borderColorWhenIdle = palette.icon;
  const borderColorWhenFocused = palette.tint;

  const transition = useCallback(
    (toFocused: boolean) => {
      focusProgress.value = withTiming(toFocused ? 1 : 0, {
        duration: FOCUS_RING_DURATION_MS,
      });
    },
    [focusProgress],
  );

  const handleFocus = useCallback(
    (event: FocusEvent) => {
      transition(true);
      onFocus?.(event);
    },
    [onFocus, transition],
  );

  const handleBlur = useCallback(
    (event: BlurEvent) => {
      transition(false);
      onBlur?.(event);
    },
    [onBlur, transition],
  );

  const focusRingStyle = useAnimatedStyle(() => {
    const t = focusProgress.value;
    return {
      borderColor: interpolateColor(t, [0, 1], [
        borderColorWhenIdle,
        borderColorWhenFocused,
      ]),
      borderWidth: interpolate(t, [0, 1], [
        BORDER_WIDTH_BLURRED,
        BORDER_WIDTH_FOCUSED,
      ]),
    };
  }, [borderColorWhenIdle, borderColorWhenFocused]);

  return (
    <Animated.View
      style={[
        styles.ring,
        { backgroundColor: inputSurface },
        focusRingStyle,
      ]}
    >
      <TextInput
        {...textInputProps}
        style={[styles.field, { color: palette.text }, style]}
        placeholderTextColor={
          textInputProps.placeholderTextColor ?? palette.icon
        }
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={onChangeText}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: 10,
    marginBottom: 12,
  },
  field: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
});
