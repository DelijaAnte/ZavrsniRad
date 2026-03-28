import { TabActions } from "@react-navigation/native";
import { TabContext, type ExpoTabsNavigatorScreenOptions } from "expo-router/ui";
import { useNavigatorContext } from "@/lib/expo-router-navigator-context";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { type NativeSyntheticEvent, Platform, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";

type PagerSelectedEvent = Readonly<{ position: number }>;

/**
 * Headless expo-router/ui tab content area with horizontal swipe between tabs.
 * Must be rendered inside `<Tabs>` from `expo-router/ui`.
 */
export function SwipeableTabSlot() {
  const { state, descriptors, navigation } = useNavigatorContext();
  const pagerRef = useRef<PagerView>(null);
  const didMountPagerSync = useRef(false);

  const onPageSelected = useCallback(
    (e: NativeSyntheticEvent<PagerSelectedEvent>) => {
      const pos = Math.round(e.nativeEvent.position);
      if (pos === state.index) return;
      const route = state.routes[pos];
      const name = route?.name;
      if (name) {
        // Same action as tab bar taps (`TabTrigger`). `router.replace` can lag behind
        // navigator state, so `isFocused` on the bar would stay wrong after swiping.
        navigation.dispatch(TabActions.jumpTo(name));
      }
    },
    [navigation, state.index, state.routes],
  );

  useEffect(() => {
    if (!didMountPagerSync.current) {
      didMountPagerSync.current = true;
      return;
    }
    pagerRef.current?.setPage(state.index);
  }, [state.index]);

  if (state.routes.length === 0) {
    return null;
  }

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pager}
      initialPage={state.index}
      onPageSelected={onPageSelected}
      offscreenPageLimit={Math.max(1, state.routes.length - 1)}
      {...(Platform.OS === "android" ? { overScrollMode: "never" as const } : {})}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const isFocused = state.index === index;
        const { unmountOnBlur } = descriptor.options as ExpoTabsNavigatorScreenOptions;

        // Preload every tab up front so the first horizontal swipe is smooth (ignore default lazy tabs).
        const body: ReactNode =
          unmountOnBlur && !isFocused ? null : descriptor.render();

        return (
          <TabContext.Provider key={descriptor.route.key} value={descriptor.options}>
            <View style={styles.page} collapsable={false}>
              {body}
            </View>
          </TabContext.Provider>
        );
      })}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
