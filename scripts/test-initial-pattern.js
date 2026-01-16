import assert from "node:assert/strict";
import { generatePatternBase64 } from "../docs/app/patternEncoding.js";
import { initialPattern } from "../docs/app/initialPattern.js";

if (typeof globalThis.btoa !== "function") {
  globalThis.btoa = (input) => Buffer.from(input, "binary").toString("base64");
}

const expected =
  "AAEiAAAAAAAAAAAAAAAAAAAAAIDD8YnweTiiD5FIYEIgEpkIRCKBCoFIpCIQeTwyPB6RjEAkEIgQKEQiApFAIEIgEYkIOAKfCIGIIyIAAAAAAAAAAAA";

const width = 66;
const height = 10;
const scale = 1;

assert.ok(
  initialPattern.length >= height &&
    initialPattern.every((row) => row.length >= width),
  "Initial pattern must cover the default width/height"
);

const actual = generatePatternBase64(initialPattern, width, height, scale);

assert.equal(
  actual,
  expected,
  "Initial pattern should encode to the expected base64 payload"
);

console.log("ok: initial pattern base64 matches expected value");
