import { Camera, CameraOff, Maximize2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CameraViewProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
}

function CameraView({ onVideoReady }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
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
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        setCameraActive(true);

        onVideoReady?.(videoRef.current);
      }
    } catch (cameraError) {
      console.error("Camera error:", cameraError);

      setCameraActive(false);

      if (
        cameraError instanceof DOMException &&
        cameraError.name === "NotAllowedError"
      ) {
        setError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (
        cameraError instanceof DOMException &&
        cameraError.name === "NotFoundError"
      ) {
        setError("No camera was found on this device.");
      } else {
        setError("Unable to access the camera.");
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  const restartCamera = async () => {
    stopCamera();

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });

    await startCamera();
  };

  const enterFullscreen = async () => {
    const container = videoRef.current?.parentElement;

    if (!container) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Fullscreen error:", fullscreenError);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="camera-container">
      <div className="camera-header">
        <div className="camera-title">
          <Camera size={18} />

          <span>Live Camera</span>
        </div>

        <div
          className={`camera-status ${
            cameraActive ? "active" : "inactive"
          }`}
        >
          <span className="camera-status-dot" />

          {cameraActive ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      <div className="camera-stage">
        <video
          ref={videoRef}
          className="camera-video"
          muted
          playsInline
        />

        <canvas className="pose-canvas" />

        {!cameraActive && (
          <div className="camera-placeholder">
            <div className="camera-placeholder-icon">
              {error ? <CameraOff size={32} /> : <Camera size={32} />}
            </div>

            <h3>
              {error ? "Camera unavailable" : "Start Motion Analysis"}
            </h3>

            <p>
              {error ??
                "Enable your camera to begin real-time movement analysis."}
            </p>

            <button
              type="button"
              className="camera-start-button"
              onClick={startCamera}
            >
              <Camera size={18} />
              Start Camera
            </button>
          </div>
        )}

        {cameraActive && (
          <div className="camera-overlay">
            <div className="camera-overlay-label">
              <span className="live-dot" />
              MOTION TRACKING READY
            </div>
          </div>
        )}

        <div className="camera-controls">
          {cameraActive && (
            <button
              type="button"
              className="camera-control-button"
              onClick={restartCamera}
              aria-label="Restart camera"
              title="Restart camera"
            >
              <RotateCcw size={18} />
            </button>
          )}

          <button
            type="button"
            className="camera-control-button"
            onClick={enterFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraView;