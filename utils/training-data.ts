import type { Day, Routine, WorkoutSession } from "@/components/routines/types";
import { DAYS } from "@/components/routines/types";
import type { ExerciseLog, SetEntry } from "@/components/train/types";

const DAY_SET = new Set<string>(DAYS);

function emptyExercisesByDay(): Record<Day, string[]> {
  const out = {} as Record<Day, string[]>;
  for (const d of DAYS) out[d] = [];
  return out;
}

function parseSetEntry(value: unknown): SetEntry | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  return {
    weight: typeof s.weight === "string" ? s.weight : "",
    reps: typeof s.reps === "string" ? s.reps : "",
    rpe: typeof s.rpe === "string" ? s.rpe : "",
  };
}

/** Builds a safe ExerciseLog from JSON; drops malformed keys/sets. */
export function sanitizeExerciseLog(raw: unknown): ExerciseLog {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: ExerciseLog = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key !== "string" || !key.trim()) continue;
    if (!Array.isArray(val)) continue;
    const sets: SetEntry[] = [];
    for (const item of val) {
      const row = parseSetEntry(item);
      if (row) sets.push(row);
    }
    out[key] = sets;
  }
  return out;
}

/** Returns a valid Routine or null if the payload is unusable. */
export function parseRoutine(value: unknown): Routine | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  if (typeof r.id !== "string" || !r.id.trim()) return null;
  if (typeof r.name !== "string") return null;
  if (!Array.isArray(r.days)) return null;

  const days: Day[] = [];
  for (const d of r.days) {
    if (typeof d === "string" && DAY_SET.has(d)) days.push(d as Day);
  }
  if (r.days.length > 0 && days.length !== r.days.length) return null;

  if (!r.exercisesByDay || typeof r.exercisesByDay !== "object" || Array.isArray(r.exercisesByDay)) {
    return null;
  }

  const rawEbd = r.exercisesByDay as Record<string, unknown>;
  const exercisesByDay = emptyExercisesByDay();
  for (const d of DAYS) {
    const list = rawEbd[d];
    if (!Array.isArray(list)) continue;
    exercisesByDay[d] = list.filter((ex): ex is string => typeof ex === "string");
  }

  return {
    id: r.id.trim(),
    name: r.name,
    days,
    exercisesByDay,
  };
}

/** Returns a valid WorkoutSession or null if the payload is unusable. */
export function parseWorkoutSession(value: unknown): WorkoutSession | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  if (typeof s.id !== "string" || !s.id.trim()) return null;
  if (typeof s.routineId !== "string" || !s.routineId.trim()) return null;
  if (typeof s.day !== "string" || !DAY_SET.has(s.day)) return null;
  if (typeof s.performedAt !== "string") return null;

  const log = sanitizeExerciseLog(s.log);
  return {
    id: s.id.trim(),
    routineId: s.routineId.trim(),
    day: s.day as Day,
    performedAt: s.performedAt,
    log,
  };
}

export function sanitizeRoutines(value: unknown): Routine[] {
  if (!Array.isArray(value)) return [];
  const out: Routine[] = [];
  for (const item of value) {
    const r = parseRoutine(item);
    if (r) out.push(r);
  }
  return out;
}

export function sanitizeWorkoutHistory(value: unknown): WorkoutSession[] {
  if (!Array.isArray(value)) return [];
  const out: WorkoutSession[] = [];
  for (const item of value) {
    const s = parseWorkoutSession(item);
    if (s) out.push(s);
  }
  return out;
}
