import assert from "node:assert/strict";
import { buildTrainingDataset, loadDatasetFromJson } from "../docs/ai/dataset.js";
import { generatePatternFromPrompt } from "../docs/ai/generator.js";
import { decodePattern } from "../docs/shared/patternCodec.js";

const validPattern =
  "AAEiAAAAAAAAAAAAAAAAAAAAAIDD8YnweTiiD5FIYEIgEpkIRCKBCoFIpCIQeTwyPB6RjEAkEIgQKEQiApFAIEIgEYkIOAKfCIGIIyIAAAAAAAAAAAA";

const dataset = loadDatasetFromJson(
  JSON.stringify({
    patterns: {
      good: {
        name: "defender_of_openfront",
        pattern: validPattern,
        description: "black_white crest",
      },
      bad: {
        name: "broken_entry",
        pattern: "###",
      },
    },
  })
);

assert.equal(dataset.totalEntries, 2, "dataset should count all entries");
assert.equal(dataset.decodedEntries, 1, "dataset should keep valid decodes");
assert.equal(dataset.failedEntries, 1, "dataset should keep invalid pattern failures");
assert.equal(dataset.entries[0].normalizedName, "defender of openfront");

const promptOnly = generatePatternFromPrompt("minimal shield banner", {
  datasetEntries: [],
  candidateCount: 4,
});
assert.ok(promptOnly.candidates.length >= 3, "prompt-only fallback should emit candidates");

const retrieved = generatePatternFromPrompt("defender of openfront", {
  datasetEntries: dataset.entries,
  candidateCount: 6,
});
assert.ok(retrieved.matches.length >= 1, "retrieval should match normalized names");
assert.ok(retrieved.candidates.length >= 4, "retrieval pipeline should emit ranked candidates");

retrieved.candidates.forEach((candidate) => {
  const decoded = decodePattern(candidate.pattern);
  assert.equal(decoded.width, candidate.width);
  assert.equal(decoded.height, candidate.height);
});

const trainingDataset = buildTrainingDataset(dataset.entries);
assert.equal(trainingDataset.length, 1, "training export should include decoded entries only");
assert.equal(trainingDataset[0].text, "defender of openfront");
assert.equal(trainingDataset[0].matrix.length, dataset.entries[0].height);

console.log("ok: ai dataset loading, generation, and training export verified");
