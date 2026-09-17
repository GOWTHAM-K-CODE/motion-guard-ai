export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

export function average(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

export function round(
  value: number,
  decimals = 1
): number {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      value * multiplier
    ) / multiplier
  );
}

export function percentage(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) {
    return 0;
  }

  const result =
    ((value - min) /
      (max - min)) *
    100;

  return clamp(
    Math.round(result),
    0,
    100
  );
}

/**
 * Smooths a value using exponential moving average.
 *
 * alpha:
 * 0.1 → very smooth
 * 0.5 → moderate
 * 0.9 → follows changes quickly
 */
export function smoothValue(
  previous: number,
  current: number,
  alpha = 0.25
): number {
  return (
    previous +
    alpha *
      (current - previous)
  );
}

export function normalize(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) {
    return 0;
  }

  return clamp(
    (value - min) /
      (max - min),
    0,
    1
  );
}

export function calculateChange(
  previous: number,
  current: number
): number {
  if (previous === 0) {
    return 0;
  }

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
}

export function median(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [
    ...values,
  ].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(
      sorted.length / 2
    );

  if (
    sorted.length % 2 === 0
  ) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}