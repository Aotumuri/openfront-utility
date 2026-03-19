import {
  cloneMatrix,
  createEmptyMatrix,
  getMatrixHeight,
  getMatrixWidth,
  type BinaryMatrix,
} from "../shared/patternCodec.js";
import { countNeighbors, type SymmetryProfile } from "./matrixMetrics.js";

export function fitMatrixToSize(matrix: BinaryMatrix, width: number, height: number) {
  const sourceWidth = getMatrixWidth(matrix);
  const sourceHeight = getMatrixHeight(matrix);
  const fitted = createEmptyMatrix(width, height);

  if (sourceWidth === 0 || sourceHeight === 0) {
    return fitted;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      fitted[y][x] = matrix[y % sourceHeight][x % sourceWidth] === 1 ? 1 : 0;
    }
  }

  return fitted;
}

export function cleanupMatrix(matrix: BinaryMatrix) {
  const cleaned = cloneMatrix(matrix);

  for (let pass = 0; pass < 2; pass++) {
    const snapshot = cloneMatrix(cleaned);

    for (let y = 0; y < getMatrixHeight(snapshot); y++) {
      for (let x = 0; x < getMatrixWidth(snapshot); x++) {
        const neighbors = countNeighbors(snapshot, x, y);
        if (snapshot[y][x] === 1 && neighbors <= 1) {
          cleaned[y][x] = 0;
        } else if (snapshot[y][x] === 0 && neighbors >= 5) {
          cleaned[y][x] = 1;
        }
      }
    }
  }

  return cleaned;
}

export function preserveSymmetry(
  matrix: BinaryMatrix,
  symmetry: SymmetryProfile,
  random: () => number
) {
  const mirrored = cloneMatrix(matrix);
  const width = getMatrixWidth(matrix);
  const height = getMatrixHeight(matrix);

  if (symmetry.vertical >= 0.8) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < Math.floor(width / 2); x++) {
        const value = random() < 0.5 ? mirrored[y][x] : mirrored[y][width - 1 - x];
        mirrored[y][x] = value;
        mirrored[y][width - 1 - x] = value;
      }
    }
  }

  if (symmetry.horizontal >= 0.8) {
    for (let y = 0; y < Math.floor(height / 2); y++) {
      for (let x = 0; x < width; x++) {
        const value = random() < 0.5 ? mirrored[y][x] : mirrored[height - 1 - y][x];
        mirrored[y][x] = value;
        mirrored[height - 1 - y][x] = value;
      }
    }
  }

  return mirrored;
}

export function mutateMatrix(matrix: BinaryMatrix, random: () => number, intensity: number) {
  const mutated = cloneMatrix(matrix);
  const flipRate = Math.min(0.16, 0.015 + intensity * 0.05);

  for (let y = 0; y < getMatrixHeight(mutated); y++) {
    for (let x = 0; x < getMatrixWidth(mutated); x++) {
      const neighbors = countNeighbors(mutated, x, y);
      const shouldFlip =
        random() < flipRate ||
        (mutated[y][x] === 1 && neighbors === 0 && random() < intensity * 0.7) ||
        (mutated[y][x] === 0 && neighbors >= 5 && random() < intensity * 0.35);

      if (shouldFlip) {
        mutated[y][x] = mutated[y][x] === 1 ? 0 : 1;
      }
    }
  }

  return mutated;
}

export function spliceMatrices(
  leftMatrix: BinaryMatrix,
  rightMatrix: BinaryMatrix,
  direction: "horizontal" | "vertical"
) {
  const width = getMatrixWidth(leftMatrix);
  const height = getMatrixHeight(leftMatrix);
  const merged = createEmptyMatrix(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const useLeft =
        direction === "horizontal" ? y < Math.floor(height / 2) : x < Math.floor(width / 2);
      const nextValue = useLeft ? leftMatrix[y]?.[x] : rightMatrix[y]?.[x];
      merged[y][x] = nextValue === 1 ? 1 : 0;
    }
  }

  return merged;
}

export function combineMatrices(
  a: BinaryMatrix,
  b: BinaryMatrix,
  mode: "overlay" | "xor"
) {
  const width = getMatrixWidth(a);
  const height = getMatrixHeight(a);
  const combined = createEmptyMatrix(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const left = a[y][x] === 1;
      const right = b[y][x] === 1;
      combined[y][x] = mode === "overlay" ? (left || right ? 1 : 0) : left !== right ? 1 : 0;
    }
  }

  return combined;
}
