export type ToolKind = "pen" | "fill" | "star" | "circle";

type ToolStateOptions = {
  toolPenBtn: HTMLButtonElement;
  toolFillBtn: HTMLButtonElement;
  toolStarBtn: HTMLButtonElement;
  toolCircleBtn: HTMLButtonElement;
  penSizeInput: HTMLInputElement;
  starSizeInput: HTMLInputElement;
  circleSizeInput: HTMLInputElement;
  circleFillInput: HTMLInputElement;
  colorButtons: HTMLButtonElement[];
};

export type ToolState = {
  getCurrentTool: () => ToolKind;
  getPenSize: () => number;
  getStarRadius: () => number;
  getCircleRadius: () => number;
  isCircleFilled: () => boolean;
  getActiveColor: () => number;
};

export function createToolState(options: ToolStateOptions): ToolState {
  const {
    toolPenBtn,
    toolFillBtn,
    toolStarBtn,
    toolCircleBtn,
    penSizeInput,
    starSizeInput,
    circleSizeInput,
    circleFillInput,
    colorButtons,
  } = options;

  let currentTool: ToolKind = "pen";
  let activeColor = 1;

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

  const selectColor = (index: number) => {
    activeColor = index;
    colorButtons.forEach((btn) => {
      const value = Number(btn.dataset.color ?? "-1");
      const isActive = value === index;
      btn.classList.toggle("selected", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  colorButtons.forEach((btn) => {
    btn.type = "button";
    btn.addEventListener("click", () => {
      const value = Number(btn.dataset.color ?? "0");
      if (!Number.isFinite(value)) return;
      selectColor(Math.max(0, Math.min(3, Math.floor(value))));
    });
  });
  selectColor(activeColor);

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
    getCurrentTool: () => currentTool,
    getPenSize: () => parseInt(penSizeInput.value),
    getStarRadius: () => parseInt(starSizeInput.value),
    getCircleRadius: () => parseInt(circleSizeInput.value),
    isCircleFilled: () => circleFillInput.checked,
    getActiveColor: () => activeColor,
  };
}
