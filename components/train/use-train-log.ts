import { useCallback, useState } from "react";

import type { ExerciseLog, SetEntry } from "@/components/train/types";

export function useTrainLog() {
  const [log, setLog] = useState<ExerciseLog>({});

  const reset = useCallback(() => setLog({}), []);

  const ensureExercise = useCallback((exercise: string) => {
    setLog((prev) => {
      if (prev[exercise]?.length) return prev;
      return { ...prev, [exercise]: [{ weight: "", reps: "", rpe: "" }] };
    });
  }, []);

  const addSet = useCallback((exercise: string) => {
    setLog((prev) => ({
      ...prev,
      [exercise]: [
        ...(prev[exercise] ?? [{ weight: "", reps: "", rpe: "" }]),
        { weight: "", reps: "", rpe: "" },
      ],
    }));
  }, []);

  const removeSet = useCallback((exercise: string, index: number) => {
    setLog((prev) => {
      const next = (prev[exercise] ?? []).filter((_, i) => i !== index);
      if (!next.length) {
        const { [exercise]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [exercise]: next };
    });
  }, []);

  const updateSet = useCallback(
    (exercise: string, index: number, patch: Partial<SetEntry>) => {
      setLog((prev) => {
        const sets = prev[exercise] ?? [{ weight: "", reps: "", rpe: "" }];
        const next = sets.map((s, i) => (i === index ? { ...s, ...patch } : s));
        return { ...prev, [exercise]: next };
      });
    },
    [],
  );

  return { log, reset, ensureExercise, addSet, removeSet, updateSet };
}
