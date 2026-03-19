import {
  decodePattern,
  decodePatternToMatrix,
  encodeMatrixToPattern,
} from "../shared/patternCodec.js";

export function generatePatternBase64(
  pattern: number[][],
  width: number,
  height: number,
  scale: number
): string {
  return encodeMatrixToPattern(pattern, { width, height, scale });
}

export function decodePatternBase64(base64: string) {
  const decoded = decodePattern(base64);
  return {
    pattern: decoded.matrix,
    tileWidth: decoded.width,
    tileHeight: decoded.height,
    scale: decoded.scale,
  };
}

export { decodePatternToMatrix, encodeMatrixToPattern };
