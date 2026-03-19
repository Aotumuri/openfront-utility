import {
  createEmptyMatrix,
  getMatrixHeight,
  getMatrixWidth,
  type BinaryMatrix,
} from "../shared/patternCodec.js";

export type SymmetryProfile = {
  vertical: number;
  horizontal: number;
};

export function countActiveCells(matrix: BinaryMatrix) {
  return matrix.reduce(
    (total, row) => total + row.reduce((rowTotal, cell) => rowTotal + (cell === 1 ? 1 : 0), 0),
    0
  );
}

export function countNeighbors(matrix: BinaryMatrix, x: number, y: number) {
  const height = getMatrixHeight(matrix);
  const width = getMatrixWidth(matrix);
  let neighbors = 0;

  for (let offsetY = -1; offsetY <= 1; offsetY++) {
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      if (offsetX === 0 && offsetY === 0) continue;
      const nextX = (x + offsetX + width) % width;
      const nextY = (y + offsetY + height) % height;
      neighbors += matrix[nextY]?.[nextX] === 1 ? 1 : 0;
    }
  }

  return neighbors;
}

export function countIsolatedPixels(matrix: BinaryMatrix) {
  let isolated = 0;

  for (let y = 0; y < getMatrixHeight(matrix); y++) {
    for (let x = 0; x < getMatrixWidth(matrix); x++) {
      if (matrix[y][x] !== 1) continue;
      if (countNeighbors(matrix, x, y) <= 1) {
        isolated += 1;
      }
    }
  }

  return isolated;
}

export function measureSymmetry(matrix: BinaryMatrix): SymmetryProfile {
  const width = getMatrixWidth(matrix);
  const height = getMatrixHeight(matrix);
  let verticalMatches = 0;
  let verticalTotal = 0;
  let horizontalMatches = 0;
  let horizontalTotal = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.floor(width / 2); x++) {
      verticalTotal += 1;
      if (matrix[y][x] === matrix[y][width - 1 - x]) {
        verticalMatches += 1;
      }
    }
  }

  for (let y = 0; y < Math.floor(height / 2); y++) {
    for (let x = 0; x < width; x++) {
      horizontalTotal += 1;
      if (matrix[y][x] === matrix[height - 1 - y][x]) {
        horizontalMatches += 1;
      }
    }
  }

  return {
    vertical: verticalTotal === 0 ? 1 : verticalMatches / verticalTotal,
    horizontal: horizontalTotal === 0 ? 1 : horizontalMatches / horizontalTotal,
  };
}

export function matrixSimilarity(a: BinaryMatrix, b: BinaryMatrix) {
  const width = Math.min(getMatrixWidth(a), getMatrixWidth(b));
  const height = Math.min(getMatrixHeight(a), getMatrixHeight(b));
  if (width === 0 || height === 0) return 0;

  let same = 0;
  let total = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      total += 1;
      if (a[y][x] === b[y][x]) {
        same += 1;
      }
    }
  }

  return same / total;
}

export function largestComponentRatio(matrix: BinaryMatrix) {
  const width = getMatrixWidth(matrix);
  const height = getMatrixHeight(matrix);
  const visited = createEmptyMatrix(width, height);
  const activeCells = countActiveCells(matrix);
  if (activeCells === 0) return 0;

  let best = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (matrix[y][x] !== 1 || visited[y][x] === 1) continue;

      let size = 0;
      const queue: Array<[number, number]> = [[x, y]];
      visited[y][x] = 1;

      while (queue.length > 0) {
        const [currentX, currentY] = queue.shift() as [number, number];
        size += 1;

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nextX = (currentX + dx + width) % width;
          const nextY = (currentY + dy + height) % height;
          if (matrix[nextY][nextX] !== 1 || visited[nextY][nextX] === 1) continue;
          visited[nextY][nextX] = 1;
          queue.push([nextX, nextY]);
        }
      }

      best = Math.max(best, size);
    }
  }

  return best / activeCells;
}
