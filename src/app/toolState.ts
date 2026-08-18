export type ToolKind =
  | "pen"
  | "line"
  | "fill"
  | "shade"
  | "star"
  | "circle"
  | "select"
  | "stamp";

type ToolStateOptions = {
  toolPenBtn: HTMLButtonElement;
  toolLineBtn: HTMLButtonElement;
  toolFillBtn: HTMLButtonElement;
  toolShadeBtn: HTMLButtonElement;
  toolStarBtn: HTMLButtonElement;
  toolCircleBtn: HTMLButtonElement;
  toolSelectBtn: HTMLButtonElement;
  toolStampBtn: HTMLButtonElement;
  penSizeInput: HTMLInputElement;
  compactToolSizeInput: HTMLInputElement;
  compactToolSizeControl: HTMLElement;
  starSizeInput: HTMLInputElement;
  circleSizeInput: HTMLInputElement;
  stampBrushSizeInput: HTMLInputElement;
  circleFillInput: HTMLInputElement;
};

export type ToolState = {
  getCurrentTool: () => ToolKind | null;
  getSelectedTool: () => ToolKind | null;
  getPenSize: () => number;
  getStarRadius: () => number;
  getCircleRadius: () => number;
  getStampBrushRadius: () => number;
  isCircleFilled: () => boolean;
  subscribeToToolChanges: (
    listener: (tool: ToolKind | null) => void
  ) => () => void;
  clearCurrentTool: () => void;
};

export function createToolState(options: ToolStateOptions): ToolState {
  const {
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
  } = options;

  let currentTool: ToolKind | null = null;
  const listeners = new Set<(tool: ToolKind | null) => void>();
  const sizeInputByTool: Partial<Record<ToolKind, HTMLInputElement>> = {
    pen: penSizeInput,
    star: starSizeInput,
    circle: circleSizeInput,
  };

  const syncCompactToolSize = () => {
    const sizeInput = currentTool ? sizeInputByTool[currentTool] : undefined;
    compactToolSizeControl.hidden = !sizeInput;
    compactToolSizeInput.disabled = !sizeInput;
    if (!sizeInput) return;
    compactToolSizeInput.min = sizeInput.min;
    compactToolSizeInput.max = sizeInput.max;
    compactToolSizeInput.step = sizeInput.step || "1";
    compactToolSizeInput.value = sizeInput.value;
    compactToolSizeInput.setAttribute("aria-label", sizeInput.getAttribute("aria-label") ?? "Tool size");
  };

  function selectTool(tool: ToolKind | null) {
    if (currentTool === tool) return;
    currentTool = tool;
    [
      toolPenBtn,
      toolLineBtn,
      toolFillBtn,
      toolShadeBtn,
      toolStarBtn,
      toolCircleBtn,
      toolSelectBtn,
      toolStampBtn,
    ].forEach((btn) => {
      btn.classList.remove("selected");
      btn.setAttribute("aria-pressed", "false");
    });
    const selectedButton = {
      pen: toolPenBtn,
      line: toolLineBtn,
      fill: toolFillBtn,
      shade: toolShadeBtn,
      star: toolStarBtn,
      circle: toolCircleBtn,
      select: toolSelectBtn,
      stamp: toolStampBtn,
    }[tool ?? "pen"];
    if (tool && selectedButton) {
      selectedButton.classList.add("selected");
      selectedButton.setAttribute("aria-pressed", "true");
    }
    syncCompactToolSize();
    listeners.forEach((listener) => listener(tool));
  }

  const toggleTool = (tool: ToolKind) => {
    selectTool(currentTool === tool ? null : tool);
  };

  toolPenBtn.onclick = () => toggleTool("pen");
  toolLineBtn.onclick = () => toggleTool("line");
  toolFillBtn.onclick = () => toggleTool("fill");
  toolShadeBtn.onclick = () => toggleTool("shade");
  toolStarBtn.onclick = () => toggleTool("star");
  toolCircleBtn.onclick = () => toggleTool("circle");
  toolSelectBtn.onclick = () => toggleTool("select");
  toolStampBtn.onclick = () => toggleTool("stamp");
  selectTool("pen");

  compactToolSizeInput.addEventListener("input", () => {
    const sizeInput = currentTool ? sizeInputByTool[currentTool] : undefined;
    if (sizeInput) sizeInput.value = compactToolSizeInput.value;
  });
  [penSizeInput, starSizeInput, circleSizeInput].forEach((input) => {
    input.addEventListener("input", syncCompactToolSize);
  });
    circleFillInput.onchange = () => {
    if (currentTool === "circle") {
      // No preview behavior yet.
    }
  };

  return {
    getCurrentTool: () => currentTool,
    getSelectedTool: () => currentTool,
    getPenSize: () => parseInt(penSizeInput.value),
    getStarRadius: () => parseInt(starSizeInput.value),
    getCircleRadius: () => parseInt(circleSizeInput.value),
    getStampBrushRadius: () => parseInt(stampBrushSizeInput.value),
    isCircleFilled: () => circleFillInput.checked,
    subscribeToToolChanges: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    clearCurrentTool: () => selectTool(null),
  };
}
