import type { DrawingTools } from "./drawingTools.js";
import type { GuideState } from "./gridGuides.js";
import type { ToolState } from "./toolState.js";

type GridManagerOptions = {
  gridDiv: HTMLElement;
  tileWidthInput: HTMLInputElement;
  tileHeightInput: HTMLInputElement;
  tileWidthValue: HTMLInputElement;
  tileHeightValue: HTMLInputElement;
  shiftUpBtn: HTMLButtonElement;
  shiftDownBtn: HTMLButtonElement;
  shiftLeftBtn: HTMLButtonElement;
  shiftRightBtn: HTMLButtonElement;
  initialPattern: number[][];
  guideState: GuideState;
  toolState: ToolState;
  drawingTools: DrawingTools;
  onPatternChange: () => void;
};

export type GridManager = {
  generateGrid: (pattern?: number[][]) => void;
  getCurrentPattern: () => number[][];
  clearGrid: () => void;
  getTileWidth: () => number;
  getTileHeight: () => number;
};

export function createGridManager(options: GridManagerOptions): GridManager {
  const {
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
    onPatternChange,
  } = options;

  let tileWidth = parseInt(tileWidthInput.value);
  let tileHeight = parseInt(tileHeightInput.value);
  let isMouseDown = false;
  let toggleState: boolean | null = null;
  let isFirstLoad = true;
  let currentHeight = 0;
  let currentWidth = 0;

  document.body.onmousedown = () => (isMouseDown = true);
  document.body.onmouseup = () => {
    isMouseDown = false;
    toggleState = null;
  };

  tileWidthInput.addEventListener("input", () => {
    tileWidthValue.value = tileWidthInput.value;
    generateGrid();
  });
  tileHeightInput.addEventListener("input", () => {
    tileHeightValue.value = tileHeightInput.value;
    generateGrid();
  });
  tileWidthValue.addEventListener("input", () => {
    tileWidthInput.value = tileWidthValue.value;
    generateGrid();
  });
  tileHeightValue.addEventListener("input", () => {
    tileHeightInput.value = tileHeightValue.value;
    generateGrid();
  });

  function getCell(x: number, y: number) {
    const cell = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
    if (cell === null) throw new Error(`Missing cell (${x}, ${y})`);
    return cell;
  }

  shiftLeftBtn.addEventListener("click", () => {
    for (let y = 0; y < tileHeight; y++) {
      const firstCell = getCell(tileWidth - 1, y);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let x = tileWidth - 2; x >= 0; x--) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    onPatternChange();
  });

  shiftRightBtn.addEventListener("click", () => {
    for (let y = 0; y < tileHeight; y++) {
      const firstCell = getCell(0, y);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let x = 1; x < tileWidth; x++) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    onPatternChange();
  });

  shiftDownBtn.addEventListener("click", () => {
    for (let x = 0; x < tileWidth; x++) {
      const firstCell = getCell(x, 0);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let y = 1; y < tileHeight; y++) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    onPatternChange();
  });

  shiftUpBtn.addEventListener("click", () => {
    for (let x = 0; x < tileWidth; x++) {
      const firstCell = getCell(x, tileHeight - 1);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let y = tileHeight - 2; y >= 0; y--) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    onPatternChange();
  });

  function getCurrentPattern(): number[][] {
    const pattern: number[][] = [];
    for (let y = 0; y < tileHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < tileWidth; x++) {
        const cell = gridDiv.querySelector(
          `.cell[data-x='${x}'][data-y='${y}']`
        );
        row.push(cell && cell.classList.contains("active") ? 1 : 0);
      }
      pattern.push(row);
    }
    return pattern;
  }

  function generateGrid(pattern?: number[][]) {
    tileWidth = parseInt(tileWidthInput.value);
    tileHeight = parseInt(tileHeightInput.value);
    gridDiv.style.gridTemplateColumns = `repeat(${tileWidth}, 20px)`;
    const usePattern =
      pattern || (isFirstLoad ? initialPattern : getCurrentPattern());

    for (let y = tileHeight; y < currentHeight; y++) {
      for (const div of gridDiv.querySelectorAll(`.cell[data-y="${y}"]`)) {
        div.remove();
      }
    }

    for (let x = tileWidth; x < currentWidth; x++) {
      for (const div of gridDiv.querySelectorAll(`.cell[data-x="${x}"]`)) {
        div.remove();
      }
    }
    currentWidth = tileWidth;
    currentHeight = tileHeight;

    let lastCell: HTMLDivElement | undefined;
    let centerV: number[] = [];
    let centerH: number[] = [];
    if (guideState.isCenterEnabled()) {
      if (tileWidth % 2 === 0) {
        centerV = [Math.floor(tileWidth / 2)];
      } else {
        centerV = [(tileWidth - 1) / 2, (tileWidth - 1) / 2 + 1];
      }
      if (tileHeight % 2 === 0) {
        centerH = [Math.floor(tileHeight / 2)];
      } else {
        centerH = [(tileHeight - 1) / 2, (tileHeight - 1) / 2 + 1];
      }
    }

    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        let cell: HTMLDivElement | null = gridDiv.querySelector(
          `.cell[data-x='${x}'][data-y='${y}']`
        );
        if (cell === null) {
          cell = document.createElement("div");
          cell.className = "cell";
          cell.dataset.x = x.toString();
          cell.dataset.y = y.toString();
          if (lastCell !== undefined) {
            gridDiv.insertBefore(cell, lastCell.nextSibling);
          } else {
            gridDiv.appendChild(cell);
          }
        }
        lastCell = cell;

        cell.classList.remove("guide-v", "guide-h", "center-v", "center-h");
        if (usePattern[y] && usePattern[y][x] === 1) {
          cell.classList.add("active");
        } else {
          cell.classList.remove("active");
        }

        if (guideState.isBlackEnabled()) {
          if (x !== 0 && x % 5 === 0) cell.classList.add("guide-v");
          if (y !== 0 && y % 5 === 0) cell.classList.add("guide-h");
        }
        if (guideState.isCenterEnabled()) {
          if (centerV.indexOf(x) !== -1) cell.classList.add("center-v");
          if (centerH.indexOf(y) !== -1) cell.classList.add("center-h");
        }

        const applyPenBrush = (cx: number, cy: number, activate: boolean) => {
          const size = toolState.getPenSize();
          const radius = Math.floor(size / 2);
          for (let by = cy - radius; by <= cy + radius; by++) {
            if (by < 0 || by >= tileHeight) continue;
            for (let bx = cx - radius; bx <= cx + radius; bx++) {
              if (bx < 0 || bx >= tileWidth) continue;
              const target = gridDiv.querySelector(
                `.cell[data-x='${bx}'][data-y='${by}']`
              );
              if (target) {
                target.classList.toggle("active", activate);
              }
            }
          }
        };

        cell.onclick = () => {
          const tool = toolState.getCurrentTool();
          if (tool === "pen") {
            const shouldActivate = !cell.classList.contains("active");
            applyPenBrush(x, y, shouldActivate);
          } else if (tool === "fill") {
            drawingTools.floodFill(x, y);
          } else if (tool === "star") {
            const r = toolState.getStarRadius();
            drawingTools.drawStar(x, y, r);
          } else if (tool === "circle") {
            const r = toolState.getCircleRadius();
            const fill = toolState.isCircleFilled();
            drawingTools.drawCircle(x, y, r, fill);
          }
          onPatternChange();
        };

        cell.onmouseover = () => {
          const tool = toolState.getCurrentTool();
          if (isMouseDown && tool === "pen") {
            if (toggleState === null) {
              toggleState = !cell.classList.contains("active");
            }
            applyPenBrush(x, y, toggleState);
            onPatternChange();
          }
        };
      }
    }
    isFirstLoad = false;
    onPatternChange();
  }

  function clearGrid() {
    const cells = gridDiv.querySelectorAll(".cell");
    cells.forEach((cell) => cell.classList.remove("active"));
    onPatternChange();
  }

  return {
    generateGrid,
    getCurrentPattern,
    clearGrid,
    getTileWidth: () => tileWidth,
    getTileHeight: () => tileHeight,
  };
}
