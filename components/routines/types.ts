import type { ExerciseLog } from "@/components/train/types";

// Stable internal identifiers for days of the week.
// These are translated at render time using i18next (`days.short.*`).
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];

export type Routine = {
  id: string;
  name: string;
  days: Day[];
  exercisesByDay: Record<Day, string[]>;
};

export type WorkoutSession = {
  id: string;
  routineId: string;
  day: Day;
  performedAt: string;
  log: ExerciseLog;
};

