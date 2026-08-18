import { initColorPresetControls } from "./app/colorPresets.js";
import { copyText } from "./app/copyText.js";
import { createDrawingTools } from "./app/drawingTools.js";
import { initEditorViewControls } from "./app/editorViewControls.js";
import {
  buildDevStorageOutput,
  buildDiscordOutput,
  buildPreviewLink,
} from "./app/exportOutputs.js";
import { setupGridGuides } from "./app/gridGuides.js";
import { createGridManager } from "./app/gridManager.js";
import { setupHistoryShortcuts } from "./app/historyShortcuts.js";
import { initImageImportOverlay } from "./app/imageImportOverlay.js";
import {
  decodePatternBase64,
  generatePatternBase64,
} from "./app/patternEncoding.js";
import { createPatternLoader } from "./app/patternLoader.js";
import { initPaneResizeControls } from "./app/paneResizeControls.js";
import { createPreviewRenderer } from "./app/previewRenderer.js";
import { initShiftControls } from "./app/shiftControls.js";
import { initStampControls } from "./app/stampControls.js";
import { createToolState } from "./app/toolState.js";
import { createHistoryManager } from "./app/undoRedo.js";
import { initWorkspaceControls } from "./app/workspaceControls.js";
import { initCopyPasteShortcuts } from "./app/copyPasteShortcuts.js";
import { initToolShortcuts } from "./app/toolShortcuts.js";

document.addEventListener("DOMContentLoaded", () => {
  const toolbox = document.getElementById("toolbox");
  const base64Input = document.getElementById("base64Input") as HTMLInputElement;
  const toolPenBtn = document.getElementById("tool-pen") as HTMLButtonElement;
  const penSizeInput = document.getElementById("pen-size") as HTMLInputElement;
  const compactToolSizeInput = document.getElementById("compactToolSize") as HTMLInputElement;
  const compactToolSizeControl = document.getElementById("compactToolSizeControl") as HTMLElement;
  const toolLineBtn = document.getElementById("tool-line") as HTMLButtonElement;
  const toolFillBtn = document.getElementById("tool-fill") as HTMLButtonElement;
  const toolShadeBtn = document.getElementById("tool-shade") as HTMLButtonElement;
  const toolStarBtn = document.getElementById("tool-star") as HTMLButtonElement;
  const toolCircleBtn = document.getElementById("tool-circle") as HTMLButtonElement;
  const toolStampBtn = document.getElementById("tool-stamp") as HTMLButtonElement;
  const toolSelectBtn = document.getElementById("tool-select") as HTMLButtonElement;
  const shiftSelectBtn = document.getElementById("shift-select-btn") as HTMLButtonElement;
  const starSizeInput = document.getElementById("star-size") as HTMLInputElement;
  const circleSizeInput = document.getElementById("circle-size") as HTMLInputElement;
  const stampBrushSizeInput = document.getElementById("stamp-brush-size") as HTMLInputElement;
  const circleFillInput = document.getElementById("circle-fill") as HTMLInputElement;
  const loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  const tileWidthInput = document.getElementById("tileWidth") as HTMLInputElement;
  const tileWidthValue = document.getElementById("tileWidth-value") as HTMLInputElement;
  const tileHeightInput = document.getElementById("tileHeight") as HTMLInputElement;
  const tileHeightValue = document.getElementById("tileHeight-value") as HTMLInputElement;
  const scaleInput = document.getElementById("scale") as HTMLInputElement;
  const scaleValue = document.getElementById("scale-value") as HTMLSpanElement;
  const gridScaleInput = document.getElementById("gridScale") as HTMLSelectElement;
  const clearGridBtn = document.getElementById("clearGridBtn") as HTMLButtonElement;
  const undoBtn = document.getElementById("undoBtn") as HTMLButtonElement;
  const redoBtn = document.getElementById("redoBtn") as HTMLButtonElement;
  const shiftUpBtn = document.getElementById("shiftUpBtn") as HTMLButtonElement;
  const shiftLeftBtn = document.getElementById("shiftLeftBtn") as HTMLButtonElement;
  const shiftRightBtn = document.getElementById("shiftRightBtn") as HTMLButtonElement;
  const shiftDownBtn = document.getElementById("shiftDownBtn") as HTMLButtonElement;
  const gridDiv = document.getElementById("grid")!;
  const outputTextarea = document.getElementById("output") as HTMLTextAreaElement;
  const discordOutputTextarea = document.getElementById("discordOutput") as HTMLTextAreaElement;
  const previewLinkTextarea = document.getElementById("previewLinkOutput") as HTMLTextAreaElement;
  const devStorageTextarea = document.getElementById("devStorageOutput") as HTMLTextAreaElement;
  const copyOutputBtn = document.getElementById("copyOutputBtn") as HTMLButtonElement;
  const copyDiscordBtn = document.getElementById("copyDiscordBtn") as HTMLButtonElement;
  const copyPreviewLinkBtn = document.getElementById("copyPreviewLinkBtn") as HTMLButtonElement;
  const copyDevStorageBtn = document.getElementById("copyDevStorageBtn") as HTMLButtonElement;
  const previewCanvas = document.getElementById("preview") as HTMLCanvasElement;
  const previewPrimaryColorInput = document.getElementById("previewPrimaryColor") as HTMLInputElement;
  const previewSecondaryColorInput = document.getElementById("previewSecondaryColor") as HTMLInputElement;
  const swapColorsBtn = document.getElementById("swapColorsBtn") as HTMLButtonElement;
  const colorPresetContainer = document.getElementById("colorPresetContainer") as HTMLDivElement;
  const selectedPresetLabel = document.getElementById("selectedPresetLabel");
  const editorShell = document.querySelector(".editor-shell") as HTMLElement;
  const toolDensityButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-tool-density]",
  );
  const toolbarToggleBtn = document.getElementById("toolbarToggleBtn") as HTMLButtonElement;
  const modeButtons = document.querySelectorAll<HTMLButtonElement>("[data-view-mode]");
  const floatPreviewBtn = document.getElementById("floatPreviewBtn") as HTMLButtonElement;
  const dockPreviewBtn = document.getElementById("dockPreviewBtn") as HTMLButtonElement;
  const previewPanel = document.querySelector(".preview-panel") as HTMLElement;
  const previewHeader = document.querySelector(".preview-header") as HTMLElement;
  const previewBody = document.querySelector(".preview-body") as HTMLElement;
  const previewScrollCue = document.getElementById("previewScrollCue") as HTMLButtonElement;
  const toolbarScroll = document.querySelector(".toolbar-scroll") as HTMLElement;
  const toolbarScrollCue = document.getElementById("toolbarScrollCue") as HTMLButtonElement;
  const shortcutsMenu = document.querySelector(".shortcuts-menu") as HTMLDetailsElement;
  const toolStatus = document.getElementById("toolStatus") as HTMLElement;
  const toast = document.getElementById("toast") as HTMLElement;

  const setToolDensity = (density: "normal" | "compact") => {
    editorShell.dataset.toolDensity = density;
    toolDensityButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.toolDensity === density),
      );
    });
    localStorage.setItem("tool-density", density);
  };

  const savedToolDensity = localStorage.getItem("tool-density");
  if (savedToolDensity === "compact" || savedToolDensity === "normal") {
    setToolDensity(savedToolDensity);
  }
  toolDensityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const density = button.dataset.toolDensity;
      if (density === "normal" || density === "compact") setToolDensity(density);
    });
  });

  if (!colorPresetContainer) {
    throw new Error("Missing color preset container");
  }

  const previewContext = previewCanvas.getContext("2d");
  if (!previewContext) throw new Error("2D context not supported");

  document.addEventListener("click", (event) => {
    if (shortcutsMenu.open && !shortcutsMenu.contains(event.target as Node)) {
      shortcutsMenu.open = false;
    }
  });

  const updatePreviewScrollCue = () => {
    const hasMoreContent =
      previewBody.scrollTop + previewBody.clientHeight < previewBody.scrollHeight - 2;
    previewScrollCue.hidden = !hasMoreContent;
  };
  previewBody.addEventListener("scroll", updatePreviewScrollCue, { passive: true });
  previewScrollCue.addEventListener("click", () => {
    previewBody.scrollTo({ top: previewBody.scrollHeight, behavior: "smooth" });
  });
  new ResizeObserver(updatePreviewScrollCue).observe(previewBody);
  new ResizeObserver(updatePreviewScrollCue).observe(previewCanvas);

  const updateToolbarScrollCue = () => {
    const hasMoreContent =
      toolbarScroll.scrollTop + toolbarScroll.clientHeight < toolbarScroll.scrollHeight - 2;
    toolbarScrollCue.hidden = !hasMoreContent;
  };
  toolbarScroll.addEventListener("scroll", updateToolbarScrollCue, { passive: true });
  toolbarScrollCue.addEventListener("click", () => {
    toolbarScroll.scrollBy({ top: toolbarScroll.clientHeight * 0.8, behavior: "smooth" });
  });
  new ResizeObserver(updateToolbarScrollCue).observe(toolbarScroll);

  const editorViewControls = initEditorViewControls({
    shell: editorShell,
    toolbarToggleButton: toolbarToggleBtn,
    modeButtons,
    previewPanel,
    previewHeader,
    floatPreviewButton: floatPreviewBtn,
    dockPreviewButton: dockPreviewBtn,
  });
  initPaneResizeControls({
    shell: editorShell,
    workspaceSplit: document.querySelector(".workspace-split") as HTMLElement,
    toolbarHandle: document.getElementById("toolbarResizeHandle") as HTMLElement,
    previewHandle: document.getElementById("previewResizeHandle") as HTMLElement,
  });

  let handleGuideChange = () => {};
  const guideState = setupGridGuides(toolbox, () => handleGuideChange());
  const toolState = createToolState({
    toolPenBtn,
    toolLineBtn,
    toolFillBtn,
    toolShadeBtn,
    toolStarBtn,
    toolCircleBtn,
    toolSelectBtn,
    toolStampBtn,
    penSizeInput,
    compactToolSizeInput,
    compactToolSizeControl,
    starSizeInput,
    circleSizeInput,
    stampBrushSizeInput,
    circleFillInput,
  });
  const canvasWorkspace = document.getElementById("canvasWorkspace") as HTMLElement;
  const workspaceControls = initWorkspaceControls({
    workspace: canvasWorkspace,
    viewport: document.getElementById("gridViewport") as HTMLElement,
    zoomInButton: document.getElementById("zoomInBtn") as HTMLButtonElement,
    zoomOutButton: document.getElementById("zoomOutBtn") as HTMLButtonElement,
    resetButton: document.getElementById("resetViewBtn") as HTMLButtonElement,
    zoomValue: document.getElementById("zoomValue") as HTMLOutputElement,
    isMoveMode: () => toolState.getCurrentTool() === null,
  });
  const toolDescriptions = {
    pen: "Pen · draw cells",
    line: "Line · select start and end",
    fill: "Fill · fill a connected area",
    shade: "Shade · fill an area with a checker pattern",
    star: "Star · place a star shape",
    circle: "Circle · place a circle shape",
    select: "Rotate Select · drag an area",
    stamp: "Stamp · paint with your stamp",
  };
  toolState.subscribeToToolChanges((tool) => {
    canvasWorkspace.classList.toggle("is-move-mode", tool === null);
    toolStatus.textContent = tool ? toolDescriptions[tool] : "Move · drag canvas";
  });
  let toastTimeout: number | undefined;
  document.addEventListener("pattern:copied", () => {
    window.clearTimeout(toastTimeout);
    toast.textContent = "Copied to clipboard";
    toast.classList.add("is-visible");
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  });

  let updateOutput = () => {};
  let isPatternChangeGroupOpen = false;
  let pendingPatternChangeBase64: string | null = null;
  const gridManager = createGridManager({
    gridDiv,
    tileWidthInput,
    tileHeightInput,
    tileWidthValue,
    tileHeightValue,
    gridScaleInput,
    shiftUpBtn,
    shiftDownBtn,
    shiftLeftBtn,
    shiftRightBtn,
    invertBtn: document.getElementById("invertGridBtn") as HTMLButtonElement,
    rotateLeftBtn: document.getElementById("rotateLeftBtn") as HTMLButtonElement,
    rotateRightBtn: document.getElementById("rotateRightBtn") as HTMLButtonElement,
    guideState,
    toolState,
    onPatternChange: () => updateOutput(),
    onPatternChangeStart: () => {
      if (isApplyingHistory) return;
      isPatternChangeGroupOpen = true;
      pendingPatternChangeBase64 = null;
    },
    onPatternChangeEnd: () => {
      if (!isPatternChangeGroupOpen) return;
      isPatternChangeGroupOpen = false;
      if (pendingPatternChangeBase64) {
        historyManager.record(pendingPatternChangeBase64);
        pendingPatternChangeBase64 = null;
      }
      updateHistoryButtons();
    },
  });
  const drawingTools = createDrawingTools({
    getTileWidth: gridManager.getTileWidth,
    getTileHeight: gridManager.getTileHeight,
    isCellActive: gridManager.isCellActive,
    setCellActive: gridManager.setCellActive,
  });
  gridManager.setDrawingTools(drawingTools);
  initCopyPasteShortcuts(gridManager, toolState);
  initToolShortcuts({
    pen: toolPenBtn,
    line: toolLineBtn,
    fill: toolFillBtn,
    shade: toolShadeBtn,
    star: toolStarBtn,
    circle: toolCircleBtn,
    stamp: toolStampBtn,
  });
  gridManager.subscribeToPasteMode((active) => {
    toolStatus.textContent = active
      ? "Paste · move over the canvas, then click to place"
      : (toolState.getSelectedTool()
        ? toolDescriptions[toolState.getSelectedTool()!]
        : "Choose a drawing tool");
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
    discordOutputTextarea.value = buildDiscordOutput(
      base64,
      previewPrimaryColorInput.value,
      previewSecondaryColorInput.value
    );
    previewLinkTextarea.value = buildPreviewLink(
      window.location.href,
      base64,
      previewPrimaryColorInput.value,
      previewSecondaryColorInput.value
    );
    devStorageTextarea.value = buildDevStorageOutput(
      base64,
      previewPrimaryColorInput.value,
      previewSecondaryColorInput.value
    );
    renderPreview(base64);
    const params = new URLSearchParams({
      primary: previewPrimaryColorInput.value.replace("#", ""),
      secondary: previewSecondaryColorInput.value.replace("#", ""),
    });
    window.history.replaceState(null, "", `#${base64}?${params.toString()}`);
    if (!isApplyingHistory) {
      if (isPatternChangeGroupOpen) {
        pendingPatternChangeBase64 = base64;
      } else {
        historyManager.record(base64);
      }
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

  const normalizeHex = (value: string | null) => {
    if (!value) return null;
    const cleaned = value.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
    return `#${cleaned.toLowerCase()}`;
  };

  if (!window.location.hash) {
    const isEasterEgg = Math.random() < 0.25;
    const injectedHash = isEasterEgg
      ? "#AFlhAAAAAADg______8DAAAAAAA4sbvhzgBRIVFEBGBOZIaZA0SRRBFRgKuRK-4MAAAAAADg______8DAAAAAADgAHAAOAAiABGACCAIMAQIAgICi4GAQECgIBAQBBCCCAGEqsIooaqwaggirBoCCAmGAEJVoaJQVVg1JBhWDQICIYGAgCBAGiAI4APwAfgAAAAAAAAA?primary=fedd67&secondary=000000"
      : "#AAEiAAAAAAAAAAAAAAAAAAAAAIDD8YnweTiiD5FIYEIgEpkIRCKBCoFIpCIQeTwyPB6RjEAkEIgQKEQiApFAIEIgEYkIOAKfCIGIIyIAAAAAAAAAAAA?primary=ffffff&secondary=000000";
    window.history.replaceState(null, "", injectedHash);
  }

  const hashValue = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  let initialColors: { primary: string; secondary: string } | null = null;
  let shouldFocusPreview = false;
  if (hashValue) {
    const [patternPart, queryPart] = hashValue.split("?");
    if (patternPart) {
      base64Input.value = patternPart;
      setTimeout(loadFromBase64, 0);
    }
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const primary =
        normalizeHex(params.get("primary")) ?? normalizeHex(params.get("p"));
      const secondary =
        normalizeHex(params.get("secondary")) ?? normalizeHex(params.get("s"));
      if (primary || secondary) {
        initialColors = {
          primary: primary ?? previewPrimaryColorInput.value,
          secondary: secondary ?? previewSecondaryColorInput.value,
        };
      }
      const previewFlag = params.get("preview");
      shouldFocusPreview =
        previewFlag !== null && previewFlag !== "0" && previewFlag !== "false";
    }
  }

  const colorPresetControls = initColorPresetControls({
    container: colorPresetContainer,
    primaryColorInput: previewPrimaryColorInput,
    secondaryColorInput: previewSecondaryColorInput,
    selectedLabel: selectedPresetLabel,
    initialColors,
    onChange: () => updateOutput(),
  });

  initImageImportOverlay({
    onApply: (pattern, size) => {
      tileWidthInput.value = size.width.toString();
      tileHeightInput.value = size.height.toString();
      tileWidthValue.value = tileWidthInput.value;
      tileHeightValue.value = tileHeightInput.value;
      gridManager.generateGrid(pattern);
    },
  });

  initStampControls({
    gridManager,
    toolState,
    toolStampBtn,
    stampWidthInput: document.getElementById("stampWidth") as HTMLInputElement,
    stampHeightInput: document.getElementById("stampHeight") as HTMLInputElement,
    stampApplyModeSelect: document.getElementById("stampApplyMode") as HTMLSelectElement,
    stampEditor: document.getElementById("stampEditor") as HTMLDivElement,
    stampApplyBtn: document.getElementById("stampApplyBtn") as HTMLButtonElement,
    stampClearBtn: document.getElementById("stampClearBtn") as HTMLButtonElement,
    onChange: () => updateOutput(),
  });
  initShiftControls({
    gridManager,
    toolState,
    toolSelectBtn,
    shiftSelectBtn,
    shiftModeAll: document.getElementById("shift-mode-all") as HTMLInputElement,
    shiftModePartial: document.getElementById("shift-mode-partial") as HTMLInputElement,
    shiftOverwriteOn: document.getElementById("shift-overwrite-on") as HTMLInputElement,
    shiftOverwriteOff: document.getElementById("shift-overwrite-off") as HTMLInputElement,
  });

  loadBtn.onclick = loadFromBase64;
  clearGridBtn.onclick = gridManager.clearGrid;
  copyOutputBtn.onclick = () => copyText(outputTextarea.value);
  copyDiscordBtn.onclick = () => copyText(discordOutputTextarea.value);
  copyPreviewLinkBtn.onclick = () => {
    const link = buildPreviewLink(
      window.location.href,
      outputTextarea.value.trim(),
      previewPrimaryColorInput.value,
      previewSecondaryColorInput.value
    );
    previewLinkTextarea.value = link;
    copyText(link);
  };
  copyDevStorageBtn.onclick = () => copyText(devStorageTextarea.value);

  const handleUndo = () => {
    const base64 = historyManager.undo();
    if (base64) applyHistoryState(base64);
  };
  const handleRedo = () => {
    const base64 = historyManager.redo();
    if (base64) applyHistoryState(base64);
  };
  undoBtn.onclick = handleUndo;
  redoBtn.onclick = handleRedo;
  swapColorsBtn.onclick = () => {
    const primary = previewPrimaryColorInput.value;
    previewPrimaryColorInput.value = previewSecondaryColorInput.value;
    previewSecondaryColorInput.value = primary;
    colorPresetControls.setCustomSelection();
    updateOutput();
  };
  setupHistoryShortcuts({ onUndo: handleUndo, onRedo: handleRedo });

  gridManager.generateGrid();
  requestAnimationFrame(updatePreviewScrollCue);
  requestAnimationFrame(updateToolbarScrollCue);
  if (shouldFocusPreview) editorViewControls.setViewMode("preview");
  workspaceControls.reset();
});
