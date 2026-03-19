import { cloneMatrix, createEmptyMatrix, encodeMatrixToPattern, type BinaryMatrix } from "../shared/patternCodec.js";
import type { DecodedDatasetEntry } from "./dataset.js";
import {
  cleanupMatrix,
  combineMatrices,
  fitMatrixToSize,
  mutateMatrix,
  preserveSymmetry,
  spliceMatrices,
} from "./matrixOps.js";
import { measureSymmetry } from "./matrixMetrics.js";
import { retrieveMatchingPatterns, type RetrievedMatch } from "./retrieval.js";
import { createSeededRandom } from "./rng.js";
import { scoreCandidate } from "./scoring.js";
import { createTextSeed, normalizeText, tokenizeText } from "./text.js";

export type GeneratedCandidate = {
  id: string;
  title: string;
  strategy: string;
  pattern: string;
  matrix: BinaryMatrix;
  width: number;
  height: number;
  scale: number;
  score: number;
  sources: string[];
};

export type GeneratePatternContext = {
  datasetEntries?: DecodedDatasetEntry[];
  defaultWidth?: number;
  defaultHeight?: number;
  defaultScale?: number;
  seedOffset?: number;
  candidateCount?: number;
};

export type GeneratePatternResult = {
  normalizedPrompt: string;
  matches: RetrievedMatch[];
  candidates: GeneratedCandidate[];
};

function inferDimensions(matches: RetrievedMatch[], context: GeneratePatternContext) {
  const firstMatch = matches[0]?.entry;
  return {
    width: firstMatch?.width ?? context.defaultWidth ?? 66,
    height: firstMatch?.height ?? context.defaultHeight ?? 10,
    scale: firstMatch?.scale ?? context.defaultScale ?? 1,
  };
}

function stamp(matrix: BinaryMatrix, x: number, y: number, random: () => number) {
  for (const [dx, dy] of [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nextY = y + dy;
    const nextX = x + dx;
    if (matrix[nextY]?.[nextX] === undefined) continue;
    matrix[nextY][nextX] = random() > 0.2 ? 1 : matrix[nextY][nextX];
  }
}

function createPromptSeededMatrix(
  normalizedPrompt: string,
  width: number,
  height: number,
  random: () => number
) {
  const matrix = createEmptyMatrix(width, height);
  const tokens = tokenizeText(normalizedPrompt);
  const centerY = Math.floor(height / 2);
  const preferredColumns = Math.max(2, Math.floor(width / 6));

  for (let index = 0; index < Math.max(tokens.length, 3); index++) {
    const token = tokens[index] ?? normalizedPrompt;
    const tokenSeed = createTextSeed(`${token}:${index}`);
    const anchorX = tokenSeed % width;
    const anchorY = (tokenSeed >>> 8) % height;
    stamp(matrix, anchorX, anchorY, random);
    stamp(matrix, Math.floor((anchorX + preferredColumns) % width), centerY, random);
  }

  for (let x = 0; x < width; x++) {
    if (random() < 0.18) {
      matrix[centerY][x] = 1;
    }
  }

  const symmetry = normalizedPrompt.includes("shield") || normalizedPrompt.includes("defender");
  if (symmetry) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < Math.floor(width / 2); x++) {
        matrix[y][width - 1 - x] = matrix[y][x];
      }
    }
  }

  return cleanupMatrix(matrix);
}

function prepareCandidate(
  matrix: BinaryMatrix,
  strategy: string,
  sources: string[],
  scale: number,
  referenceMatrix: BinaryMatrix,
  sourceSymmetry: ReturnType<typeof measureSymmetry>,
  nextId: number
): GeneratedCandidate {
  const cleaned = cleanupMatrix(matrix);
  const scored = scoreCandidate(cleaned, {
    referenceMatrix,
    sourceSymmetry,
  });

  return {
    id: `candidate-${nextId}`,
    title: strategy,
    strategy,
    pattern: encodeMatrixToPattern(cleaned, { scale }),
    matrix: cleaned,
    width: cleaned[0]?.length ?? 0,
    height: cleaned.length,
    scale,
    score: scored,
    sources,
  };
}

export function generatePatternFromPrompt(
  prompt: string,
  context: GeneratePatternContext = {}
): GeneratePatternResult {
  const normalizedPrompt = normalizeText(prompt);
  if (!normalizedPrompt) {
    return { normalizedPrompt, matches: [], candidates: [] };
  }

  const matches = retrieveMatchingPatterns(prompt, context.datasetEntries ?? []);
  const { width, height, scale } = inferDimensions(matches, context);
  const random = createSeededRandom(
    createTextSeed(normalizedPrompt) ^ (context.seedOffset ?? 0)
  );
  const fallbackBase = createPromptSeededMatrix(normalizedPrompt, width, height, random);
  const primaryMatrix = matches[0]
    ? fitMatrixToSize(matches[0].entry.matrix, width, height)
    : fallbackBase;
  const secondaryMatrix = matches[1]
    ? fitMatrixToSize(matches[1].entry.matrix, width, height)
    : mutateMatrix(fallbackBase, random, 0.32);
  const referenceMatrix = cloneMatrix(primaryMatrix);
  const sourceSymmetry = measureSymmetry(primaryMatrix);

  // Future learned model hook:
  // replace the mutation/hybridization block below with a trained adapter that
  // returns matrix candidates while keeping this function's public shape stable.
  const candidateDrafts = [
    {
      strategy: matches[0] ? "Retrieved + cleanup" : "Prompt seeded base",
      matrix: primaryMatrix,
      sources: matches[0] ? [matches[0].entry.name] : ["Prompt seed"],
    },
    {
      strategy: "Light mutation",
      matrix: mutateMatrix(primaryMatrix, random, 0.28),
      sources: matches[0] ? [matches[0].entry.name] : ["Prompt seed"],
    },
    {
      strategy: "Strong mutation",
      matrix: mutateMatrix(primaryMatrix, random, 0.52),
      sources: matches[0] ? [matches[0].entry.name] : ["Prompt seed"],
    },
    {
      strategy: "Top-two hybrid",
      matrix: combineMatrices(primaryMatrix, secondaryMatrix, "overlay"),
      sources: matches.slice(0, 2).map(match => match.entry.name),
    },
    {
      strategy: "Splice top / bottom",
      matrix: spliceMatrices(primaryMatrix, secondaryMatrix, "horizontal"),
      sources: matches.slice(0, 2).map(match => match.entry.name),
    },
    {
      strategy: "Splice left / right",
      matrix: spliceMatrices(primaryMatrix, secondaryMatrix, "vertical"),
      sources: matches.slice(0, 2).map(match => match.entry.name),
    },
    {
      strategy: "Overlay cleanup",
      matrix: preserveSymmetry(
        combineMatrices(primaryMatrix, secondaryMatrix, "overlay"),
        sourceSymmetry,
        random
      ),
      sources: matches.slice(0, 2).map(match => match.entry.name),
    },
    {
      strategy: "XOR contrast",
      matrix: combineMatrices(primaryMatrix, secondaryMatrix, "xor"),
      sources: matches.slice(0, 2).map(match => match.entry.name),
    },
  ];

  const deduped = new Map<string, GeneratedCandidate>();
  candidateDrafts.forEach((draft, index) => {
    const candidate = prepareCandidate(
      draft.matrix,
      draft.strategy,
      draft.sources.length > 0 ? draft.sources : ["Prompt seed"],
      scale,
      referenceMatrix,
      sourceSymmetry,
      index
    );
    if (!Number.isFinite(candidate.score)) return;
    deduped.set(candidate.pattern, candidate);
  });

  const candidates = Array.from(deduped.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, context.candidateCount ?? 6);

  return {
    normalizedPrompt,
    matches,
    candidates,
  };
}
