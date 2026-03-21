import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Day, Routine, WorkoutSession } from "@/components/routines/types";
import type { ExerciseLog } from "@/components/train/types";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/utils/supabase";

type RoutinesContextValue = {
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
  loading: boolean;
  saving: boolean;
  error: string | null;
  workoutHistory: WorkoutSession[];
  saveWorkoutSession: (input: {
    routineId: string;
    day: Day;
    log: ExerciseLog;
  }) => Promise<{ error: string | null }>;
};

const RoutinesContext = createContext<RoutinesContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 600;

function isRoutineArray(value: unknown): value is Routine[] {
  return Array.isArray(value);
}

function isWorkoutSessionArray(value: unknown): value is WorkoutSession[] {
  return Array.isArray(value);
}

function logHasEntries(log: ExerciseLog): boolean {
  for (const sets of Object.values(log)) {
    for (const s of sets) {
      if (s.weight.trim() || s.reps.trim() || s.rpe.trim()) return true;
    }
  }
  return false;
}

function newSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function RoutinesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const skipNextPersistRef = useRef(true);

  const persist = useCallback(
    async (routinesPayload: Routine[], historyPayload: WorkoutSession[]) => {
      if (!userId) return { error: "Not signed in" as string | null };
      setSaving(true);
      const { error: upError } = await supabase.from("user_training_data").upsert(
        {
          user_id: userId,
          routines: routinesPayload,
          workout_history: historyPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      setSaving(false);
      if (upError) {
        const msg = upError.message;
        setError(msg);
        return { error: msg };
      }
      setError(null);
      return { error: null };
    },
    [userId]
  );

  useEffect(() => {
    skipNextPersistRef.current = true;

    if (!userId) {
      setRoutines([]);
      setWorkoutHistory([]);
      setLoading(false);
      setHydrated(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setRoutines([]);
    setWorkoutHistory([]);
    setHydrated(false);
    setLoading(true);
    setError(null);

    void (async () => {
      const { data, error: fetchError } = await supabase
        .from("user_training_data")
        .select("routines, workout_history")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setRoutines([]);
        setWorkoutHistory([]);
        setLoading(false);
        setHydrated(true);
        return;
      }

      const nextRoutines = data?.routines;
      const nextHistory = data?.workout_history;

      setRoutines(isRoutineArray(nextRoutines) ? nextRoutines : []);
      setWorkoutHistory(isWorkoutSessionArray(nextHistory) ? nextHistory : []);
      setLoading(false);
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !hydrated) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    const t = setTimeout(() => {
      void persist(routines, workoutHistory);
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [userId, hydrated, routines, workoutHistory, persist]);

  const addRoutine = useCallback((routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
  }, []);

  const saveWorkoutSession = useCallback(
    async (input: { routineId: string; day: Day; log: ExerciseLog }) => {
      if (!userId) {
        return { error: "Not signed in" };
      }
      if (loading || !hydrated) {
        return { error: "Still loading your program. Try again in a moment." };
      }
      if (!logHasEntries(input.log)) {
        return { error: "Add at least one set with weight, reps, or RPE." };
      }

      const entry: WorkoutSession = {
        id: newSessionId(),
        routineId: input.routineId,
        day: input.day,
        performedAt: new Date().toISOString(),
        log: input.log,
      };

      const nextHistory = [entry, ...workoutHistory];
      setWorkoutHistory(nextHistory);
      return persist(routines, nextHistory);
    },
    [userId, loading, hydrated, routines, workoutHistory, persist]
  );

  const value = useMemo<RoutinesContextValue>(() => {
    return {
      routines,
      addRoutine,
      loading,
      saving,
      error,
      workoutHistory,
      saveWorkoutSession,
    };
  }, [
    routines,
    addRoutine,
    loading,
    saving,
    error,
    workoutHistory,
    saveWorkoutSession,
  ]);

  return (
    <RoutinesContext.Provider value={value}>{children}</RoutinesContext.Provider>
  );
}

export function useRoutines() {
  const ctx = useContext(RoutinesContext);
  if (!ctx) {
    throw new Error("useRoutines must be used within RoutinesProvider");
  }
  return ctx;
}
