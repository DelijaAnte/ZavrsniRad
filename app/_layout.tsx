import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { I18nextProvider } from "react-i18next";

import i18n from "@/i18next/i18next";

import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RoutinesProvider } from "@/components/routines/routines-store";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const navigationReady = Boolean(rootNavigationState?.key);

  useEffect(() => {
    if (!initialized || !navigationReady) return;
    void SplashScreen.hideAsync().catch(() => {
      /* already hidden or native module unavailable */
    });
  }, [initialized, navigationReady]);

  /** Never leave users stuck on the splash if auth or navigation stalls. */
  useEffect(() => {
    const t = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => {});
    }, 12_000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!initialized || !navigationReady) return;
    const path = segments as unknown as string[];
    if (path.length === 0) return;

    const top = path[0];
    const inAuthGroup = top === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)/plan");
    }
  }, [session, initialized, segments, router, navigationReady]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <RoutinesProvider>
              <RootNavigator />
            </RoutinesProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </I18nextProvider>
  );
}
