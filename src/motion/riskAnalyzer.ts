import type {
  FormAnalysis,
  FormIssue,
} from "./formAnalyzer";

export type RiskLevel =
  | "low"
  | "moderate"
  | "high";

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  label: string;
  message: string;
  recommendations: string[];
  contributingFactors: string[];
}

interface RiskHistory {
  timestamp: number;
  score: number;
}

const MAX_HISTORY = 60;

export class RiskAnalyzer {
  private history: RiskHistory[] = [];

  analyze(
    form: FormAnalysis,
    kneeAngle: number,
    hipAngle: number
  ): RiskAnalysis {
    let score = 0;

    const contributingFactors: string[] = [];
    const recommendations: string[] = [];

    /*
     * ---------------------------------------------
     * 1. FORM QUALITY
     * ---------------------------------------------
     */

    if (form.score < 60) {
      score += 35;
      contributingFactors.push(
        "Poor movement form"
      );
    } else if (form.score < 80) {
      score += 18;
      contributingFactors.push(
        "Form inconsistency"
      );
    }

    /*
     * ---------------------------------------------
     * 2. FORM ISSUES
     * ---------------------------------------------
     */

    for (const issue of form.issues) {
      this.applyIssuePenalty(
        issue,
        contributingFactors,
        recommendations,
        (penalty) => {
          score += penalty;
        }
      );
    }

    /*
     * ---------------------------------------------
     * 3. EXTREME KNEE ANGLE
     * ---------------------------------------------
     */

    if (kneeAngle < 55) {
      score += 20;

      contributingFactors.push(
        "Very deep knee flexion"
      );

      recommendations.push(
        "Reduce squat depth and maintain controlled movement."
      );
    }

    /*
     * ---------------------------------------------
     * 4. HIP/KNEE MOVEMENT RELATIONSHIP
     * ---------------------------------------------
     */

    if (
      kneeAngle < 90 &&
      hipAngle < 50
    ) {
      score += 10;

      contributingFactors.push(
        "Deep combined hip and knee flexion"
      );
    }

    /*
     * ---------------------------------------------
     * 5. PERSISTENT POOR FORM
     * ---------------------------------------------
     */

    this.addHistory(
      score,
      performance.now()
    );

    const persistentRisk =
      this.calculatePersistentRisk();

    if (persistentRisk > 0.7) {
      score += 15;

      contributingFactors.push(
        "Persistent movement-quality issue"
      );

      recommendations.push(
        "Pause and reset your posture before continuing."
      );
    }

    /*
     * ---------------------------------------------
     * LIMIT SCORE
     * ---------------------------------------------
     */

    score = Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );

    /*
     * ---------------------------------------------
     * RISK LEVEL
     * ---------------------------------------------
     */

    let level: RiskLevel = "low";

    if (score >= 65) {
      level = "high";
    } else if (score >= 35) {
      level = "moderate";
    }

    const label =
      level === "low"
        ? "LOW RISK"
        : level === "moderate"
          ? "MODERATE RISK"
          : "HIGH RISK";

    let message =
      "Movement indicators are currently within the configured monitoring range.";

    if (level === "moderate") {
      message =
        "Some movement indicators require attention. Adjust your form and continue carefully.";
    }

    if (level === "high") {
      message =
        "Multiple movement-risk indicators detected. Consider pausing the exercise and correcting your form.";
    }

    if (
      recommendations.length === 0
    ) {
      recommendations.push(
        "Maintain controlled movement and consistent posture."
      );
    }

    return {
      score,
      level,
      label,
      message,
      recommendations: [
        ...new Set(
          recommendations
        ),
      ],
      contributingFactors: [
        ...new Set(
          contributingFactors
        ),
      ],
    };
  }

  private applyIssuePenalty(
    issue: FormIssue,
    factors: string[],
    recommendations: string[],
    addPenalty: (
      penalty: number
    ) => void
  ) {
    if (
      issue.severity === "warning"
    ) {
      addPenalty(20);
    } else if (
      issue.severity === "attention"
    ) {
      addPenalty(10);
    }

    factors.push(issue.message);

    recommendations.push(
      issue.guidance
    );
  }

  private addHistory(
    score: number,
    timestamp: number
  ) {
    this.history.push({
      score,
      timestamp,
    });

    if (
      this.history.length >
      MAX_HISTORY
    ) {
      this.history.shift();
    }
  }

  private calculatePersistentRisk(): number {
    if (
      this.history.length < 10
    ) {
      return 0;
    }

    const recent =
      this.history.slice(-20);

    const highRiskFrames =
      recent.filter(
        (item) => item.score >= 30
      ).length;

    return (
      highRiskFrames /
      recent.length
    );
  }

  reset() {
    this.history = [];
  }
}

/**
 * Simple helper for UI components that
 * need an initial risk state.
 */
export function getDefaultRiskAnalysis(): RiskAnalysis {
  return {
    score: 0,
    level: "low",
    label: "LOW RISK",
    message:
      "Start movement analysis to calculate risk indicators.",
    recommendations: [
      "Position your full body inside the camera frame.",
    ],
    contributingFactors: [],
  };
}