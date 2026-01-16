type PatternLoaderOptions = {
  base64Input: HTMLInputElement;
  tileWidthInput: HTMLInputElement;
  tileHeightInput: HTMLInputElement;
  tileWidthValue: HTMLInputElement;
  tileHeightValue: HTMLInputElement;
  scaleInput: HTMLInputElement;
  scaleValue: HTMLSpanElement;
  onPatternLoaded: (pattern: number[][]) => void;
};

export function createPatternLoader(options: PatternLoaderOptions) {
  const {
    base64Input,
    tileWidthInput,
    tileHeightInput,
    tileWidthValue,
    tileHeightValue,
    scaleInput,
    scaleValue,
    onPatternLoaded,
  } = options;

  return function loadFromBase64() {
    const base64 = base64Input.value;
    if (!base64) return;
    let decoder: PatternDecoder;
    try {
      decoder = new PatternDecoder(base64);
    } catch (e) {
      alert((e as Error).message);
      return;
    }
    const tileWidth = decoder.getTileWidth();
    const tileHeight = decoder.getTileHeight();
    const scale = decoder.getScale();
    tileWidthInput.value = tileWidth.toString();
    tileHeightInput.value = tileHeight.toString();
    tileWidthValue.value = tileWidthInput.value;
    tileHeightValue.value = tileHeightInput.value;
    scaleInput.value = scale.toString();
    scaleValue.textContent = String(1 << parseInt(scaleInput.value));
    const pattern: number[][] = new Array(tileHeight);
    for (let y = 0; y < tileHeight; y++) {
      const row: number[] = new Array(tileWidth);
      for (let x = 0; x < tileWidth; x++) {
        row[x] = decoder.isSet(x << scale, y << scale) ? 1 : 0;
      }
      pattern[y] = row;
    }
    onPatternLoaded(pattern);
  };
}
