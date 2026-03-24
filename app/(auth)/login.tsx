import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthModeSwitch } from "@/components/auth/auth-mode-switch";
import { LoginForm } from "@/components/auth/login-form";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { signIn, signUp, initError, clearInitError } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setMessage(null);
    clearInitError();
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setMessage("Enter email and password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signIn") {
        const { error } = await signIn(trimmed, password);
        if (error) {
          setMessage(error.message);
          return;
        }
        router.replace("/(tabs)/plan");
        return;
      }
      const { error, session } = await signUp(trimmed, password);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (session) {
        router.replace("/(tabs)/plan");
        return;
      }
      setMessage("Check your email to confirm your account, then sign in.");
      setMode("signIn");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <View style={styles.layout}>
          {initError ? (
            <View style={[styles.initBanner, { borderColor: palette.icon }]}>
              <ThemedText type="defaultSemiBold" style={styles.initBannerTitle}>
                Could not restore session
              </ThemedText>
              <Text style={[styles.initBannerBody, { color: palette.text }]}>
                {initError}
              </Text>
            </View>
          ) : null}
          <LoginForm
            style={{ paddingTop: insets.top }}
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            message={message}
            mode={mode}
            loading={loading}
            onSubmit={onSubmit}
            palette={palette}
            colorScheme={colorScheme}
          />

          <View
            style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
          >
            <AuthModeSwitch
              mode={mode}
              palette={palette}
              onToggleMode={() => {
                setMessage(null);
                setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  flex: {
    flex: 1,
  },
  layout: {
    flex: 1,
    justifyContent: "space-between",
  },
  bottomArea: {
    alignSelf: "stretch",
    width: "100%",
  },
  initBanner: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  initBannerTitle: {
    fontSize: 15,
  },
  initBannerBody: {
    fontSize: 14,
    opacity: 0.9,
  },
});
