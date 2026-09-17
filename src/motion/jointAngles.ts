export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * Calculates the angle at point B formed by:
 *
 * A -------- B -------- C
 *
 * Returns an angle between 0° and 180°.
 */
export function calculateAngle(
  a: Point3D,
  b: Point3D,
  c: Point3D
): number {
  const vectorBA = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: (a.z ?? 0) - (b.z ?? 0),
  };

  const vectorBC = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: (c.z ?? 0) - (b.z ?? 0),
  };

  const magnitudeBA = Math.sqrt(
    vectorBA.x ** 2 +
      vectorBA.y ** 2 +
      vectorBA.z ** 2
  );

  const magnitudeBC = Math.sqrt(
    vectorBC.x ** 2 +
      vectorBC.y ** 2 +
      vectorBC.z ** 2
  );

  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return 0;
  }

  const dotProduct =
    vectorBA.x * vectorBC.x +
    vectorBA.y * vectorBC.y +
    vectorBA.z * vectorBC.z;

  const cosine =
    dotProduct / (magnitudeBA * magnitudeBC);

  const clampedCosine = Math.max(
    -1,
    Math.min(1, cosine)
  );

  const angle =
    Math.acos(clampedCosine) * (180 / Math.PI);

  return Math.round(angle * 10) / 10;
}

/**
 * Calculates the knee angle.
 *
 * Hip → Knee → Ankle
 */
export function calculateKneeAngle(
  hip: Point3D,
  knee: Point3D,
  ankle: Point3D
): number {
  return calculateAngle(hip, knee, ankle);
}

/**
 * Calculates the hip angle.
 *
 * Shoulder → Hip → Knee
 */
export function calculateHipAngle(
  shoulder: Point3D,
  hip: Point3D,
  knee: Point3D
): number {
  return calculateAngle(shoulder, hip, knee);
}

/**
 * Calculates the elbow angle.
 *
 * Shoulder → Elbow → Wrist
 */
export function calculateElbowAngle(
  shoulder: Point3D,
  elbow: Point3D,
  wrist: Point3D
): number {
  return calculateAngle(
    shoulder,
    elbow,
    wrist
  );
}

/**
 * Calculates the shoulder angle.
 *
 * Hip → Shoulder → Elbow
 */
export function calculateShoulderAngle(
  hip: Point3D,
  shoulder: Point3D,
  elbow: Point3D
): number {
  return calculateAngle(
    hip,
    shoulder,
    elbow
  );
}

/**
 * Calculates the angle of the torso relative
 * to a vertical reference.
 */
export function calculateTorsoAngle(
  shoulder: Point3D,
  hip: Point3D
): number {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;

  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) *
    (180 / Math.PI);

  return Math.round(angle * 10) / 10;
}

/**
 * Calculates the Euclidean distance between
 * two pose landmarks.
 */
export function calculateDistance(
  a: Point3D,
  b: Point3D
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);

  return Math.sqrt(
    dx ** 2 +
      dy ** 2 +
      dz ** 2
  );
}
