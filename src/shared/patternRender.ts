import {
  decodePattern,
  getMatrixHeight,
  getMatrixWidth,
  sampleMatrixCell,
  type BinaryMatrix,
} from "./patternCodec.js";

type RgbColor = { r: number; g: number; b: number };

type RenderMatrixOptions = {
  canvas: HTMLCanvasElement;
  context?: CanvasRenderingContext2D | null;
  matrix: BinaryMatrix;
  scale?: number;
  primaryColor: string;
  secondaryColor: string;
  width?: number;
  height?: number;
};

type RenderPatternOptions = Omit<RenderMatrixOptions, "matrix" | "scale"> & {
  pattern: string;
};

function hexToRgb(hex: string): RgbColor {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

export function renderMatrixToCanvas(options: RenderMatrixOptions) {
  const {
    canvas,
    context = canvas.getContext("2d"),
    matrix,
    scale = 0,
    primaryColor,
    secondaryColor,
  } = options;

  if (!context) {
    throw new Error("Unable to obtain 2D canvas context");
  }

  const width = options.width ?? Math.max(getMatrixWidth(matrix) << scale, 1);
  const height = options.height ?? Math.max(getMatrixHeight(matrix) << scale, 1);

  canvas.width = width;
  canvas.height = height;

  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);
  const imageData = context.createImageData(width, height);
  const data = imageData.data;
  let index = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isSet = sampleMatrixCell(matrix, scale, x, y) === 1;
      const color = isSet ? secondaryRgb : primaryRgb;
      data[index++] = color.r;
      data[index++] = color.g;
      data[index++] = color.b;
      data[index++] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
}

export function renderPatternToCanvas(options: RenderPatternOptions) {
  const decoded = decodePattern(options.pattern);
  renderMatrixToCanvas({
    ...options,
    matrix: decoded.matrix,
    scale: decoded.scale,
  });
}
