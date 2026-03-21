import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { RoutineCard } from "@/components/routines/routine-card";
import { RoutineModal } from "@/components/routines/routine-modal";
import { useRoutines } from "@/components/routines/routines-store";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PlanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { routines, addRoutine } = useRoutines();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;

  function openCreateModal() {
    setModalVisible(true);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <ThemedText type="title">Routines</ThemedText>
          <ThemedText>Create or update your weekly plan.</ThemedText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={[styles.signOut, { borderColor: tint }]}
          onPress={() => void signOut()}
          activeOpacity={0.85}
        >
          <Text style={[styles.signOutText, { color: tint }]}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Create routine"
          style={styles.fabInline}
          onPress={openCreateModal}
          activeOpacity={0.85}
        >
          <Text style={styles.fabInlineText}>+</Text>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        {routines.length ? (
          <FlatList
            data={routines}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <RoutineCard
                routine={item}
                expanded={expandedId === item.id}
                onPress={() =>
                  setExpandedId((id) => (id === item.id ? null : item.id))
                }
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 8 }}
          />
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="defaultSemiBold">No routines yet</ThemedText>
            <ThemedText>
              Tap the + button to create your first routine.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <RoutineModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={addRoutine}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
  signOut: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "600",
  },
  fabInline: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#A1CEDC",
    alignItems: "center",
    justifyContent: "center",
  },
  fabInlineText: {
    fontSize: 30,
    lineHeight: 32,
    color: "#0c2f35",
  },
  section: {
    gap: 8,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },
});
