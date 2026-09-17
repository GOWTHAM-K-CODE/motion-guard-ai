interface PosePoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface Props {
  points: PosePoint[];
  width: number;
  height: number;
  mirrored?: boolean;
}

export default function PoseOverlay({
  points,
  width,
  height,
  mirrored = false,
}: Props) {
  if (!points.length) {
    return null;
  }

  const connections: [number, number][] = [
    [11, 12],
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 23],
    [12, 24],
    [23, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
  ];

  const getX = (x: number) =>
    mirrored ? 1 - x : x;

  return (
    <svg
      className="pose-overlay"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      style={{
        width,
        height,
      }}
    >
      {connections.map(
        ([a, b], index) => {
          const p1 = points[a];
          const p2 = points[b];

          if (!p1 || !p2) {
            return null;
          }

          if (
            (p1.visibility ?? 1) < 0.3 ||
            (p2.visibility ?? 1) < 0.3
          ) {
            return null;
          }

          return (
            <line
              key={index}
              x1={getX(p1.x)}
              y1={p1.y}
              x2={getX(p2.x)}
              y2={p2.y}
              stroke="#22c55e"
              strokeWidth="0.008"
              strokeLinecap="round"
            />
          );
        }
      )}

      {points.map((point, index) => {
        if (
          (point.visibility ?? 1) < 0.3
        ) {
          return null;
        }

        return (
          <circle
            key={index}
            cx={getX(point.x)}
            cy={point.y}
            r="0.014"
            fill="#22c55e"
            stroke="white"
            strokeWidth="0.004"
          />
        );
      })}
    </svg>
  );
}