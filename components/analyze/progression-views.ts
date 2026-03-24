export type ProgressionDetailView =
  | "topSet"
  | "trend"
  | "allSets"
  | "pr"
  | "activity";

export type ExerciseProgressCardView = "topSet" | "trend" | "allSets";

export function isExerciseProgressCardView(
  v: ProgressionDetailView
): v is ExerciseProgressCardView {
  return v === "topSet" || v === "trend" || v === "allSets";
}
