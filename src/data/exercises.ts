import { Activity, Dumbbell, PersonStanding } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ExerciseId =
  | "squat"
  | "lunge"
  | "bicep_curl"
  | "shoulder_raise";

export interface ExerciseConfig {
  id: ExerciseId;
  name: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "coming_soon";
  targetAreas: string[];
}

export const exercises: ExerciseConfig[] = [
  {
    id: "squat",
    name: "Squat",
    description:
      "Analyze squat depth, knee alignment, symmetry and torso control.",
    icon: PersonStanding,
    status: "active",
    targetAreas: [
      "Quadriceps",
      "Glutes",
      "Hamstrings",
      "Knees",
    ],
  },

  {
    id: "lunge",
    name: "Lunge",
    description:
      "Monitor lower-body alignment and balance during lunges.",
    icon: Activity,
    status: "coming_soon",
    targetAreas: [
      "Quadriceps",
      "Glutes",
      "Hamstrings",
    ],
  },

  {
    id: "bicep_curl",
    name: "Bicep Curl",
    description:
      "Analyze elbow movement and upper-arm positioning.",
    icon: Dumbbell,
    status: "coming_soon",
    targetAreas: [
      "Biceps",
      "Elbows",
      "Shoulders",
    ],
  },

  {
    id: "shoulder_raise",
    name: "Shoulder Raise",
    description:
      "Monitor shoulder elevation and arm symmetry.",
    icon: Activity,
    status: "coming_soon",
    targetAreas: [
      "Shoulders",
      "Upper Arms",
    ],
  },
];

export function getExercise(
  id: ExerciseId
): ExerciseConfig | undefined {
  return exercises.find(
    (exercise) => exercise.id === id
  );
}

export function getActiveExercises(): ExerciseConfig[] {
  return exercises.filter(
    (exercise) =>
      exercise.status === "active"
  );
}