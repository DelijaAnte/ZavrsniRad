import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, tintColorLight } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { setAppLanguage, type AppLanguage } from "@/i18next/i18next";

const GITHUB_REPO_URL = "https://github.com/DelijaAnte/ZavrsniRad";

export default function ProfileScreen() {
  const { session, initialized, signOut, deleteAccount } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const { t, i18n } = useTranslation();
  const isLight = colorScheme === "light";
  const tint = Colors[colorScheme].tint;
  const currentLanguage: AppLanguage = i18n.language === "hr" ? "hr" : "en";
  const [deletingAccount, setDeletingAccount] = useState(false);
  const mountedRef = useRef(true);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const user = session?.user;
  const email = user?.email ?? null;

  const palette = isLight
    ? {
        cardBg: "#f3f4f6",
        label: "#6b7280",
        primaryText: "#111827",
        divider: "#e5e7eb",
        signOutBorder: "#e5e7eb",
        deleteBorder: "#fecaca",
        deleteText: "#dc2626",
        githubCircle: "#0f172a",
        pageBg: Colors.light.background,
      }
    : {
        cardBg: Colors.dark.tintMuted,
        label: "#9ca3af",
        primaryText: Colors.dark.text,
        divider: "#374151",
        signOutBorder: "#4b5563",
        deleteBorder: "#7f1d1d",
        deleteText: "#f87171",
        githubCircle: "#020617",
        pageBg: Colors.dark.background,
      };

  function confirmDeleteAccount() {
    Alert.alert(
      t("profile.deleteAccountTitle"),
      t("profile.deleteAccountMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              setDeletingAccount(true);
              const { error } = await deleteAccount();
              if (!mountedRef.current) return;
              setDeletingAccount(false);
              if (error) {
                Alert.alert(t("common.error"), error.message);
              }
            })();
          },
        },
      ]
    );
  }

  async function openGitHub() {
    try {
      const supported = await Linking.canOpenURL(GITHUB_REPO_URL);
      if (!supported) {
        Alert.alert(
          t("common.cannotOpenLink"),
          t("profile.cannotOpenGitHubMessage")
        );
        return;
      }
      await Linking.openURL(GITHUB_REPO_URL);
    } catch {
      Alert.alert(
        t("common.cannotOpenLink"),
        t("profile.cannotOpenGitHubBrowserMessage")
      );
    }
  }

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      Alert.alert(t("common.couldNotSignOut"), error.message);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.parallaxHeader,
        dark: Colors.dark.parallaxHeader,
      }}
      contentContainerStyle={styles.scrollContent}
      contentPaddingBottom={insets.bottom}
    >
      <View style={styles.pageColumn}>
        <ThemedView style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <ThemedText type="title">{t("profile.title")}</ThemedText>
          </View>
        </ThemedView>

        {!initialized ? (
          <View style={styles.loadingFill}>
            <ActivityIndicator color={tint} />
            <ThemedText>{t("common.loading")}</ThemedText>
          </View>
        ) : (
          <View
            style={[
              styles.mainFill,
              { minHeight: Math.max(360, windowHeight * 0.52) },
            ]}
          >
            <View style={styles.topBlock}>
              <View style={styles.languageBlock}>
                <ThemedText type="defaultSemiBold" style={styles.languageLabel}>
                  {t("profile.language")}
                </ThemedText>
                <View style={styles.languageRow}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={t("language.en")}
                    onPress={() => void setAppLanguage("en")}
                    style={[
                      styles.languageButton,
                      { borderColor: palette.divider, backgroundColor: palette.cardBg },
                      currentLanguage === "en" && {
                        borderColor: tintColorLight,
                        backgroundColor: tintColorLight,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        currentLanguage === "en" && { color: "#fff" },
                      ]}
                    >
                      {t("language.en")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={t("language.hr")}
                    onPress={() => void setAppLanguage("hr")}
                    style={[
                      styles.languageButton,
                      { borderColor: palette.divider, backgroundColor: palette.cardBg },
                      currentLanguage === "hr" && {
                        borderColor: tintColorLight,
                        backgroundColor: tintColorLight,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        currentLanguage === "hr" && { color: "#fff" },
                      ]}
                    >
                      {t("language.hr")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.infoCard, { backgroundColor: palette.cardBg }]}
                activeOpacity={email ? 0.85 : 1}
                disabled={!email}
                accessibilityRole={email ? "button" : "text"}
                accessibilityLabel={email ? `Email ${email}` : "No email on file"}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isLight ? Colors.light.tintMuted : "#1e3a45" },
                  ]}
                >
                  <Ionicons name="mail-outline" size={22} color={tintColorLight} />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={[styles.infoLabel, { color: palette.label }]}>
                    {t("profile.emailLabel")}
                  </Text>
                  <Text style={[styles.infoValue, { color: palette.primaryText }]}>
                    {email ?? t("profile.notSignedIn")}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.infoCard, { backgroundColor: palette.cardBg }]}
                accessibilityRole="button"
                accessibilityLabel={t("profile.viewSourceCodeAccessibilityLabel")}
                onPress={() => void openGitHub()}
                activeOpacity={0.85}
              >
                <View
                  style={[styles.iconCircle, { backgroundColor: palette.githubCircle }]}
                >
                  <Ionicons name="logo-github" size={24} color="#fff" />
                </View>
                <View style={styles.infoTextBlock}>
                  <Text style={[styles.infoLabel, { color: palette.label }]}>
                    {t("profile.sourceCode")}
                  </Text>
                  <Text style={[styles.infoValue, { color: palette.primaryText }]}>
                    {t("profile.viewOnGitHub")}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: palette.divider }]} />
            </View>

            <View style={styles.bottomBlock}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("profile.signOut")}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: palette.pageBg,
                    borderColor: palette.signOutBorder,
                  },
                ]}
                onPress={() => void handleSignOut()}
                activeOpacity={0.85}
                disabled={deletingAccount}
              >
                <Ionicons name="log-out-outline" size={22} color={palette.primaryText} />
                <Text style={[styles.actionButtonTextBold, { color: palette.primaryText }]}>
                  {t("profile.signOut")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("profile.deleteAccount")}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: palette.pageBg,
                    borderColor: palette.deleteBorder,
                  },
                ]}
                onPress={confirmDeleteAccount}
                activeOpacity={0.85}
                disabled={deletingAccount || !initialized}
              >
                {deletingAccount ? (
                  <ActivityIndicator color={palette.deleteText} />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={22} color={palette.deleteText} />
                    <Text style={[styles.actionButtonTextBold, { color: palette.deleteText }]}>
                      {t("profile.deleteAccount")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  pageColumn: {
    flex: 1,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitles: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  loadingFill: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mainFill: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBlock: {
    gap: 12,
  },
  bottomBlock: {
    gap: 12,
    flexShrink: 0,
    paddingTop: 8,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextBlock: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: "stretch",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonTextBold: {
    fontSize: 16,
    fontWeight: "700",
  },
  languageBlock: {
    gap: 10,
  },
  languageLabel: {
    marginBottom: 2,
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0c2f35",
  },
});
