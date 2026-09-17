import "../styles/motion-analysis.css";
import { useEffect, useRef, useState } from "react";

import PoseOverlay from "../components/PoseOverlay";
import useMotionAnalysis from "../hooks/useMotionAnalysis";


export default function MotionAnalysis() {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [videoSize, setVideoSize] =
    useState({
      width: 640,
      height: 480,
    });

  const [started, setStarted] =
    useState(false);

  const {
    landmarks,
    metrics,
    form,
    risk,
    feedback,
    isLoading,
    isAnalyzing,
    error,
    fps,
    startAnalysis,
    stopAnalysis,
    resetAnalysis,
  } = useMotionAnalysis({
    video: videoRef.current,
    enabled: started,
  });

  /*
   * Start webcam
   */
  const startCamera = async () => {
    try {
      setCameraError(null);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          }
        );

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject =
        stream;

      await videoRef.current.play();

      setCameraReady(true);

      setStarted(true);
    } catch (cameraException) {
      console.error(
        "Camera error:",
        cameraException
      );

      setCameraError(
        "Camera access was denied or is unavailable."
      );
    }
  };

  /*
   * Stop webcam
   */
  const stopCamera = () => {
    const stream =
      videoRef.current?.srcObject as
        | MediaStream
        | null;

    stream
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraReady(false);
    setStarted(false);

    stopAnalysis();
    resetAnalysis();
  };

  /*
   * Update overlay dimensions.
   */
  useEffect(() => {
    const updateSize = () => {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      setVideoSize({
        width:
          container.clientWidth,
        height:
          container.clientHeight,
      });
    };

    updateSize();

    window.addEventListener(
      "resize",
      updateSize
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateSize
      );
    };
  }, []);

  /*
   * Cleanup camera when page closes.
   */
  useEffect(() => {
    return () => {
      const stream =
        videoRef.current
          ?.srcObject as
          | MediaStream
          | null;

      stream
        ?.getTracks()
        .forEach(
          (track) => track.stop()
        );
    };
  }, []);

  return (
    <div className="motion-analysis-page">
      <div className="motion-header">
        <div>
          <div className="motion-title">
            Motion Guard AI
          </div>

          <div className="motion-subtitle">
            Real-time movement analysis
          </div>
        </div>

        <div className="ai-status">
          <span
            className={
              isAnalyzing
                ? "status-dot active"
                : "status-dot"
            }
          />

          {isAnalyzing
            ? "AI ANALYZING"
            : "AI STANDBY"}
        </div>
      </div>

      <div className="motion-layout">
        <div className="camera-section">
          <div
            ref={containerRef}
            className="camera-container"
          >
            <video
              ref={videoRef}
              className="camera-video"
              playsInline
              muted
            />

            {landmarks.length > 0 && (
              <PoseOverlay
                points={landmarks}
                width={videoSize.width}
                height={videoSize.height}
                mirrored
              />
            )}

            {!cameraReady && (
              <div className="camera-placeholder">
                <div className="camera-placeholder-title">
                  Motion Analysis
                </div>

                <div className="camera-placeholder-text">
                  Start the camera to begin
                  real-time AI movement
                  analysis.
                </div>

                <button
                  className="primary-button"
                  onClick={startCamera}
                >
                  Start Camera
                </button>
              </div>
            )}

            {cameraError && (
              <div className="camera-error">
                {cameraError}
              </div>
            )}

            {isLoading && (
              <div className="ai-loading">
                Initializing AI pose
                detection...
              </div>
            )}

            {cameraReady && (
              <div className="camera-overlay-top">
                <div className="live-indicator">
                  <span className="live-dot" />
                  LIVE
                </div>

                <div className="fps-indicator">
                  {fps} FPS
                </div>
              </div>
            )}
          </div>

          {cameraReady && (
            <div className="camera-controls">
              <button
                className="secondary-button"
                onClick={resetAnalysis}
              >
                Reset
              </button>

              <button
                className="danger-button"
                onClick={stopCamera}
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>

        <div className="analysis-panel">
          <div className="metric-card">
            <div className="metric-label">
              REPETITIONS
            </div>

            <div className="metric-value">
              {metrics.repetitions}
            </div>

            <div className="metric-secondary">
              {metrics.phase.toUpperCase()}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              KNEE ANGLE
            </div>

            <div className="metric-value">
              {metrics.kneeAngle}°
            </div>

            <div className="metric-secondary">
              Live measurement
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              FORM SCORE
            </div>

            <div className="metric-value">
              {form.score}
              <span className="metric-unit">
                /100
              </span>
            </div>

            <div
              className={`form-status ${form.quality}`}
            >
              {form.quality.toUpperCase()}
            </div>
          </div>

          <div
            className={`risk-card ${risk.level}`}
          >
            <div className="metric-label">
              MOVEMENT RISK
            </div>

            <div className="risk-score">
              {risk.score}
            </div>

            <div className="risk-label">
              {risk.label}
            </div>

            <div className="risk-message">
              {risk.message}
            </div>
          </div>

          <div className="feedback-card">
            <div className="section-title">
              LIVE GUIDANCE
            </div>

            {feedback.length === 0 ? (
              <div className="empty-feedback">
                Start moving to receive
                real-time guidance.
              </div>
            ) : (
              feedback.map(
                (item, index) => (
                  <div
                    key={`${item.timestamp}-${index}`}
                    className={`feedback-item ${item.severity}`}
                  >
                    <div className="feedback-title">
                      {item.title}
                    </div>

                    <div className="feedback-message">
                      {item.message}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <div className="technical-card">
            <div className="section-title">
              AI MONITORING
            </div>

            <div className="technical-row">
              <span>Pose landmarks</span>
              <strong>
                {landmarks.length}/33
              </strong>
            </div>

            <div className="technical-row">
              <span>AI confidence</span>
              <strong>
                {Math.round(
                  metrics.confidence *
                    100
                )}
                %
              </strong>
            </div>

            <div className="technical-row">
              <span>Hip angle</span>
              <strong>
                {metrics.hipAngle}°
              </strong>
            </div>

            <div className="technical-row">
              <span>Analysis</span>
              <strong>
                {isAnalyzing
                  ? "ACTIVE"
                  : "STANDBY"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="global-error">
          {error}
        </div>
      )}
    </div>
  );
}