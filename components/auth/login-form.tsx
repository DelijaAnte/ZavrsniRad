import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";

import { GlowingTextInput } from "@/components/auth/glowing-text-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

type AuthPalette = (typeof Colors)["light"];

type AuthMode = "signIn" | "signUp";

type LoginFormProps = {
  style?: StyleProp<ViewStyle>;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  message: string | null;
  mode: AuthMode;
  loading: boolean;
  onSubmit: () => void | Promise<void>;
  palette: AuthPalette;
  colorScheme: "light" | "dark";
};

export function LoginForm({
  style,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  message,
  mode,
  loading,
  onSubmit,
  palette,
  colorScheme,
}: LoginFormProps) {
  const { t } = useTranslation();
  const inputSurface = colorScheme === "dark" ? "#1c1c1e" : "#f2f2f7";

  return (
    <View style={[styles.centerBlock, style]}>
      <ThemedText
        type="title"
        style={styles.title}
        includeFontPadding={Platform.OS === "android" ? false : undefined}
      >
        GymBuddy
      </ThemedText>

      <GlowingTextInput
        palette={palette}
        colorScheme={colorScheme}
        inputSurface={inputSurface}
        placeholder={t("auth.emailPlaceholder")}
        placeholderTextColor={palette.icon}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={onEmailChange}
      />
      <GlowingTextInput
        palette={palette}
        colorScheme={colorScheme}
        inputSurface={inputSurface}
        placeholder={t("auth.passwordPlaceholder")}
        placeholderTextColor={palette.icon}
        secureTextEntry
        value={password}
        onChangeText={onPasswordChange}
      />

      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}

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
            {mode === "signIn" ? t("auth.signIn") : t("auth.signUp")}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "stretch",
    width: "100%",
  },
  title: {
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 36,
    paddingBottom: 4,
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
});
