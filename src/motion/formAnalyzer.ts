import {
  calculateDistance,
  type Point3D,
} from "./jointAngles";

import {
  PoseLandmark,
  type PoseLandmarkPoint,
} from "./poseLandmarks";

export type FormSeverity =
  | "good"
  | "attention"
  | "warning";

export interface FormIssue {
  type:
    | "knee_alignment"
    | "knee_asymmetry"
    | "torso_lean"
    | "depth"
    | "balance";

  severity: FormSeverity;
  message: string;
  guidance: string;
  score: number;
}

export interface FormAnalysis {
  score: number;
  quality: FormSeverity;
  issues: FormIssue[];
  feedback: string;
}

function getPoint(
  landmarks: PoseLandmarkPoint[],
  index: PoseLandmark
): PoseLandmarkPoint | null {
  return landmarks[index] ?? null;
}

function average(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

/**
 * Analyzes squat form using body landmarks.
 *
 * This is a prototype biomechanical rule engine.
 * It is not a medical diagnostic system.
 */
export function analyzeSquatForm(
  landmarks: PoseLandmarkPoint[],
  kneeAngle: number,
  hipAngle: number
): FormAnalysis {
  const issues: FormIssue[] = [];

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

  const leftShoulder = getPoint(
    landmarks,
    PoseLandmark.LEFT_SHOULDER
  );

  const rightShoulder = getPoint(
    landmarks,
    PoseLandmark.RIGHT_SHOULDER
  );

  if (
    !leftHip ||
    !rightHip ||
    !leftKnee ||
    !rightKnee ||
    !leftAnkle ||
    !rightAnkle ||
    !leftShoulder ||
    !rightShoulder
  ) {
    return {
      score: 0,
      quality: "warning",
      issues: [
        {
          type: "balance",
          severity: "warning",
          message: "Pose not fully visible",
          guidance:
            "Move farther from the camera and keep your full body visible.",
          score: 0,
        },
      ],
      feedback:
        "Full-body visibility is required for reliable movement analysis.",
    };
  }

  /*
   * --------------------------------------------------
   * 1. KNEE SYMMETRY
   * --------------------------------------------------
   */

  const leftKneeX = leftKnee.x;
  const rightKneeX = rightKnee.x;

  const leftHipX = leftHip.x;
  const rightHipX = rightHip.x;

  const leftKneeOffset =
    Math.abs(leftKneeX - leftHipX);

  const rightKneeOffset =
    Math.abs(rightKneeX - rightHipX);

  const kneeAsymmetry =
    Math.abs(
      leftKneeOffset -
        rightKneeOffset
    );

  if (kneeAsymmetry > 0.07) {
    issues.push({
      type: "knee_asymmetry",
      severity: "warning",
      message: "Uneven knee movement",
      guidance:
        "Try to keep both knees moving symmetrically.",
      score: 15,
    });
  } else if (kneeAsymmetry > 0.04) {
    issues.push({
      type: "knee_asymmetry",
      severity: "attention",
      message: "Slight knee asymmetry",
      guidance:
        "Keep your weight balanced between both legs.",
      score: 7,
    });
  }

  /*
   * --------------------------------------------------
   * 2. KNEE ALIGNMENT
   * --------------------------------------------------
   */

  const leftHipAnkleDistance =
    calculateDistance(
      leftHip,
      leftAnkle
    );

  const rightHipAnkleDistance =
    calculateDistance(
      rightHip,
      rightAnkle
    );

  const leftKneeToLegRatio =
    calculateDistance(
      leftKnee,
      leftAnkle
    ) /
    Math.max(
      leftHipAnkleDistance,
      0.001
    );

  const rightKneeToLegRatio =
    calculateDistance(
      rightKnee,
      rightAnkle
    ) /
    Math.max(
      rightHipAnkleDistance,
      0.001
    );

  if (
    leftKneeToLegRatio > 0.72 ||
    rightKneeToLegRatio > 0.72
  ) {
    issues.push({
      type: "knee_alignment",
      severity: "warning",
      message: "Check knee alignment",
      guidance:
        "Keep your knees aligned with your feet during the movement.",
      score: 15,
    });
  }

  /*
   * --------------------------------------------------
   * 3. TORSO LEAN
   * --------------------------------------------------
   */

  const shoulderCenter = {
    x:
      (leftShoulder.x +
        rightShoulder.x) /
      2,

    y:
      (leftShoulder.y +
        rightShoulder.y) /
      2,

    z:
      (leftShoulder.z +
        rightShoulder.z) /
      2,
  };

  const hipCenter = {
    x:
      (leftHip.x +
        rightHip.x) /
      2,

    y:
      (leftHip.y +
        rightHip.y) /
      2,

    z:
      (leftHip.z +
        rightHip.z) /
      2,
  };

  const torsoLean =
    Math.abs(
      shoulderCenter.x -
        hipCenter.x
    );

  if (torsoLean > 0.16) {
    issues.push({
      type: "torso_lean",
      severity: "warning",
      message: "Excessive torso lean",
      guidance:
        "Keep your chest more upright and control the descent.",
      score: 20,
    });
  } else if (torsoLean > 0.1) {
    issues.push({
      type: "torso_lean",
      severity: "attention",
      message: "Slight forward lean",
      guidance:
        "Try to maintain a more neutral torso position.",
      score: 8,
    });
  }

  /*
   * --------------------------------------------------
   * 4. SQUAT DEPTH
   * --------------------------------------------------
   */

  if (
    kneeAngle < 75 &&
    hipAngle < 65
  ) {
    issues.push({
      type: "depth",
      severity: "attention",
      message: "Very deep squat",
      guidance:
        "Maintain controlled movement and avoid forcing excessive depth.",
      score: 6,
    });
  }

  /*
   * --------------------------------------------------
   * 5. BALANCE
   * --------------------------------------------------
   */

  const hipWidth =
    Math.abs(
      leftHip.x -
        rightHip.x
    );

  const kneeWidth =
    Math.abs(
      leftKnee.x -
        rightKnee.x
    );

  if (
    hipWidth > 0 &&
    kneeWidth < hipWidth * 0.45
  ) {
    issues.push({
      type: "balance",
      severity: "attention",
      message: "Knees moving inward",
      guidance:
        "Keep your knees tracking in line with your feet.",
      score: 10,
    });
  }

  /*
   * --------------------------------------------------
   * FINAL SCORE
   * --------------------------------------------------
   */

  const totalPenalty = average(
    issues.map(
      (issue) => issue.score
    )
  );

  const penalty =
    issues.reduce(
      (sum, issue) =>
        sum + issue.score,
      0
    );

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 - penalty - totalPenalty * 0.25
      )
    )
  );

  let quality: FormSeverity =
    "good";

  if (score < 60) {
    quality = "warning";
  } else if (score < 80) {
    quality = "attention";
  }

  let feedback =
    "Movement form looks good. Continue with controlled movement.";

  if (issues.length > 0) {
    feedback =
      issues[0].guidance;
  }

  return {
    score,
    quality,
    issues,
    feedback,
  };
}