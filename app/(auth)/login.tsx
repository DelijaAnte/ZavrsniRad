import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
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
    <ThemedView style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ThemedText type="title" style={styles.title}>
          GymBuddy
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {mode === "signIn" ? "Sign in to continue" : "Create an account"}
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

        <Pressable
          onPress={() => {
            setMessage(null);
            setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
          }}
          style={styles.switchRow}
        >
          <ThemedText style={{ color: palette.tint }}>
            {mode === "signIn"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </ThemedText>
        </Pressable>
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
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 28,
    opacity: 0.85,
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
    marginTop: 20,
    alignItems: "center",
  },
});
