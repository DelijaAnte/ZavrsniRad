import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthContext } from "@/context/auth-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useContext } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

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
  const { session, initialized, signOut } = auth;
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;

  const user = session?.user;
  const email = user?.email ?? null;
  const displayName = user ? displayNameFromUser(user) : null;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText>Signed-in account</ThemedText>
      </ThemedView>

      {!initialized ? (
        <ThemedView style={styles.loadingRow}>
          <ActivityIndicator />
          <ThemedText>Loading…</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.card}>
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

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={[styles.signOut, { borderColor: tint }]}
        onPress={() => void signOut()}
        activeOpacity={0.85}
      >
        <Text style={[styles.signOutText, { color: tint }]}>Sign out</Text>
      </TouchableOpacity>
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
  signOut: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
