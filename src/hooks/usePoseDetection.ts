import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

export interface PosePoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface Props {
  video: HTMLVideoElement | null;
  enabled?: boolean;
}

export default function usePoseDetection({
  video,
  enabled = false,
}: Props) {
  const detectorRef = useRef<PoseLandmarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);

  const [landmarks, setLandmarks] = useState<PosePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const initialize = useCallback(async () => {
    if (detectorRef.current) {
      return detectorRef.current;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading MediaPipe...");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );

      console.log("WASM loaded.");

      const detector =
        await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
              delegate: "CPU",
            },

            runningMode: "VIDEO",

            numPoses: 1,

            minPoseDetectionConfidence: 0.3,
            minPosePresenceConfidence: 0.3,
            minTrackingConfidence: 0.3,
          }
        );

      console.log("Pose Landmarker ready.");

      detectorRef.current = detector;

      return detector;
    } catch (err) {
      console.error(
        "POSE INITIALIZATION ERROR:",
        err
      );

      setError(
        "Pose detector could not be initialized."
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detect = useCallback(async () => {
    if (!runningRef.current) {
      return;
    }

    if (!video) {
      frameRef.current =
        requestAnimationFrame(detect);
      return;
    }

    const detector = detectorRef.current;

    if (!detector) {
      frameRef.current =
        requestAnimationFrame(detect);
      return;
    }

    if (video.readyState < 2) {
      frameRef.current =
        requestAnimationFrame(detect);
      return;
    }

    /*
     * Only process a new video frame.
     */
    if (
      video.currentTime ===
      lastVideoTimeRef.current
    ) {
      frameRef.current =
        requestAnimationFrame(detect);
      return;
    }

    lastVideoTimeRef.current =
      video.currentTime;

    try {
      const result =
        detector.detectForVideo(
          video,
          performance.now()
        );

      if (
        result.landmarks &&
        result.landmarks.length > 0
      ) {
        const pose =
          result.landmarks[0];

        const points: PosePoint[] =
          pose.map((p) => ({
            x: p.x,
            y: p.y,
            z: p.z ?? 0,
            visibility:
              p.visibility ?? 1,
          }));

        setLandmarks(points);
      }
    } catch (err) {
      console.error(
        "POSE DETECTION ERROR:",
        err
      );
    }

    frameRef.current =
      requestAnimationFrame(detect);
  }, [video]);

  const startDetection =
    useCallback(async () => {
      if (!video) {
        console.warn(
          "Video element is missing."
        );
        return;
      }

      /*
       * Make absolutely sure the video
       * is playing before starting AI.
       */
      if (video.paused) {
        try {
          await video.play();
        } catch (err) {
          console.error(
            "Video play error:",
            err
          );
        }
      }

      const detector =
        await initialize();

      if (!detector) {
        return;
      }

      console.log(
        "Starting pose detection..."
      );

      runningRef.current = true;
      setIsDetecting(true);

      lastVideoTimeRef.current = -1;

      if (frameRef.current !== null) {
        cancelAnimationFrame(
          frameRef.current
        );
      }

      frameRef.current =
        requestAnimationFrame(detect);
    }, [
      video,
      initialize,
      detect,
    ]);

  const stopDetection =
    useCallback(() => {
      runningRef.current = false;

      setIsDetecting(false);
      setLandmarks([]);
      setFps(0);

      if (frameRef.current !== null) {
        cancelAnimationFrame(
          frameRef.current
        );

        frameRef.current = null;
      }
    }, []);

  useEffect(() => {
    if (enabled && video) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [
    enabled,
    video,
    startDetection,
    stopDetection,
  ]);

  useEffect(() => {
    return () => {
      runningRef.current = false;

      if (frameRef.current !== null) {
        cancelAnimationFrame(
          frameRef.current
        );
      }

      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, []);

  return {
    landmarks,
    isLoading,
    isDetecting,
    error,
    fps,
    startDetection,
    stopDetection,
  };
}