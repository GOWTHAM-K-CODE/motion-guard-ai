import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

import type {
  PoseLandmarkPoint,
} from "./poseLandmarks";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";

const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

let poseLandmarker: PoseLandmarker | null = null;

let initializationPromise:
  | Promise<PoseLandmarker>
  | null = null;

/**
 * Creates the MediaPipe Pose Landmarker.
 *
 * The model runs directly in the browser.
 */
export async function initializePoseDetector(): Promise<PoseLandmarker> {
  if (poseLandmarker) {
    return poseLandmarker;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      WASM_PATH
    );

    const detector = await PoseLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          delegate: "GPU",
        },

        runningMode: "VIDEO",

        numPoses: 1,

        minPoseDetectionConfidence: 0.5,

        minPosePresenceConfidence: 0.5,

        minTrackingConfidence: 0.5,
      }
    );

    poseLandmarker = detector;

    return detector;
  })();

  try {
    return await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

/**
 * Detects the body pose from a video frame.
 */
export async function detectPose(
  video: HTMLVideoElement,
  timestamp: number
): Promise<PoseLandmarkPoint[] | null> {
  const detector = await initializePoseDetector();

  const result = detector.detectForVideo(
    video,
    timestamp
  );

  if (
    !result.landmarks ||
    result.landmarks.length === 0
  ) {
    return null;
  }

  return result.landmarks[0].map(
    (landmark) => ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z,
      visibility: landmark.visibility,
    })
  );
}

/**
 * Releases the MediaPipe model from memory.
 */
export function closePoseDetector(): void {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }

  initializationPromise = null;
}