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

const GITHUB_REPO_URL = "https://github.com/DelijaAnte/ZavrsniRad";

export default function ProfileScreen() {
  const { session, initialized, signOut, deleteAccount } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const isLight = colorScheme === "light";
  const tint = Colors[colorScheme].tint;
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
      "Delete account",
      "This permanently removes your account and training data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setDeletingAccount(true);
              const { error } = await deleteAccount();
              if (!mountedRef.current) return;
              setDeletingAccount(false);
              if (error) {
                Alert.alert("Could not delete account", error.message);
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
        Alert.alert("Cannot open link", "This device cannot open the project URL.");
        return;
      }
      await Linking.openURL(GITHUB_REPO_URL);
    } catch {
      Alert.alert("Cannot open link", "Something went wrong opening the browser.");
    }
  }

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Could not sign out", error.message);
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
            <ThemedText type="title">Profile</ThemedText>
          </View>
        </ThemedView>

        {!initialized ? (
          <View style={styles.loadingFill}>
            <ActivityIndicator color={tint} />
            <ThemedText>Loading…</ThemedText>
          </View>
        ) : (
          <View
            style={[
              styles.mainFill,
              { minHeight: Math.max(360, windowHeight * 0.52) },
            ]}
          >
            <View style={styles.topBlock}>
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
                  <Text style={[styles.infoLabel, { color: palette.label }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: palette.primaryText }]}>
                    {email ?? "Not signed in"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.infoCard, { backgroundColor: palette.cardBg }]}
                accessibilityRole="button"
                accessibilityLabel="View source code on GitHub"
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
                    Source Code
                  </Text>
                  <Text style={[styles.infoValue, { color: palette.primaryText }]}>
                    View on GitHub
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: palette.divider }]} />
            </View>

            <View style={styles.bottomBlock}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Sign out"
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
                  Sign Out
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Delete account"
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
                      Delete Account
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
});
