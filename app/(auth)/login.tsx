import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setMessage(null);
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
          <View style={[styles.centerBlock, { paddingTop: insets.top }]}>
            <ThemedText
              type="title"
              style={styles.title}
              includeFontPadding={Platform.OS === "android" ? false : undefined}
            >
              GymBuddy
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                },
              ]}
              placeholder="Email"
              placeholderTextColor={palette.icon}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7",
                },
              ]}
              placeholder="Password"
              placeholderTextColor={palette.icon}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {message ? (
              <ThemedText style={styles.message}>{message}</ThemedText>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: palette.tint, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colorScheme === "dark" ? "#111" : "#fff"} />
              ) : (
                <ThemedText
                  style={[
                    styles.primaryButtonText,
                    { color: colorScheme === "dark" ? "#111" : "#fff" },
                  ]}
                >
                  {mode === "signIn" ? "Sign in" : "Sign up"}
                </ThemedText>
              )}
            </Pressable>
          </View>

          <View
            style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
          >
            <Pressable
              onPress={() => {
                setMessage(null);
                setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
              }}
              style={styles.switchRow}
              android_ripple={{ color: "rgba(10, 126, 164, 0.12)" }}
            >
              <Text style={[styles.switchPlain, { color: palette.text }]}>
                {mode === "signIn"
                  ? [
                      "Need an account? ",
                      <Text
                        key="highlight-up"
                        style={[styles.switchHighlight, { color: palette.tint }]}
                      >
                        Sign up
                      </Text>,
                    ]
                  : [
                      "Already have an account? ",
                      <Text
                        key="highlight-in"
                        style={[styles.switchHighlight, { color: palette.tint }]}
                      >
                        Sign in
                      </Text>,
                    ]}
              </Text>
            </Pressable>
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
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "stretch",
    width: "100%",
  },
  bottomArea: {
    alignSelf: "stretch",
    width: "100%",
  },
  title: {
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 36,
    paddingBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  message: {
    marginBottom: 12,
    opacity: 0.9,
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchRow: {
    alignItems: "center",
    alignSelf: "stretch",
    paddingVertical: 12,
  },
  switchPlain: {
    width: "100%",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  switchHighlight: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
});
