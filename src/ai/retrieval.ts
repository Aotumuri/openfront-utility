import type { DecodedDatasetEntry } from "./dataset.js";
import { normalizeText, tokenizeText } from "./text.js";

export type RetrievedMatch = {
  entry: DecodedDatasetEntry;
  score: number;
  reasons: string[];
};

function buildBigrams(value: string) {
  if (value.length < 2) return new Set(value ? [value] : []);
  const bigrams = new Set<string>();
  for (let index = 0; index < value.length - 1; index++) {
    bigrams.add(value.slice(index, index + 2));
  }
  return bigrams;
}

function scoreBigrams(a: string, b: string) {
  const aBigrams = buildBigrams(a);
  const bBigrams = buildBigrams(b);
  if (aBigrams.size === 0 || bBigrams.size === 0) return 0;

  let overlap = 0;
  for (const bigram of aBigrams) {
    if (bBigrams.has(bigram)) {
      overlap += 1;
    }
  }
  return overlap / Math.max(aBigrams.size, bBigrams.size);
}

export function retrieveMatchingPatterns(
  prompt: string,
  entries: DecodedDatasetEntry[],
  limit = 5
) {
  const normalizedPrompt = normalizeText(prompt);
  const tokens = tokenizeText(normalizedPrompt);

  return entries
    .map<RetrievedMatch>((entry) => {
      let score = 0;
      const reasons: string[] = [];

      if (entry.normalizedName === normalizedPrompt && normalizedPrompt) {
        score += 14;
        reasons.push("exact name");
      }

      if (normalizedPrompt && entry.normalizedName.includes(normalizedPrompt)) {
        score += 8;
        reasons.push("name substring");
      }

      if (normalizedPrompt && entry.normalizedDescription.includes(normalizedPrompt)) {
        score += 4;
        reasons.push("description substring");
      }

      for (const token of tokens) {
        if (!token) continue;
        if (entry.normalizedName.split(" ").includes(token)) {
          score += 3;
          continue;
        }
        if (entry.normalizedDescription.split(" ").includes(token)) {
          score += 1.5;
        }
      }

      const textSimilarity = scoreBigrams(normalizedPrompt, entry.retrievalText);
      if (textSimilarity > 0) {
        score += textSimilarity * 6;
        reasons.push("text similarity");
      }

      return { entry, score, reasons };
    })
    .filter(match => match.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
