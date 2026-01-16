import type { DrawingTools } from "./drawingTools.js";
import type { GuideState } from "./gridGuides.js";
import type { ToolState } from "./toolState.js";

type GridManagerOptions = {
  gridDiv: HTMLElement;
  tileWidthInput: HTMLInputElement;
  tileHeightInput: HTMLInputElement;
  tileWidthValue: HTMLInputElement;
  tileHeightValue: HTMLInputElement;
  gridScaleInput?: HTMLSelectElement;
  shiftUpBtn: HTMLButtonElement;
  shiftDownBtn: HTMLButtonElement;
  shiftLeftBtn: HTMLButtonElement;
  shiftRightBtn: HTMLButtonElement;
  initialPattern: number[][];
  guideState: GuideState;
  toolState: ToolState;
  drawingTools?: DrawingTools;
  onPatternChange: () => void;
};

export type GridManager = {
  generateGrid: (pattern?: number[][]) => void;
  getCurrentPattern: () => number[][];
  clearGrid: () => void;
  getTileWidth: () => number;
  getTileHeight: () => number;
  isCellActive: (x: number, y: number) => boolean;
  setCellActive: (x: number, y: number, active: boolean) => void;
  setDrawingTools: (tools: DrawingTools) => void;
};

export function createGridManager(options: GridManagerOptions): GridManager {
  const {
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
    initialPattern,
    guideState,
    toolState,
    drawingTools: initialDrawingTools,
    onPatternChange,
  } = options;

  let drawingTools: DrawingTools | null = initialDrawingTools ?? null;
  let tileWidth = parseInt(tileWidthInput.value);
  let tileHeight = parseInt(tileHeightInput.value);
  let isMouseDown = false;
  let toggleState: boolean | null = null;
  let isFirstLoad = true;
  let currentHeight = 0;
  let currentWidth = 0;
  let patternState: number[][] = [];
  let cellMatrix: HTMLDivElement[][] = [];
  const baseCellSize = 20;

  const getGridScale = () => {
    if (!gridScaleInput) return 1;
    const nextScale = parseFloat(gridScaleInput.value);
    return Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;
  };

  const applyGridSizing = () => {
    const cellSize = baseCellSize * getGridScale();
    gridDiv.style.setProperty("--cell-size", `${cellSize}px`);
    gridDiv.style.gridTemplateColumns = `repeat(${tileWidth}, var(--cell-size))`;
  };

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
  gridScaleInput?.addEventListener("change", () => {
    applyGridSizing();
  });

  const isInBounds = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < tileWidth && y < tileHeight;

  const setCellActive = (x: number, y: number, active: boolean) => {
    if (!isInBounds(x, y)) return;
    patternState[y][x] = active ? 1 : 0;
    const cell = cellMatrix[y]?.[x];
    if (cell) {
      cell.classList.toggle("active", active);
    }
  };

  const isCellActive = (x: number, y: number) => {
    if (!isInBounds(x, y)) return false;
    return patternState[y][x] === 1;
  };

  const setDrawingTools = (tools: DrawingTools) => {
    drawingTools = tools;
  };

  const applyPattern = (nextPattern: number[][]) => {
    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        setCellActive(x, y, nextPattern[y]?.[x] === 1);
      }
    }
  };

  shiftLeftBtn.addEventListener("click", () => {
    const nextPattern: number[][] = [];
    for (let y = 0; y < tileHeight; y++) {
      const row = patternState[y] ?? [];
      nextPattern[y] = row.slice(1).concat(row[0] ?? 0);
    }
    applyPattern(nextPattern);
    onPatternChange();
  });

  shiftRightBtn.addEventListener("click", () => {
    const nextPattern: number[][] = [];
    for (let y = 0; y < tileHeight; y++) {
      const row = patternState[y] ?? [];
      const last = row[row.length - 1] ?? 0;
      nextPattern[y] = [last, ...row.slice(0, -1)];
    }
    applyPattern(nextPattern);
    onPatternChange();
  });

  shiftDownBtn.addEventListener("click", () => {
    const nextPattern: number[][] = Array.from({ length: tileHeight }, () =>
      new Array(tileWidth).fill(0)
    );
    for (let x = 0; x < tileWidth; x++) {
      const bottomValue = patternState[tileHeight - 1]?.[x] ?? 0;
      nextPattern[0][x] = bottomValue;
      for (let y = 1; y < tileHeight; y++) {
        nextPattern[y][x] = patternState[y - 1]?.[x] ?? 0;
      }
    }
    applyPattern(nextPattern);
    onPatternChange();
  });

  shiftUpBtn.addEventListener("click", () => {
    const nextPattern: number[][] = Array.from({ length: tileHeight }, () =>
      new Array(tileWidth).fill(0)
    );
    for (let x = 0; x < tileWidth; x++) {
      const topValue = patternState[0]?.[x] ?? 0;
      nextPattern[tileHeight - 1][x] = topValue;
      for (let y = 0; y < tileHeight - 1; y++) {
        nextPattern[y][x] = patternState[y + 1]?.[x] ?? 0;
      }
    }
    applyPattern(nextPattern);
    onPatternChange();
  });

  function getCurrentPattern(): number[][] {
    return patternState;
  }

  function generateGrid(pattern?: number[][]) {
    tileWidth = parseInt(tileWidthInput.value);
    tileHeight = parseInt(tileHeightInput.value);
    applyGridSizing();
    const basePattern =
      pattern || (isFirstLoad ? initialPattern : patternState);
    patternState = Array.from({ length: tileHeight }, (_, y) =>
      Array.from({ length: tileWidth }, (_, x) =>
        basePattern[y] && basePattern[y][x] === 1 ? 1 : 0
      )
    );

    const nextCellMatrix: HTMLDivElement[][] = Array.from(
      { length: tileHeight },
      () => []
    );

    for (let y = tileHeight; y < currentHeight; y++) {
      const row = cellMatrix[y];
      if (!row) continue;
      row.forEach((cell) => cell.remove());
    }

    for (let y = 0; y < Math.min(tileHeight, currentHeight); y++) {
      const row = cellMatrix[y];
      if (!row) continue;
      for (let x = tileWidth; x < currentWidth; x++) {
        row[x]?.remove();
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

    const applyPenBrush = (cx: number, cy: number, activate: boolean) => {
      const size = toolState.getPenSize();
      const radius = Math.floor(size / 2);
      for (let by = cy - radius; by <= cy + radius; by++) {
        if (by < 0 || by >= tileHeight) continue;
        for (let bx = cx - radius; bx <= cx + radius; bx++) {
          if (bx < 0 || bx >= tileWidth) continue;
          setCellActive(bx, by, activate);
        }
      }
    };

    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        let cell: HTMLDivElement | null = cellMatrix[y]?.[x] ?? null;
        if (cell === null) {
          cell = document.createElement("div");
          cell.className = "cell";
          cell.dataset.x = x.toString();
          cell.dataset.y = y.toString();
        }
        if (lastCell !== undefined) {
          if (cell.previousSibling !== lastCell) {
            gridDiv.insertBefore(cell, lastCell.nextSibling);
          }
        } else if (!cell.parentElement) {
          gridDiv.appendChild(cell);
        }
        nextCellMatrix[y][x] = cell;
        lastCell = cell;

        cell.classList.remove("guide-v", "guide-h", "center-v", "center-h");
        cell.classList.toggle("active", patternState[y][x] === 1);

        if (guideState.isBlackEnabled()) {
          if (x !== 0 && x % 5 === 0) cell.classList.add("guide-v");
          if (y !== 0 && y % 5 === 0) cell.classList.add("guide-h");
        }
        if (guideState.isCenterEnabled()) {
          if (centerV.indexOf(x) !== -1) cell.classList.add("center-v");
          if (centerH.indexOf(y) !== -1) cell.classList.add("center-h");
        }

        cell.onclick = () => {
          const tool = toolState.getCurrentTool();
          if (tool === "pen") {
            const shouldActivate = !isCellActive(x, y);
            applyPenBrush(x, y, shouldActivate);
          } else if (tool === "fill") {
            drawingTools?.floodFill(x, y);
          } else if (tool === "star") {
            const r = toolState.getStarRadius();
            drawingTools?.drawStar(x, y, r);
          } else if (tool === "circle") {
            const r = toolState.getCircleRadius();
            const fill = toolState.isCircleFilled();
            drawingTools?.drawCircle(x, y, r, fill);
          }
          onPatternChange();
        };

        cell.onmouseover = () => {
          const tool = toolState.getCurrentTool();
          if (isMouseDown && tool === "pen") {
            if (toggleState === null) {
              toggleState = !isCellActive(x, y);
            }
            applyPenBrush(x, y, toggleState);
            onPatternChange();
          }
        };
      }
    }
    cellMatrix = nextCellMatrix;
    isFirstLoad = false;
    onPatternChange();
  }

  function clearGrid() {
    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        setCellActive(x, y, false);
      }
    }
    onPatternChange();
  }

  return {
    generateGrid,
    getCurrentPattern,
    clearGrid,
    getTileWidth: () => tileWidth,
    getTileHeight: () => tileHeight,
    isCellActive,
    setCellActive,
    setDrawingTools,
  };
}
