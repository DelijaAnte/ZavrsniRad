import * as Haptics from "expo-haptics";
import { Tabs, TabList, TabTrigger, type TabTriggerSlotProps } from "expo-router/ui";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SwipeableTabSlot } from "@/components/swipeable-tab-slot";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";

type TabIconName = "calendar" | "dumbbell.fill" | "chart.bar.fill" | "person.circle.fill";

const TAB_CONFIG: readonly { name: string; href: "/(tabs)/plan" | "/(tabs)/train" | "/(tabs)/analyze" | "/(tabs)/profile"; labelKey: string; icon: TabIconName }[] = [
  { name: "plan", href: "/(tabs)/plan", labelKey: "tabs.plan", icon: "calendar" },
  { name: "train", href: "/(tabs)/train", labelKey: "tabs.train", icon: "dumbbell.fill" },
  { name: "analyze", href: "/(tabs)/analyze", labelKey: "tabs.analyze", icon: "chart.bar.fill" },
  { name: "profile", href: "/(tabs)/profile", labelKey: "tabs.profile", icon: "person.circle.fill" },
];

type TabBarButtonProps = TabTriggerSlotProps & {
  icon: TabIconName;
  label: string;
  scheme: "light" | "dark";
};

const TabBarButton = forwardRef<View, TabBarButtonProps>(function TabBarButton(
  { icon, label, scheme, isFocused, style: _tabTriggerStyle, onPressIn, ...pressableProps },
  ref,
) {
  const palette = Colors[scheme];
  const color = isFocused ? palette.tint : palette.tabIconDefault;

  return (
    <Pressable
      ref={ref}
      {...pressableProps}
      style={styles.tabPressable}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    >
      <View style={styles.tabItemInner}>
        <IconSymbol size={28} name={icon} color={color} />
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  const scheme = colorScheme ?? "light";
  const palette = Colors[scheme];

  return (
    <Tabs options={{ initialRouteName: "plan" }}>
      <View style={styles.slotArea}>
        <SwipeableTabSlot />
      </View>
      <TabList
        pointerEvents={keyboardVisible ? "none" : "auto"}
        style={[
          styles.tabList,
          {
            backgroundColor: palette.tabBarBackground,
            paddingBottom: Math.max(insets.bottom, 8),
            borderTopColor: palette.borderSubtle,
          },
          keyboardVisible && styles.tabListHidden,
        ]}
      >
        {TAB_CONFIG.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
            <TabBarButton icon={tab.icon} label={t(tab.labelKey)} scheme={scheme} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slotArea: {
    flex: 1,
  },
  tabList: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  /** Same idea as React Navigation `tabBarHideOnKeyboard` for the custom `TabList`. */
  tabListHidden: {
    height: 0,
    minHeight: 0,
    maxHeight: 0,
    overflow: "hidden",
    opacity: 0,
    borderTopWidth: 0,
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
  },
  tabPressable: {
    flex: 1,
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});
