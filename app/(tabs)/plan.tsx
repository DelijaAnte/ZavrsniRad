import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { RoutineCard } from "@/components/routines/routine-card";
import { RoutineModal } from "@/components/routines/routine-modal";
import type { Routine } from "@/components/routines/types";
import { useRoutines } from "@/components/routines/routines-store";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PlanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const { routines, addRoutine, updateRoutine, deleteRoutine, loading, saving, error } =
    useRoutines();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const tint = Colors[colorScheme].tint;

  function openCreateModal() {
    if (loading) return;
    setRoutineToEdit(null);
    setModalMode("create");
    setModalVisible(true);
  }

  function openEditModal(routine: Routine) {
    if (loading) return;
    setRoutineToEdit(routine);
    setModalMode("edit");
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setRoutineToEdit(null);
  }

  function confirmDelete(routine: Routine) {
    Alert.alert(
      "Delete routine",
      `Remove "${routine.name}"? Workout history for this routine will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRoutine(routine.id);
            setExpandedId((id) => (id === routine.id ? null : id));
          },
        },
      ],
    );
  }

  function handleSaveRoutine(routine: Routine) {
    if (modalMode === "edit") {
      updateRoutine(routine);
    } else {
      addRoutine(routine);
    }
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
          style={[styles.fabInline, loading && styles.fabDisabled]}
          onPress={openCreateModal}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.fabInlineText}>+</Text>
        </TouchableOpacity>
      </ThemedView>

      {error ? (
        <ThemedView style={styles.banner}>
          <ThemedText type="defaultSemiBold">Could not sync data</ThemedText>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {loading ? (
        <ThemedView style={styles.loadingRow}>
          <ActivityIndicator />
          <ThemedText>Loading your program…</ThemedText>
        </ThemedView>
      ) : null}

      {saving ? (
        <ThemedView style={styles.savingRow}>
          <ThemedText type="defaultSemiBold">Saving…</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView style={styles.section}>
        {routines.length ? (
          <FlatList
            data={routines}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <RoutineCard
                routine={item}
                expanded={expandedId === item.id}
                onToggleExpand={() =>
                  setExpandedId((id) => (id === item.id ? null : item.id))
                }
                onEdit={openEditModal}
                onDelete={confirmDelete}
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
        onClose={closeModal}
        mode={modalMode}
        initialRoutine={routineToEdit}
        onSave={handleSaveRoutine}
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
  fabDisabled: {
    opacity: 0.45,
  },
  banner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8c4c4",
    backgroundColor: "#fff5f5",
    gap: 4,
    marginBottom: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  savingRow: {
    paddingVertical: 4,
  },
});
