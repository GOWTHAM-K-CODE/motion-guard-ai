import type { PoseLandmarkPoint } from "../motion/poseLandmarks";
import type { SquatPhase } from "../motion/exerciseDetector";
import type { RiskAnalysis } from "../motion/riskAnalyzer";
import type { FormAnalysis } from "../motion/formAnalyzer";

export interface JointAngles {
  leftKnee: number;
  rightKnee: number;

  leftHip: number;
  rightHip: number;

  leftElbow: number;
  rightElbow: number;

  leftShoulder: number;
  rightShoulder: number;

  torso: number;
}

export interface MovementMetrics {
  repetitions: number;

  phase: SquatPhase;

  kneeAngle: number;

  hipAngle: number;

  formScore: number;

  riskScore: number;

  riskLevel: "low" | "moderate" | "high";

  confidence: number;

  fps: number;
}

export interface MovementFeedback {
  severity: "info" | "success" | "warning" | "danger";

  title: string;

  message: string;

  timestamp: number;
}

export interface MotionFrame {
  timestamp: number;

  landmarks: PoseLandmarkPoint[];

  angles: JointAngles;

  metrics: MovementMetrics;

  form: FormAnalysis;

  risk: RiskAnalysis;
}

export interface MotionSession {
  id: string;

  exercise: string;

  startedAt: number;

  endedAt?: number;

  duration: number;

  repetitions: number;

  averageFormScore: number;

  averageRiskScore: number;

  peakRiskScore: number;

  feedback: MovementFeedback[];

  completed: boolean;
}

export interface MotionAnalysisState {
  isCameraReady: boolean;

  isAIReady: boolean;

  isAnalyzing: boolean;

  landmarks: PoseLandmarkPoint[];

  metrics: MovementMetrics;

  angles: JointAngles;

  form: FormAnalysis;

  risk: RiskAnalysis;

  feedback: MovementFeedback[];

  currentSession: MotionSession | null;
}