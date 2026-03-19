export function createSeededRandom(seed: number) {
  let state = (seed >>> 0) || 1;

  return function nextRandom() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) & 0xffffffff) / 0x100000000;
  };
}
