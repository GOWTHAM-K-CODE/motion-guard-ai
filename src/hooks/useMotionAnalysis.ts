import { useEffect, useRef, useState } from "react";
import usePoseDetection, {
  PosePoint,
} from "./usePoseDetection";

interface MotionMetrics {
  repetitions: number;
  kneeAngle: number;
  hipAngle: number;
  confidence: number;
  phase: string;
}

interface FormResult {
  score: number;
  quality: "good" | "attention" | "warning";
}

interface RiskResult {
  score: number;
  level: "low" | "moderate" | "high";
  label: string;
  message: string;
}

interface FeedbackItem {
  timestamp: number;
  title: string;
  message: string;
  severity: "success" | "info" | "warning" | "danger";
}

interface Props {
  video: HTMLVideoElement | null;
  enabled?: boolean;
}

/*
 * ------------------------------------------
 * Distance between two landmarks
 * ------------------------------------------
 */
function distance(
  a: PosePoint,
  b: PosePoint
) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(
    dx * dx + dy * dy
  );
}

/*
 * ------------------------------------------
 * Calculate angle ABC
 * ------------------------------------------
 */
function calculateAngle(
  a: PosePoint,
  b: PosePoint,
  c: PosePoint
) {
  const abx = a.x - b.x;
  const aby = a.y - b.y;

  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot =
    abx * cbx +
    aby * cby;

  const magnitudeAB =
    Math.sqrt(
      abx * abx +
        aby * aby
    );

  const magnitudeCB =
    Math.sqrt(
      cbx * cbx +
        cby * cby
    );

  if (
    magnitudeAB === 0 ||
    magnitudeCB === 0
  ) {
    return 0;
  }

  const cosine =
    dot /
    (magnitudeAB *
      magnitudeCB);

  const clampedCosine =
    Math.max(
      -1,
      Math.min(1, cosine)
    );

  const angle =
    Math.acos(
      clampedCosine
    ) *
    (180 / Math.PI);

  return Math.round(angle);
}

/*
 * ------------------------------------------
 * Get average visibility
 * ------------------------------------------
 */
function averageVisibility(
  points: PosePoint[]
) {
  if (!points.length) {
    return 0;
  }

  const total =
    points.reduce(
      (sum, point) =>
        sum +
        (point.visibility ?? 1),
      0
    );

  return total / points.length;
}

export default function useMotionAnalysis({
  video,
  enabled = false,
}: Props) {
  const {
    landmarks,
    isLoading,
    isDetecting,
    error,
    fps,
    startDetection,
    stopDetection,
  } = usePoseDetection({
    video,
    enabled,
  });

  const [metrics, setMetrics] =
    useState<MotionMetrics>({
      repetitions: 0,
      kneeAngle: 0,
      hipAngle: 0,
      confidence: 0,
      phase: "READY",
    });

  const [form, setForm] =
    useState<FormResult>({
      score: 0,
      quality: "good",
    });

  const [risk, setRisk] =
    useState<RiskResult>({
      score: 0,
      level: "low",
      label: "LOW RISK",
      message:
        "No significant movement risk detected.",
    });

  const [feedback, setFeedback] =
    useState<FeedbackItem[]>([]);

  /*
   * Prevent repeated rep counting.
   */
  const previousPhase =
    useRef("READY");

  const repetitions =
    useRef(0);

  /*
   * Smoothed values.
   */
  const smoothedKnee =
    useRef(0);

  const smoothedHip =
    useRef(0);

  /*
   * ------------------------------------------
   * Analyze every new pose
   * ------------------------------------------
   */
  useEffect(() => {
    if (
      !landmarks ||
      landmarks.length < 33
    ) {
      return;
    }

    /*
     * MediaPipe landmark indexes
     *
     * 23 = left hip
     * 24 = right hip
     * 25 = left knee
     * 26 = right knee
     * 27 = left ankle
     * 28 = right ankle
     * 11 = left shoulder
     * 12 = right shoulder
     */

    const leftHip =
      landmarks[23];

    const rightHip =
      landmarks[24];

    const leftKnee =
      landmarks[25];

    const rightKnee =
      landmarks[26];

    const leftAnkle =
      landmarks[27];

    const rightAnkle =
      landmarks[28];

    const leftShoulder =
      landmarks[11];

    const rightShoulder =
      landmarks[12];

    if (
      !leftHip ||
      !rightHip ||
      !leftKnee ||
      !rightKnee ||
      !leftAnkle ||
      !rightAnkle
    ) {
      return;
    }

    /*
     * Calculate both knee angles.
     */
    const leftKneeAngle =
      calculateAngle(
        leftHip,
        leftKnee,
        leftAnkle
      );

    const rightKneeAngle =
      calculateAngle(
        rightHip,
        rightKnee,
        rightAnkle
      );

    /*
     * Use the more visible side.
     */
    const leftVisibility =
      leftKnee.visibility ?? 0;

    const rightVisibility =
      rightKnee.visibility ?? 0;

    let kneeAngle =
      leftKneeAngle;

    if (
      rightVisibility >
      leftVisibility
    ) {
      kneeAngle =
        rightKneeAngle;
    }

    /*
     * Hip angle.
     */
    const shoulderX =
      (
        leftShoulder.x +
        rightShoulder.x
      ) / 2;

    const shoulderY =
      (
        leftShoulder.y +
        rightShoulder.y
      ) / 2;

    const hipX =
      (
        leftHip.x +
        rightHip.x
      ) / 2;

    const hipY =
      (
        leftHip.y +
        rightHip.y
      ) / 2;

    const kneeX =
      (
        leftKnee.x +
        rightKnee.x
      ) / 2;

    const kneeY =
      (
        leftKnee.y +
        rightKnee.y
      ) / 2;

    const shoulderPoint: PosePoint = {
      x: shoulderX,
      y: shoulderY,
      z: 0,
      visibility: 1,
    };

    const hipPoint: PosePoint = {
      x: hipX,
      y: hipY,
      z: 0,
      visibility: 1,
    };

    const kneePoint: PosePoint = {
      x: kneeX,
      y: kneeY,
      z: 0,
      visibility: 1,
    };

    const hipAngle =
      calculateAngle(
        shoulderPoint,
        hipPoint,
        kneePoint
      );

    /*
     * --------------------------------------
     * Temporal smoothing
     * --------------------------------------
     */

    if (
      smoothedKnee.current === 0
    ) {
      smoothedKnee.current =
        kneeAngle;
    } else {
      smoothedKnee.current =
        smoothedKnee.current *
          0.75 +
        kneeAngle * 0.25;
    }

    if (
      smoothedHip.current === 0
    ) {
      smoothedHip.current =
        hipAngle;
    } else {
      smoothedHip.current =
        smoothedHip.current *
          0.75 +
        hipAngle * 0.25;
    }

    const stableKnee =
      Math.round(
        smoothedKnee.current
      );

    const stableHip =
      Math.round(
        smoothedHip.current
      );

    /*
     * --------------------------------------
     * Squat phase detection
     * --------------------------------------
     *
     * Standing:
     * knee > 150°
     *
     * Descending:
     * 100° - 150°
     *
     * Bottom:
     * knee < 100°
     */

    let phase = "STANDING";

    if (stableKnee < 100) {
      phase = "BOTTOM";
    } else if (
      stableKnee < 150
    ) {
      phase = "DESCENDING";
    }

    /*
     * --------------------------------------
     * Repetition counting
     * --------------------------------------
     */

    if (
      previousPhase.current ===
        "BOTTOM" &&
      phase === "STANDING"
    ) {
      repetitions.current += 1;
    }

    previousPhase.current =
      phase;

    /*
     * --------------------------------------
     * Confidence
     * --------------------------------------
     */

    const relevantPoints = [
      leftHip,
      rightHip,
      leftKnee,
      rightKnee,
      leftAnkle,
      rightAnkle,
      leftShoulder,
      rightShoulder,
    ];

    const confidence =
      averageVisibility(
        relevantPoints
      );

    /*
     * --------------------------------------
     * Form analysis
     * --------------------------------------
     */

    let formScore = 100;

    /*
     * Very shallow or unstable
     * knee movement.
     */
    if (
      stableKnee > 165
    ) {
      formScore -= 5;
    }

    /*
     * Excessive knee collapse /
     * unusual angle.
     */
    if (
      stableKnee < 60
    ) {
      formScore -= 20;
    }

    /*
     * Low tracking confidence.
     */
    if (
      confidence < 0.55
    ) {
      formScore -= 20;
    }

    formScore =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            formScore
          )
        )
      );

    let quality:
      | "good"
      | "attention"
      | "warning" =
      "good";

    if (
      formScore < 60
    ) {
      quality = "warning";
    } else if (
      formScore < 80
    ) {
      quality = "attention";
    }

    /*
     * --------------------------------------
     * Movement risk
     * --------------------------------------
     */

    let riskScore = 0;

    if (
      stableKnee < 60
    ) {
      riskScore += 40;
    }

    if (
      stableKnee > 175
    ) {
      riskScore += 10;
    }

    if (
      confidence < 0.55
    ) {
      riskScore += 20;
    }

    if (
      stableHip < 45
    ) {
      riskScore += 15;
    }

    riskScore =
      Math.min(
        100,
        Math.round(
          riskScore
        )
      );

    let riskLevel:
      | "low"
      | "moderate"
      | "high" =
      "low";

    let riskLabel =
      "LOW RISK";

    let riskMessage =
      "Movement pattern currently appears stable.";

    if (
      riskScore >= 60
    ) {
      riskLevel = "high";
      riskLabel = "HIGH RISK";
      riskMessage =
        "Potentially unsafe movement detected. Slow down and correct your technique.";
    } else if (
      riskScore >= 30
    ) {
      riskLevel = "moderate";
      riskLabel =
        "MODERATE RISK";
      riskMessage =
        "Some movement characteristics need attention.";
    }

    /*
     * --------------------------------------
     * Live guidance
     * --------------------------------------
     */

    const newFeedback: FeedbackItem[] =
      [];

    if (
      confidence < 0.55
    ) {
      newFeedback.push({
        timestamp:
          Date.now(),
        title:
          "Improve visibility",
        message:
          "Move slightly farther from the camera and keep your full body visible.",
        severity:
          "warning",
      });
    } else if (
      stableKnee < 60
    ) {
      newFeedback.push({
        timestamp:
          Date.now(),
        title:
          "Knee angle warning",
        message:
          "Reduce the depth and perform the movement more slowly.",
        severity:
          "danger",
      });
    } else if (
      formScore >= 80
    ) {
      newFeedback.push({
        timestamp:
          Date.now(),
        title:
          "Good form",
        message:
          "Keep your movement controlled.",
        severity:
          "success",
      });
    } else {
      newFeedback.push({
        timestamp:
          Date.now(),
        title:
          "Check your form",
        message:
          "Slow down and maintain controlled movement.",
        severity:
          "info",
      });
    }

    setMetrics({
      repetitions:
        repetitions.current,
      kneeAngle:
        stableKnee,
      hipAngle:
        stableHip,
      confidence:
        Number(
          confidence.toFixed(2)
        ),
      phase,
    });

    setForm({
      score: formScore,
      quality,
    });

    setRisk({
      score: riskScore,
      level: riskLevel,
      label: riskLabel,
      message:
        riskMessage,
    });

    setFeedback(
      newFeedback
    );
  }, [landmarks]);

  return {
    landmarks,

    metrics,

    form,

    risk,

    feedback,

    isLoading,

    isAnalyzing:
      isDetecting,

    error,

    fps,

    startAnalysis:
      startDetection,

    stopAnalysis:
      stopDetection,

    resetAnalysis: () => {
      repetitions.current = 0;

      previousPhase.current =
        "READY";

      smoothedKnee.current =
        0;

      smoothedHip.current =
        0;

      setMetrics({
        repetitions: 0,
        kneeAngle: 0,
        hipAngle: 0,
        confidence: 0,
        phase: "READY",
      });

      setForm({
        score: 0,
        quality: "good",
      });

      setRisk({
        score: 0,
        level: "low",
        label: "LOW RISK",
        message:
          "No significant movement risk detected.",
      });

      setFeedback([]);
    },
  };
}