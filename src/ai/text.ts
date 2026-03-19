export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeText(value: string) {
  const normalized = normalizeText(value);
  return normalized ? Array.from(new Set(normalized.split(" "))) : [];
}

export function slugifyText(value: string) {
  const normalized = normalizeText(value);
  return normalized ? normalized.replace(/\s+/g, "_") : "generated_pattern";
}

export function createTextSeed(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
