import { cloneMatrix, decodePattern, type BinaryMatrix } from "../shared/patternCodec.js";
import { normalizeText } from "./text.js";

type RawPatternEntry = {
  name?: string;
  pattern?: string;
  description?: string;
  affiliateCode?: string | null;
  product?: unknown;
  colorPalettes?: unknown[];
};

export type DatasetFailure = {
  id: string;
  message: string;
};

export type DecodedDatasetEntry = {
  id: string;
  name: string;
  normalizedName: string;
  description: string;
  normalizedDescription: string;
  retrievalText: string;
  pattern: string;
  matrix: BinaryMatrix;
  width: number;
  height: number;
  scale: number;
};

export type LoadedDataset = {
  entries: DecodedDatasetEntry[];
  failures: DatasetFailure[];
  totalEntries: number;
  decodedEntries: number;
  failedEntries: number;
  error: string | null;
};

function getPatternsRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Dataset root must be an object.");
  }

  const patterns = (value as { patterns?: unknown }).patterns;
  if (!patterns || typeof patterns !== "object" || Array.isArray(patterns)) {
    throw new Error("Dataset JSON must contain a patterns object.");
  }

  return patterns as Record<string, RawPatternEntry>;
}

export function loadDatasetFromJson(input: string): LoadedDataset {
  if (!input.trim()) {
    return {
      entries: [],
      failures: [],
      totalEntries: 0,
      decodedEntries: 0,
      failedEntries: 0,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(input) as unknown;
    const patterns = getPatternsRecord(parsed);
    const entries: DecodedDatasetEntry[] = [];
    const failures: DatasetFailure[] = [];

    for (const [id, rawEntry] of Object.entries(patterns)) {
      try {
        if (!rawEntry || typeof rawEntry !== "object") {
          throw new Error("Entry must be an object.");
        }

        const name =
          typeof rawEntry.name === "string" && rawEntry.name.trim()
            ? rawEntry.name.trim()
            : id;
        const description =
          typeof rawEntry.description === "string" ? rawEntry.description.trim() : "";
        const pattern =
          typeof rawEntry.pattern === "string" ? rawEntry.pattern.trim() : "";

        if (!pattern) {
          throw new Error("Missing pattern string.");
        }

        const decoded = decodePattern(pattern);
        const normalizedName = normalizeText(name);
        const normalizedDescription = normalizeText(description);

        entries.push({
          id,
          name,
          normalizedName,
          description,
          normalizedDescription,
          retrievalText: [normalizedName, normalizedDescription]
            .filter(Boolean)
            .join(" "),
          pattern,
          matrix: decoded.matrix,
          width: decoded.width,
          height: decoded.height,
          scale: decoded.scale,
        });
      } catch (error) {
        failures.push({
          id,
          message: (error as Error).message,
        });
      }
    }

    return {
      entries,
      failures,
      totalEntries: entries.length + failures.length,
      decodedEntries: entries.length,
      failedEntries: failures.length,
      error: null,
    };
  } catch (error) {
    return {
      entries: [],
      failures: [],
      totalEntries: 0,
      decodedEntries: 0,
      failedEntries: 0,
      error: (error as Error).message,
    };
  }
}

export function buildTrainingDataset(entries: DecodedDatasetEntry[]) {
  // This export keeps decoded matrices and normalized text so the MVP data can
  // be reused for offline training once a real text-to-pattern model exists.
  return entries.map(entry => ({
    text: entry.normalizedName || entry.normalizedDescription || entry.id,
    name: entry.name,
    description: entry.description,
    width: entry.width,
    height: entry.height,
    matrix: cloneMatrix(entry.matrix),
  }));
}
