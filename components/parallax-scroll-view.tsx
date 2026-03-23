import type { PropsWithChildren, ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

const HEADER_HEIGHT = 250;
const CONTENT_PADDING = 32;

type Props = PropsWithChildren<{
  headerImage?: ReactElement | null;
  headerBackgroundColor: { dark: string; light: string };
  /** Merged into ScrollView `contentContainerStyle` (e.g. `{ flexGrow: 1 }` to fill the viewport). */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Override inner content `paddingBottom` (default `32 + safe area`).
   * Tab screens often need less space above the tab bar.
   */
  contentPaddingBottom?: number;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  contentContainerStyle,
  contentPaddingBottom,
}: Props) {
  const backgroundColor = useThemeColor({}, "background");
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      contentContainerStyle={contentContainerStyle}
      scrollEventThrottle={16}
    >
      {headerImage ? (
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>
      ) : null}
      <ThemedView
        style={[
          styles.content,
          {
            paddingTop: CONTENT_PADDING + insets.top,
            paddingBottom:
              contentPaddingBottom ?? CONTENT_PADDING + insets.bottom,
          },
        ]}
      >
        {children}
      </ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingHorizontal: CONTENT_PADDING,
    gap: 16,
    overflow: "hidden",
  },
});
