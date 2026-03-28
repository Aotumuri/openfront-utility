export function shiftPatternLeft(pattern: number[][]) {
  return pattern.map((row) => row.slice(1).concat(row[0] ?? 0));
}

export function shiftPatternRight(pattern: number[][]) {
  return pattern.map((row) => {
    const last = row[row.length - 1] ?? 0;
    return [last, ...row.slice(0, -1)];
  });
}

export function shiftPatternDown(pattern: number[][]) {
  const height = pattern.length;
  const width = pattern[0]?.length ?? 0;
  const nextPattern = Array.from({ length: height }, () => new Array(width).fill(0));

  for (let x = 0; x < width; x++) {
    nextPattern[0][x] = pattern[height - 1]?.[x] ?? 0;
    for (let y = 1; y < height; y++) {
      nextPattern[y][x] = pattern[y - 1]?.[x] ?? 0;
    }
  }

  return nextPattern;
}

export function shiftPatternUp(pattern: number[][]) {
  const height = pattern.length;
  const width = pattern[0]?.length ?? 0;
  const nextPattern = Array.from({ length: height }, () => new Array(width).fill(0));

  for (let x = 0; x < width; x++) {
    nextPattern[height - 1][x] = pattern[0]?.[x] ?? 0;
    for (let y = 0; y < height - 1; y++) {
      nextPattern[y][x] = pattern[y + 1]?.[x] ?? 0;
    }
  }

  return nextPattern;
}

export function invertPattern(pattern: number[][]) {
  return pattern.map((row) => row.map((cell) => (cell === 1 ? 0 : 1)));
}
