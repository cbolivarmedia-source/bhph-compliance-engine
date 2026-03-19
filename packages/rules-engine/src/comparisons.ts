import type { ComparisonOp } from './types.js';

export function passesComparison(
  actual: number,
  op: ComparisonOp,
  threshold: number | null,
  min: number | null,
  max: number | null
): boolean {
  switch (op) {
    case 'lte': return actual <= threshold!;
    case 'gte': return actual >= threshold!;
    case 'lt':  return actual < threshold!;
    case 'gt':  return actual > threshold!;
    case 'eq':  return actual === threshold!;
    case 'between': return actual >= min! && actual <= max!;
  }
}
