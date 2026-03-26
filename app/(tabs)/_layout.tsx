import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const scheme = colorScheme ?? "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[scheme].tint,
        tabBarInactiveTintColor: Colors[scheme].tabIconDefault,
        tabBarStyle: { backgroundColor: Colors[scheme].tabBarBackground },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // Keep `app/(tabs)/index.tsx` for default routing, but hide it from the tab bar.
          href: null,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: t("tabs.plan"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: t("tabs.train"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="dumbbell.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: t("tabs.analyze"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
