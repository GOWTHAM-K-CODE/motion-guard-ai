import {
  calculateKneeAngle,
  calculateHipAngle,
} from "./jointAngles";

import {
  PoseLandmark,
  type PoseLandmarkPoint,
} from "./poseLandmarks";

export type SquatPhase =
  | "standing"
  | "descending"
  | "bottom"
  | "ascending"
  | "unknown";

export interface SquatAnalysis {
  phase: SquatPhase;
  leftKneeAngle: number;
  rightKneeAngle: number;
  averageKneeAngle: number;
  leftHipAngle: number;
  rightHipAngle: number;
  averageHipAngle: number;
  hipHeight: number;
  confidence: number;
}

function getPoint(
  landmarks: PoseLandmarkPoint[],
  index: PoseLandmark
): PoseLandmarkPoint | null {
  const point = landmarks[index];

  if (!point) {
    return null;
  }

  return point;
}

function getAverageVisibility(
  points: Array<PoseLandmarkPoint | null>
): number {
  const visiblePoints = points.filter(
    (point): point is PoseLandmarkPoint =>
      point !== null
  );

  if (visiblePoints.length === 0) {
    return 0;
  }

  const total = visiblePoints.reduce(
    (sum, point) =>
      sum + (point.visibility ?? 1),
    0
  );

  return total / visiblePoints.length;
}

/**
 * Analyzes the current squat posture.
 *
 * This is a prototype rule-based classifier.
 * Later, it can be replaced or enhanced with
 * a trained movement-classification model.
 */
export function analyzeSquat(
  landmarks: PoseLandmarkPoint[]
): SquatAnalysis | null {
  const leftShoulder = getPoint(
    landmarks,
    PoseLandmark.LEFT_SHOULDER
  );

  const rightShoulder = getPoint(
    landmarks,
    PoseLandmark.RIGHT_SHOULDER
  );

  const leftHip = getPoint(
    landmarks,
    PoseLandmark.LEFT_HIP
  );

  const rightHip = getPoint(
    landmarks,
    PoseLandmark.RIGHT_HIP
  );

  const leftKnee = getPoint(
    landmarks,
    PoseLandmark.LEFT_KNEE
  );

  const rightKnee = getPoint(
    landmarks,
    PoseLandmark.RIGHT_KNEE
  );

  const leftAnkle = getPoint(
    landmarks,
    PoseLandmark.LEFT_ANKLE
  );

  const rightAnkle = getPoint(
    landmarks,
    PoseLandmark.RIGHT_ANKLE
  );

  const requiredPoints = [
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
    leftKnee,
    rightKnee,
    leftAnkle,
    rightAnkle,
  ];

  if (
    requiredPoints.some(
      (point) => point === null
    )
  ) {
    return null;
  }

  const leftKneeAngle =
    calculateKneeAngle(
      leftHip!,
      leftKnee!,
      leftAnkle!
    );

  const rightKneeAngle =
    calculateKneeAngle(
      rightHip!,
      rightKnee!,
      rightAnkle!
    );

  const averageKneeAngle =
    (leftKneeAngle + rightKneeAngle) / 2;

  const leftHipAngle =
    calculateHipAngle(
      leftShoulder!,
      leftHip!,
      leftKnee!
    );

  const rightHipAngle =
    calculateHipAngle(
      rightShoulder!,
      rightHip!,
      rightKnee!
    );

  const averageHipAngle =
    (leftHipAngle + rightHipAngle) / 2;

  const hipHeight =
    (leftHip!.y + rightHip!.y) / 2;

  const confidence =
    getAverageVisibility(requiredPoints);

  let phase: SquatPhase = "unknown";

  /**
   * Approximate prototype thresholds.
   *
   * These values are intentionally configurable
   * rather than presented as medical standards.
   */

  if (averageKneeAngle > 155) {
    phase = "standing";
  } else if (averageKneeAngle > 115) {
    phase = "descending";
  } else if (averageKneeAngle >= 75) {
    phase = "bottom";
  } else {
    phase = "bottom";
  }

  return {
    phase,
    leftKneeAngle: Math.round(
      leftKneeAngle
    ),
    rightKneeAngle: Math.round(
      rightKneeAngle
    ),
    averageKneeAngle: Math.round(
      averageKneeAngle
    ),
    leftHipAngle: Math.round(
      leftHipAngle
    ),
    rightHipAngle: Math.round(
      rightHipAngle
    ),
    averageHipAngle: Math.round(
      averageHipAngle
    ),
    hipHeight: Number(
      hipHeight.toFixed(3)
    ),
    confidence: Number(
      confidence.toFixed(2)
    ),
  };
}

/**
 * Determines whether a pose contains enough
 * information to perform movement analysis.
 */
export function isPoseReliable(
  landmarks: PoseLandmarkPoint[],
  minimumVisibility = 0.5
): boolean {
  const importantLandmarks = [
    PoseLandmark.LEFT_SHOULDER,
    PoseLandmark.RIGHT_SHOULDER,
    PoseLandmark.LEFT_HIP,
    PoseLandmark.RIGHT_HIP,
    PoseLandmark.LEFT_KNEE,
    PoseLandmark.RIGHT_KNEE,
    PoseLandmark.LEFT_ANKLE,
    PoseLandmark.RIGHT_ANKLE,
  ];

  const visibilityValues =
    importantLandmarks.map(
      (index) =>
        landmarks[index]?.visibility ?? 0
    );

  return visibilityValues.every(
    (visibility) =>
      visibility >= minimumVisibility
  );
}