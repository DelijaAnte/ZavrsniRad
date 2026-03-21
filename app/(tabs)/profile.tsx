import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthContext } from "@/context/auth-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const GITHUB_REPO_URL = "https://github.com/DelijaAnte/ZavrsniRad";

function displayNameFromUser(user: {
  user_metadata?: Record<string, unknown>;
}): string | null {
  const meta = user.user_metadata;
  if (!meta) return null;
  const full = meta.full_name;
  const name = meta.name;
  if (typeof full === "string" && full.trim()) return full.trim();
  if (typeof name === "string" && name.trim()) return name.trim();
  return null;
}

export default function ProfileScreen() {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error("Profile must be used within AuthProvider");
  }
  const { session, initialized, signOut, deleteAccount } = auth;
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;
  const [deletingAccount, setDeletingAccount] = useState(false);

  const user = session?.user;
  const email = user?.email ?? null;
  const displayName = user ? displayNameFromUser(user) : null;

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

  function openGitHub() {
    void Linking.openURL(GITHUB_REPO_URL);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.parallaxHeader,
        dark: Colors.dark.parallaxHeader,
      }}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      {!initialized ? (
        <ThemedView style={styles.loadingRow}>
          <ActivityIndicator color={tint} />
          <ThemedText>Loading…</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView
          style={[styles.card, { borderColor: Colors[colorScheme].tintBorder }]}
        >
          {displayName ? (
            <>
              <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
              {email ? (
                <ThemedText style={styles.secondary}>{email}</ThemedText>
              ) : null}
            </>
          ) : email ? (
            <ThemedText type="defaultSemiBold">{email}</ThemedText>
          ) : (
            <ThemedText>No account details</ThemedText>
          )}
        </ThemedView>
      )}

      <ThemedView style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open project on GitHub"
          style={[styles.linkButton, { borderColor: tint }]}
          onPress={openGitHub}
          activeOpacity={0.85}
        >
          <Text style={[styles.linkButtonText, { color: tint }]}>Source on GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={[styles.signOut, { borderColor: tint }]}
          onPress={() => void signOut()}
          activeOpacity={0.85}
          disabled={deletingAccount}
        >
          <Text style={[styles.signOutText, { color: tint }]}>Sign out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          style={styles.deleteAccount}
          onPress={confirmDeleteAccount}
          activeOpacity={0.85}
          disabled={deletingAccount || !initialized}
        >
          {deletingAccount ? (
            <ActivityIndicator color="#c0392b" />
          ) : (
            <Text style={styles.deleteAccountText}>Delete account</Text>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
    marginBottom: 16,
  },
  secondary: {
    opacity: 0.75,
  },
  actions: {
    gap: 12,
    alignItems: "flex-start",
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  signOut: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
  },
  deleteAccount: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  deleteAccountText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#c0392b",
  },
});
