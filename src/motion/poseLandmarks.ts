/**
 * MediaPipe Pose landmark indices.
 *
 * MediaPipe Pose Landmarker provides 33 body landmarks.
 */

export enum PoseLandmark {
  NOSE = 0,

  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,

  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,

  LEFT_EAR = 7,
  RIGHT_EAR = 8,

  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,

  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,

  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,

  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,

  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,

  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,

  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,

  LEFT_HIP = 23,
  RIGHT_HIP = 24,

  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,

  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,

  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,

  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

export interface PoseLandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseLandmarkSet {
  landmarks: PoseLandmarkPoint[];
}

export function getLandmark(
  landmarks: PoseLandmarkPoint[],
  landmark: PoseLandmark
): PoseLandmarkPoint | null {
  const point = landmarks[landmark];

  if (!point) {
    return null;
  }

  return point;
}

export function getLeftKnee(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.LEFT_KNEE
  );
}

export function getRightKnee(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.RIGHT_KNEE
  );
}

export function getLeftHip(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.LEFT_HIP
  );
}

export function getRightHip(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.RIGHT_HIP
  );
}

export function getLeftAnkle(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.LEFT_ANKLE
  );
}

export function getRightAnkle(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.RIGHT_ANKLE
  );
}

export function getLeftShoulder(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.LEFT_SHOULDER
  );
}

export function getRightShoulder(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.RIGHT_SHOULDER
  );
}

export function getLeftElbow(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.LEFT_ELBOW
  );
}

export function getRightElbow(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.RIGHT_ELBOW
  );
}

export function getLeftWrist(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.LEFT_WRIST
  );
}

export function getRightWrist(
  landmarks: PoseLandmarkPoint[]
): PoseLandmarkPoint | null {
  return getLandmark(
    landmarks,
    PoseLandmark.RIGHT_WRIST
  );
}