export type ToolKind = "pen" | "line" | "fill" | "star" | "circle";

type ToolStateOptions = {
  toolPenBtn: HTMLButtonElement;
  toolLineBtn: HTMLButtonElement;
  toolFillBtn: HTMLButtonElement;
  toolStarBtn: HTMLButtonElement;
  toolCircleBtn: HTMLButtonElement;
  penSizeInput: HTMLInputElement;
  starSizeInput: HTMLInputElement;
  circleSizeInput: HTMLInputElement;
  circleFillInput: HTMLInputElement;
};

export type ToolState = {
  getCurrentTool: () => ToolKind;
  getPenSize: () => number;
  getStarRadius: () => number;
  getCircleRadius: () => number;
  isCircleFilled: () => boolean;
  subscribeToToolChanges: (
    listener: (tool: ToolKind) => void
  ) => () => void;
};

export function createToolState(options: ToolStateOptions): ToolState {
  const {
    toolPenBtn,
    toolLineBtn,
    toolFillBtn,
    toolStarBtn,
    toolCircleBtn,
    penSizeInput,
    starSizeInput,
    circleSizeInput,
    circleFillInput,
  } = options;

  let currentTool: ToolKind | null = null;
  const listeners = new Set<(tool: ToolKind) => void>();

  function selectTool(tool: ToolKind) {
    if (currentTool === tool) return;
    currentTool = tool;
    [toolPenBtn, toolLineBtn, toolFillBtn, toolStarBtn, toolCircleBtn].forEach(
      (btn) => btn.classList.remove("selected")
    );
    if (tool === "pen") toolPenBtn.classList.add("selected");
    if (tool === "line") toolLineBtn.classList.add("selected");
    if (tool === "fill") toolFillBtn.classList.add("selected");
    if (tool === "star") toolStarBtn.classList.add("selected");
    if (tool === "circle") toolCircleBtn.classList.add("selected");
    listeners.forEach((listener) => listener(tool));
  }

  toolPenBtn.onclick = () => selectTool("pen");
  toolLineBtn.onclick = () => selectTool("line");
  toolFillBtn.onclick = () => selectTool("fill");
  toolStarBtn.onclick = () => selectTool("star");
  toolCircleBtn.onclick = () => selectTool("circle");
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
    getPenSize: () => parseInt(penSizeInput.value),
    getStarRadius: () => parseInt(starSizeInput.value),
    getCircleRadius: () => parseInt(circleSizeInput.value),
    isCircleFilled: () => circleFillInput.checked,
    subscribeToToolChanges: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
