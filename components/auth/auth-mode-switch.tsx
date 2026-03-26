import { Pressable, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/theme";

type AuthPalette = (typeof Colors)["light"];

type AuthMode = "signIn" | "signUp";

type AuthModeSwitchProps = {
  mode: AuthMode;
  palette: AuthPalette;
  onToggleMode: () => void;
};

export function AuthModeSwitch({ mode, palette, onToggleMode }: AuthModeSwitchProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onToggleMode}
      style={styles.switchRow}
      android_ripple={{ color: "rgba(10, 126, 164, 0.12)" }}
    >
      <Text style={[styles.switchPlain, { color: palette.text }]}>
        {mode === "signIn"
          ? [
              t("auth.needAccountPrefix"),
              <Text key="highlight-up" style={[styles.switchHighlight, { color: palette.tint }]}>
                {t("auth.signUp")}
              </Text>,
            ]
          : [
              t("auth.alreadyHaveAccountPrefix"),
              <Text key="highlight-in" style={[styles.switchHighlight, { color: palette.tint }]}>
                {t("auth.signIn")}
              </Text>,
            ]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
