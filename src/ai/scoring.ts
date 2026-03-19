import type { BinaryMatrix } from "../shared/patternCodec.js";
import {
  countActiveCells,
  countIsolatedPixels,
  largestComponentRatio,
  matrixSimilarity,
  measureSymmetry,
} from "./matrixMetrics.js";
import {
  type SymmetryProfile,
} from "./matrixMetrics.js";

type ScoreContext = {
  referenceMatrix?: BinaryMatrix | null;
  sourceSymmetry?: SymmetryProfile | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function scoreCandidate(matrix: BinaryMatrix, context: ScoreContext = {}) {
  const width = matrix[0]?.length ?? 0;
  const height = matrix.length;
  const totalCells = width * height;
  if (totalCells === 0) return Number.NEGATIVE_INFINITY;

  const activeCells = countActiveCells(matrix);
  if (activeCells === 0 || activeCells === totalCells) {
    return Number.NEGATIVE_INFINITY;
  }

  const density = activeCells / totalCells;
  const densityScore = clamp(1 - Math.abs(density - 0.32) / 0.32, 0, 1);
  const isolatedRatio = countIsolatedPixels(matrix) / activeCells;
  const connectedness = largestComponentRatio(matrix);
  const symmetry = measureSymmetry(matrix);

  let score = densityScore * 35;
  score += (1 - isolatedRatio) * 25;
  score += connectedness * 20;
  score += Math.max(symmetry.vertical, symmetry.horizontal) * 6;

  if (context.referenceMatrix) {
    const similarity = matrixSimilarity(matrix, context.referenceMatrix);
    score += (1 - Math.abs(similarity - 0.58) / 0.58) * 10;
  }

  if (context.sourceSymmetry) {
    score +=
      (1 - Math.abs(symmetry.vertical - context.sourceSymmetry.vertical)) * 4;
    score +=
      (1 - Math.abs(symmetry.horizontal - context.sourceSymmetry.horizontal)) * 4;
  }

  return Number(score.toFixed(2));
}
