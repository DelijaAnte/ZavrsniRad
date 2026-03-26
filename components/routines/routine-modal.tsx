import React, { useEffect, useMemo, useReducer, useRef } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import type { Day, Routine } from "@/components/routines/types";
import { DAYS } from "@/components/routines/types";
import { Colors, tintColorLight } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type RoutineModalDraft = {
  name: string;
  selectedDays: Day[];
  activeDay: Day | null;
  exerciseText: string;
  exercisesByDay: Record<Day, string[]>;
};

function emptyDraft(): RoutineModalDraft {
  return {
    name: "",
    selectedDays: [],
    activeDay: null,
    exerciseText: "",
    exercisesByDay: {} as Record<Day, string[]>,
  };
}

type RoutineModalAction =
  | { type: "replace"; draft: RoutineModalDraft }
  | { type: "setName"; name: string }
  | { type: "setExerciseText"; text: string }
  | { type: "setActiveDay"; day: Day }
  | { type: "toggleDay"; day: Day }
  | { type: "addExercise" }
  | { type: "removeExercise"; day: Day; index: number };

function routineModalReducer(
  state: RoutineModalDraft,
  action: RoutineModalAction
): RoutineModalDraft {
  switch (action.type) {
    case "replace":
      return action.draft;
    case "setName":
      return { ...state, name: action.name };
    case "setExerciseText":
      return { ...state, exerciseText: action.text };
    case "setActiveDay":
      return { ...state, activeDay: action.day };
    case "toggleDay": {
      const { day } = action;
      const existed = state.selectedDays.includes(day);
      const selectedDays = existed
        ? state.selectedDays.filter((d) => d !== day)
        : [...state.selectedDays, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
      const exercisesByDay = { ...state.exercisesByDay };
      if (existed) {
        delete exercisesByDay[day];
      } else {
        exercisesByDay[day] = exercisesByDay[day] ?? [];
      }
      let activeDay = state.activeDay;
      if (!existed) {
        activeDay = activeDay ?? day;
      } else if (activeDay === day) {
        activeDay = selectedDays[0] ?? null;
      }
      return { ...state, selectedDays, exercisesByDay, activeDay };
    }
    case "addExercise": {
      const txt = state.exerciseText.trim();
      if (!txt || !state.activeDay) return state;
      return {
        ...state,
        exerciseText: "",
        exercisesByDay: {
          ...state.exercisesByDay,
          [state.activeDay]: [...(state.exercisesByDay[state.activeDay] ?? []), txt],
        },
      };
    }
    case "removeExercise":
      return {
        ...state,
        exercisesByDay: {
          ...state.exercisesByDay,
          [action.day]: (state.exercisesByDay[action.day] ?? []).filter(
            (_, i) => i !== action.index
          ),
        },
      };
    default:
      return state;
  }
}

export function RoutineModal({
  visible,
  onClose,
  mode,
  initialRoutine,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialRoutine: Routine | null;
  onSave: (routine: Routine) => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const surface = isDark ? "#1e2224" : "#fff";
  const surfaceInset = isDark ? "#151718" : "#fff";
  const border = isDark ? "#2f3638" : "#ddd";
  const borderMuted = isDark ? "#2f3638" : "#eee";
  const selectedChipStyle = useMemo(
    () => ({
      backgroundColor: palette.tintMuted,
      borderColor: palette.tintBorder,
    }),
    [palette.tintBorder, palette.tintMuted]
  );
  const activeChipLabelColor = isDark ? palette.tint : tintColorLight;

  const [draft, dispatch] = useReducer(routineModalReducer, undefined, emptyDraft);

  const { name, selectedDays, activeDay, exerciseText, exercisesByDay } = draft;

  const formatDay = (day: Day) => t(`days.short.${day}`);
  const activeDayLabel = activeDay ? formatDay(activeDay) : "";

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && selectedDays.length > 0;
  }, [name, selectedDays.length]);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  /** Sheet size: capped width so it is not edge-to-edge on large screens; height leaves visible backdrop. */
  const { modalSheetHeight, modalCardMaxWidth } = useMemo(() => {
    const overlayPadding = 20;
    const overlayPadTotal = overlayPadding * 2;
    const innerW = Math.max(0, windowWidth - overlayPadTotal);
    const innerH = Math.max(0, windowHeight - overlayPadTotal);
    const maxWidth = Math.min(520, Math.max(280, innerW));
    const height = Math.min(
      620,
      Math.max(280, Math.round(innerH * 0.78))
    );
    return { modalSheetHeight: height, modalCardMaxWidth: maxWidth };
  }, [windowWidth, windowHeight]);

  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      wasVisibleRef.current = false;
      return;
    }
    const justOpened = !wasVisibleRef.current;
    wasVisibleRef.current = true;
    if (!justOpened) return;

    if (mode === "edit" && initialRoutine) {
      const days = initialRoutine.days.slice();
      const nextExercises = {} as Record<Day, string[]>;
      for (const d of DAYS) {
        nextExercises[d] = (initialRoutine.exercisesByDay[d] ?? []).slice();
      }
      dispatch({
        type: "replace",
        draft: {
          name: initialRoutine.name,
          selectedDays: days,
          activeDay: days[0] ?? null,
          exerciseText: "",
          exercisesByDay: nextExercises,
        },
      });
      return;
    }
    dispatch({ type: "replace", draft: emptyDraft() });
  }, [visible, mode, initialRoutine]);

  function resetDraft() {
    dispatch({ type: "replace", draft: emptyDraft() });
  }

  function close() {
    onClose();
  }

  function addExercisePress() {
    const txt = exerciseText.trim();
    if (!txt || !activeDay) return;
    const list = exercisesByDay[activeDay] ?? [];
    if (list.some((ex) => ex.trim().toLowerCase() === txt.toLowerCase())) {
      Alert.alert(
        t("routineModal.duplicateExerciseTitle"),
        t("routineModal.duplicateExerciseMessage")
      );
      return;
    }
    dispatch({ type: "addExercise" });
  }

  function submitRoutine() {
    const trimmed = name.trim();
    if (!trimmed || selectedDays.length === 0) return;

    const normalized = {} as Record<Day, string[]>;
    for (const d of selectedDays) normalized[d] = (exercisesByDay[d] ?? []).slice();

    const id =
      mode === "edit" && initialRoutine ? initialRoutine.id : Date.now().toString();

    onSave({
      id,
      name: trimmed,
      days: selectedDays.slice(),
      exercisesByDay: normalized,
    });

    resetDraft();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}
    >
      {/*
        Backdrop must NOT wrap the sheet: a parent Pressable breaks ScrollView pan gestures.
        Dismiss by tapping the dimmed area only (sibling Pressable behind the card).
      */}
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={close}
          accessibilityLabel={t("routineModal.dismiss")}
          accessibilityRole="button"
        />
        <View
          style={[
            styles.modalCard,
            {
              height: modalSheetHeight,
              maxWidth: modalCardMaxWidth,
              backgroundColor: surface,
            },
          ]}
          collapsable={false}
        >
          <KeyboardAwareScrollView
            ScrollViewComponent={ScrollView}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator
            nestedScrollEnabled
            scrollEventThrottle={16}
            bounces
            bottomOffset={24}
            extraKeyboardSpace={20}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              {mode === "edit" ? t("routineModal.editRoutineTitle") : t("routineModal.newRoutineTitle")}
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <ThemedText type="defaultSemiBold">{t("routineModal.nameLabel")}</ThemedText>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("routineModal.closeAccessibilityLabel")}
                onPress={close}
                style={[
                  styles.iconButton,
                  { borderColor: borderMuted, backgroundColor: surfaceInset },
                ]}
              >
                <Text style={[styles.iconButtonText, { color: palette.text }]}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={t("routineModal.routineNamePlaceholder")}
              placeholderTextColor={palette.icon}
              value={name}
              onChangeText={(v) => dispatch({ type: "setName", name: v })}
              style={[
                styles.input,
                {
                  borderColor: border,
                  backgroundColor: surfaceInset,
                  color: palette.text,
                },
              ]}
              accessibilityLabel={t("routineModal.routineNameAccessibilityLabel")}
              returnKeyType="done"
            />

            <ThemedText type="defaultSemiBold">{t("routineModal.daysLabel")}</ThemedText>
            <View style={styles.chipsRow}>
              {DAYS.map((d) => {
                const active = selectedDays.includes(d);
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => dispatch({ type: "toggleDay", day: d })}
                    style={[
                      styles.chip,
                      { borderColor: border, backgroundColor: surfaceInset },
                      active && selectedChipStyle,
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? activeChipLabelColor : palette.text },
                      ]}
                    >
                    {formatDay(d)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText type="defaultSemiBold">{t("routineModal.exercisesByDayLabel")}</ThemedText>
            {selectedDays.length ? (
              <>
                <ThemedText style={{ marginTop: 6 }}>
                  {t("routineModal.pickDayInstruction")}
                </ThemedText>
                <View style={[styles.chipsRow, { marginTop: 10 }]}>
                  {selectedDays.map((d) => {
                    const isActive = activeDay === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => dispatch({ type: "setActiveDay", day: d })}
                        style={[
                          styles.chip,
                          { borderColor: border, backgroundColor: surfaceInset },
                          isActive && selectedChipStyle,
                        ]}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isActive
                                ? activeChipLabelColor
                                : palette.text,
                            },
                          ]}
                        >
                          {formatDay(d)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeDay ? (
                  <>
                    {(exercisesByDay[activeDay] ?? []).length ? (
                      <View style={{ gap: 8, marginTop: 8 }}>
                        {(exercisesByDay[activeDay] ?? []).map((ex, idx) => (
                          <View
                            key={`${activeDay}-${idx}-${ex}`}
                            style={[
                              styles.exerciseItem,
                              {
                                borderColor: borderMuted,
                                backgroundColor: surfaceInset,
                              },
                            ]}
                          >
                            <Text
                              style={[styles.exerciseIndex, { color: palette.text }]}
                            >
                              {idx + 1}
                            </Text>
                            <Text
                              style={[styles.exerciseName, { color: palette.text }]}
                              numberOfLines={2}
                            >
                              {ex}
                            </Text>
                            <TouchableOpacity
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${ex}`}
                              onPress={() =>
                                dispatch({
                                  type: "removeExercise",
                                  day: activeDay,
                                  index: idx,
                                })
                              }
                              style={[
                                styles.removeButton,
                                {
                                  borderColor: borderMuted,
                                  backgroundColor: surface,
                                },
                              ]}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.removeButtonText}>
                                Remove
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <ThemedText style={{ marginTop: 8 }}>
                        {t("routineModal.noExercisesForActiveDayYet", {
                          activeDay: activeDayLabel,
                        })}
                      </ThemedText>
                    )}
                  </>
                ) : (
                  <ThemedText style={{ marginTop: 8 }}>
                    {t("routineModal.selectDayToAddExercises")}
                  </ThemedText>
                )}
              </>
            ) : (
              <ThemedText style={{ marginTop: 8 }}>
                {t("routineModal.selectAtLeastOneDayFirst")}
              </ThemedText>
            )}

            <View style={styles.addExerciseRow}>
              <TextInput
                placeholder={
                  activeDay
                  ? t("routineModal.addExercisePlaceholderForDay", {
                      activeDay: activeDayLabel,
                    })
                  : t("routineModal.selectDayAbovePlaceholder")
                }
                placeholderTextColor={palette.icon}
                value={exerciseText}
                onChangeText={(v) => dispatch({ type: "setExerciseText", text: v })}
                style={[
                  styles.input,
                  styles.exerciseInput,
                  {
                    borderColor: border,
                    backgroundColor: surfaceInset,
                    color: palette.text,
                  },
                ]}
                returnKeyType="done"
                onSubmitEditing={addExercisePress}
                editable={!!activeDay}
              />
              <TouchableOpacity
                onPress={addExercisePress}
                style={[
                  styles.addButton,
                  { backgroundColor: tintColorLight },
                  !activeDay && { opacity: 0.5 },
                ]}
                activeOpacity={0.85}
                disabled={!activeDay}
              >
              <Text style={styles.addButtonText}>{t("routineModal.addButton")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {
                    borderColor: borderMuted,
                    backgroundColor: surfaceInset,
                  },
                ]}
                onPress={close}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.secondaryButtonText, { color: palette.text }]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: tintColorLight },
                  !canSubmit && styles.primaryButtonDisabled,
                ]}
                onPress={submitRoutine}
                disabled={!canSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {mode === "edit"
                    ? t("routineModal.saveChangesButton")
                    : t("routineModal.createButton")}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "100%",
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
    zIndex: 1,
    elevation: 8,
  },
  modalScroll: {
    flex: 1,
    width: "100%",
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    fontSize: 22,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "600",
  },
  addExerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 8,
  },
  exerciseInput: {
    flex: 1,
    marginVertical: 0,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  exerciseIndex: {
    width: 22,
    textAlign: "center",
    fontWeight: "700",
  },
  exerciseName: {
    flex: 1,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButtonText: {
    color: "#7a2b2b",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    fontWeight: "800",
    color: "white",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
});
