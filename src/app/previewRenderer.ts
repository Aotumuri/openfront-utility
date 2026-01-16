type RgbColor = { r: number; g: number; b: number };

type PreviewRendererOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  primaryColorInput: HTMLInputElement;
  secondaryColorInput: HTMLInputElement;
};

function hexToRgb(hex: string): RgbColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

export function createPreviewRenderer(options: PreviewRendererOptions) {
  const { canvas, context, primaryColorInput, secondaryColorInput } = options;

  return function renderPreview(pattern: string) {
    const decoder = new PatternDecoder(pattern);
    const width = 512;
    const height = 512;
    canvas.width = width;
    canvas.height = height;

    const primaryColor = primaryColorInput.value;
    const secondaryColor = secondaryColorInput.value;
    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    const imageData = context.createImageData(width, height);
    const data = imageData.data;
    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = 255;
        if (decoder.isSet(x, y)) {
          data[i++] = primaryRgb.r;
          data[i++] = primaryRgb.g;
          data[i++] = primaryRgb.b;
        } else {
          data[i++] = secondaryRgb.r;
          data[i++] = secondaryRgb.g;
          data[i++] = secondaryRgb.b;
        }
        data[i++] = alpha;
      }
    }

    context.putImageData(imageData, 0, 0);
  };
}
