import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, fontFamilySubtitle, tintColorLight } from "@/constants/theme";
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
import SwitchSelector from "react-native-switch-selector";

import { setAppLanguage, type AppLanguage } from "@/i18next/i18next";

const GITHUB_REPO_URL = "https://github.com/DelijaAnte/ZavrsniRad";

export default function ProfileScreen() {
  const { session, initialized, signOut, deleteAccount } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const { t, i18n } = useTranslation();
  const isLight = colorScheme === "light";
  const theme = Colors[colorScheme];
  const tint = theme.tint;
  const currentLanguage: AppLanguage = i18n.language === "hr" ? "hr" : "en";
  const languageIndex = currentLanguage === "hr" ? 1 : 0;
  const languageOptions = [
    { label: t("language.en"), value: "en" as const },
    { label: t("language.hr"), value: "hr" as const },
  ];
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
      contentContainerStyle={styles.scrollContent}
      contentPaddingBottom={insets.bottom}
    >
      <View style={styles.pageColumn}>
        <ThemedView style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <ThemedText type="tabScreenHeader">{t("profile.title")}</ThemedText>
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
                <ThemedText style={styles.languageLabel}>
                  {t("profile.language")}
                </ThemedText>
                <SwitchSelector
                  initial={languageIndex}
                  value={languageIndex}
                  onPress={(value: string) => {
                    const lang = value as AppLanguage;
                    if (lang === currentLanguage) return;
                    void setAppLanguage(lang);
                  }}
                  options={languageOptions}
                  fontSize={15}
                  hasPadding
                  valuePadding={3}
                  height={40}
                  borderRadius={14}
                  borderWidth={1}
                  animationDuration={180}
                  backgroundColor={theme.surfaceMuted}
                  borderColor={theme.borderChip}
                  buttonColor={theme.tintMuted}
                  textColor={isLight ? "#0c2f35" : theme.text}
                  selectedColor={isLight ? tintColorLight : theme.tint}
                  textStyle={{ fontFamily: fontFamilySubtitle }}
                  selectedTextStyle={{ fontFamily: fontFamilySubtitle }}
                  style={styles.languageSwitch}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: theme.surfaceCard,
                    borderColor: theme.borderCard,
                  },
                ]}
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
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: theme.surfaceCard,
                    borderColor: theme.borderCard,
                  },
                ]}
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
    borderWidth: 1,
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
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamilySubtitle,
  },
  languageSwitch: {
    alignSelf: "stretch",
  },
});
