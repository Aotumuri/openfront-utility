type PreviewRendererOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  primaryColorInput: HTMLInputElement;
  secondaryColorInput: HTMLInputElement;
};
import { renderPatternToCanvas } from "../shared/patternRender.js";

export function createPreviewRenderer(options: PreviewRendererOptions) {
  const { canvas, context, primaryColorInput, secondaryColorInput } = options;

  return function renderPreview(pattern: string) {
    renderPatternToCanvas({
      canvas,
      context,
      pattern,
      primaryColor: primaryColorInput.value,
      secondaryColor: secondaryColorInput.value,
      width: 512,
      height: 512,
    });
  };
}
