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
  starSizeInput: HTMLInputElement;
  circleSizeInput: HTMLInputElement;
  stampBrushSizeInput: HTMLInputElement;
  circleFillInput: HTMLInputElement;
};

export type ToolState = {
  getCurrentTool: () => ToolKind;
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
    starSizeInput,
    circleSizeInput,
    stampBrushSizeInput,
    circleFillInput,
  } = options;

  let currentTool: ToolKind | null = null;
  const listeners = new Set<(tool: ToolKind | null) => void>();

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
    listeners.forEach((listener) => listener(tool));
  }

  toolPenBtn.onclick = () => selectTool("pen");
  toolLineBtn.onclick = () => selectTool("line");
  toolFillBtn.onclick = () => selectTool("fill");
  toolShadeBtn.onclick = () => selectTool("shade");
  toolStarBtn.onclick = () => selectTool("star");
  toolCircleBtn.onclick = () => selectTool("circle");
  toolSelectBtn.onclick = () => selectTool(currentTool === "select" ? null : "select");
  toolStampBtn.onclick = () => selectTool("stamp");
  selectTool("pen");

  starSizeInput.oninput = () => {
    if (currentTool === "star") {
      // No preview behavior yet.
    }
  };
  penSizeInput.oninput = () => {
    if (currentTool === "pen") {
      // No preview behavior yet.
    }
  };
  circleSizeInput.oninput = () => {
    if (currentTool === "circle") {
      // No preview behavior yet.
    }
  };
    circleFillInput.onchange = () => {
    if (currentTool === "circle") {
      // No preview behavior yet.
    }
  };

  return {
    getCurrentTool: () => currentTool ?? "pen",
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
