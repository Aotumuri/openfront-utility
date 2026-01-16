export type ToolKind = "pen" | "fill" | "star" | "circle";

type ToolStateOptions = {
  toolPenBtn: HTMLButtonElement;
  toolFillBtn: HTMLButtonElement;
  toolStarBtn: HTMLButtonElement;
  toolCircleBtn: HTMLButtonElement;
  starSizeInput: HTMLInputElement;
  circleSizeInput: HTMLInputElement;
  circleFillInput: HTMLInputElement;
};

export type ToolState = {
  getCurrentTool: () => ToolKind;
  getStarRadius: () => number;
  getCircleRadius: () => number;
  isCircleFilled: () => boolean;
};

export function createToolState(options: ToolStateOptions): ToolState {
  const {
    toolPenBtn,
    toolFillBtn,
    toolStarBtn,
    toolCircleBtn,
    starSizeInput,
    circleSizeInput,
    circleFillInput,
  } = options;

  let currentTool: ToolKind = "pen";

  function selectTool(tool: ToolKind) {
    currentTool = tool;
    [toolPenBtn, toolFillBtn, toolStarBtn, toolCircleBtn].forEach((btn) =>
      btn.classList.remove("selected")
    );
    if (tool === "pen") toolPenBtn.classList.add("selected");
    if (tool === "fill") toolFillBtn.classList.add("selected");
    if (tool === "star") toolStarBtn.classList.add("selected");
    if (tool === "circle") toolCircleBtn.classList.add("selected");
  }

  toolPenBtn.onclick = () => selectTool("pen");
  toolFillBtn.onclick = () => selectTool("fill");
  toolStarBtn.onclick = () => selectTool("star");
  toolCircleBtn.onclick = () => selectTool("circle");
  selectTool("pen");

  starSizeInput.oninput = () => {
    if (currentTool === "star") {
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
    getCurrentTool: () => currentTool,
    getStarRadius: () => parseInt(starSizeInput.value),
    getCircleRadius: () => parseInt(circleSizeInput.value),
    isCircleFilled: () => circleFillInput.checked,
  };
}
