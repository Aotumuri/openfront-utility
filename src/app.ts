import { initColorPresetControls } from "./app/colorPresets.js";
import { createDrawingTools } from "./app/drawingTools.js";
import { setupGridGuides } from "./app/gridGuides.js";
import { createGridManager } from "./app/gridManager.js";
import { initialPattern } from "./app/initialPattern.js";
import {
  decodePatternBase64,
  generatePatternBase64,
} from "./app/patternEncoding.js";
import { createPatternLoader } from "./app/patternLoader.js";
import { createPreviewRenderer } from "./app/previewRenderer.js";
import { createToolState } from "./app/toolState.js";
import { createHistoryManager } from "./app/undoRedo.js";

document.addEventListener("DOMContentLoaded", () => {
  const toolbox = document.getElementById("toolbox");
  const base64Input = document.getElementById(
    "base64Input"
  ) as HTMLInputElement;
  const toolPenBtn = document.getElementById("tool-pen") as HTMLButtonElement;
  const penSizeInput = document.getElementById(
    "pen-size"
  ) as HTMLInputElement;
  const toolFillBtn = document.getElementById("tool-fill") as HTMLButtonElement;
  const toolStarBtn = document.getElementById("tool-star") as HTMLButtonElement;
  const toolCircleBtn = document.getElementById(
    "tool-circle"
  ) as HTMLButtonElement;
  const starSizeInput = document.getElementById(
    "star-size"
  ) as HTMLInputElement;
  const circleSizeInput = document.getElementById(
    "circle-size"
  ) as HTMLInputElement;
  const circleFillInput = document.getElementById(
    "circle-fill"
  ) as HTMLInputElement;
  const loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  const tileWidthInput = document.getElementById(
    "tileWidth"
  ) as HTMLInputElement;
  const tileWidthValue = document.getElementById(
    "tileWidth-value"
  ) as HTMLInputElement;
  const tileHeightInput = document.getElementById(
    "tileHeight"
  ) as HTMLInputElement;
  const tileHeightValue = document.getElementById(
    "tileHeight-value"
  ) as HTMLInputElement;
  const scaleInput = document.getElementById("scale") as HTMLInputElement;
  const scaleValue = document.getElementById("scale-value") as HTMLSpanElement;
  const clearGridBtn = document.getElementById(
    "clearGridBtn"
  ) as HTMLButtonElement;
  const undoBtn = document.getElementById("undoBtn") as HTMLButtonElement;
  const redoBtn = document.getElementById("redoBtn") as HTMLButtonElement;
  const shiftUpBtn = document.getElementById("shiftUpBtn") as HTMLButtonElement;
  const shiftLeftBtn = document.getElementById(
    "shiftLeftBtn"
  ) as HTMLButtonElement;
  const shiftRightBtn = document.getElementById(
    "shiftRightBtn"
  ) as HTMLButtonElement;
  const shiftDownBtn = document.getElementById(
    "shiftDownBtn"
  ) as HTMLButtonElement;
  const gridDiv = document.getElementById("grid")!;
  const outputTextarea = document.getElementById(
    "output"
  ) as HTMLTextAreaElement;
  const copyOutputBtn = document.getElementById(
    "copyOutputBtn"
  ) as HTMLButtonElement;
  const previewCanvas = document.getElementById("preview") as HTMLCanvasElement;
  const previewPrimaryColorInput = document.getElementById(
    "previewPrimaryColor"
  ) as HTMLInputElement;
  const previewSecondaryColorInput = document.getElementById(
    "previewSecondaryColor"
  ) as HTMLInputElement;
  const swapColorsBtn = document.getElementById(
    "swapColorsBtn"
  ) as HTMLButtonElement;
  const colorPresetContainer = document.getElementById(
    "colorPresetContainer"
  ) as HTMLDivElement;

  if (!colorPresetContainer) {
    throw new Error("Missing color preset container");
  }

  const previewContext = previewCanvas.getContext("2d");
  if (!previewContext) throw new Error("2D context not supported");

  let handleGuideChange = () => {};
  const guideState = setupGridGuides(toolbox, () => handleGuideChange());

  const toolState = createToolState({
    toolPenBtn,
    toolFillBtn,
    toolStarBtn,
    toolCircleBtn,
    penSizeInput,
    starSizeInput,
    circleSizeInput,
    circleFillInput,
  });

  const drawingTools = createDrawingTools({
    gridDiv,
    getTileWidth: () => parseInt(tileWidthInput.value),
    getTileHeight: () => parseInt(tileHeightInput.value),
  });

  let updateOutput = () => {};
  const gridManager = createGridManager({
    gridDiv,
    tileWidthInput,
    tileHeightInput,
    tileWidthValue,
    tileHeightValue,
    shiftUpBtn,
    shiftDownBtn,
    shiftLeftBtn,
    shiftRightBtn,
    initialPattern,
    guideState,
    toolState,
    drawingTools,
    onPatternChange: () => updateOutput(),
  });
  handleGuideChange = () => gridManager.generateGrid();

  const renderPreview = createPreviewRenderer({
    canvas: previewCanvas,
    context: previewContext,
    primaryColorInput: previewPrimaryColorInput,
    secondaryColorInput: previewSecondaryColorInput,
  });

  const historyManager = createHistoryManager();
  let isApplyingHistory = false;

  const updateHistoryButtons = () => {
    undoBtn.disabled = !historyManager.canUndo();
    redoBtn.disabled = !historyManager.canRedo();
  };

  const applyHistoryState = (base64: string) => {
    let decoded;
    try {
      decoded = decodePatternBase64(base64);
    } catch (error) {
      console.warn("Failed to decode history state", error);
      return;
    }
    const { pattern, tileWidth, tileHeight, scale } = decoded;
    tileWidthInput.value = tileWidth.toString();
    tileHeightInput.value = tileHeight.toString();
    tileWidthValue.value = tileWidthInput.value;
    tileHeightValue.value = tileHeightInput.value;
    scaleInput.value = scale.toString();
    scaleValue.textContent = String(1 << parseInt(scaleInput.value));
    isApplyingHistory = true;
    gridManager.generateGrid(pattern);
    isApplyingHistory = false;
  };

  updateOutput = () => {
    const pattern = gridManager.getCurrentPattern();
    const scale = parseInt(scaleInput.value);
    const base64 = generatePatternBase64(
      pattern,
      gridManager.getTileWidth(),
      gridManager.getTileHeight(),
      scale
    );
    outputTextarea.value = base64;
    renderPreview(base64);
    window.history.replaceState(null, "", "#" + base64);
    if (!isApplyingHistory) {
      historyManager.record(base64);
    }
    updateHistoryButtons();
  };

  scaleInput.addEventListener("input", () => {
    scaleValue.textContent = String(1 << parseInt(scaleInput.value));
    updateOutput();
  });

  const loadFromBase64 = createPatternLoader({
    base64Input,
    tileWidthInput,
    tileHeightInput,
    tileWidthValue,
    tileHeightValue,
    scaleInput,
    scaleValue,
    onPatternLoaded: (pattern) => gridManager.generateGrid(pattern),
  });

  const hash = window.location.hash;
  if (hash.startsWith("#")) {
    base64Input.value = hash.slice(1);
    setTimeout(loadFromBase64, 0);
  }

  const colorPresetControls = initColorPresetControls({
    container: colorPresetContainer,
    primaryColorInput: previewPrimaryColorInput,
    secondaryColorInput: previewSecondaryColorInput,
    onChange: () => updateOutput(),
  });

  function copyOutput() {
    outputTextarea.select();
    document.execCommand("copy");
  }

  loadBtn.onclick = loadFromBase64;
  clearGridBtn.onclick = gridManager.clearGrid;
  copyOutputBtn.onclick = copyOutput;
  undoBtn.onclick = () => {
    const base64 = historyManager.undo();
    if (!base64) return;
    applyHistoryState(base64);
  };
  redoBtn.onclick = () => {
    const base64 = historyManager.redo();
    if (!base64) return;
    applyHistoryState(base64);
  };
  swapColorsBtn.onclick = () => {
    const primary = previewPrimaryColorInput.value;
    previewPrimaryColorInput.value = previewSecondaryColorInput.value;
    previewSecondaryColorInput.value = primary;
    colorPresetControls.setCustomSelection();
    updateOutput();
  };

  gridManager.generateGrid();
});
