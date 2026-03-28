import { getCircleCells, } from "./circleGeometry.js";
import { invertPattern, shiftPatternDown, shiftPatternLeft, shiftPatternRight, shiftPatternUp } from "./patternTransforms.js";
export function createGridManager(options) {
    const { gridDiv, tileWidthInput, tileHeightInput, tileWidthValue, tileHeightValue, gridScaleInput, shiftUpBtn, shiftDownBtn, shiftLeftBtn, shiftRightBtn, invertBtn, initialPattern, guideState, toolState, drawingTools: initialDrawingTools, onPatternChange, } = options;
    let drawingTools = initialDrawingTools !== null && initialDrawingTools !== void 0 ? initialDrawingTools : null;
    let tileWidth = parseInt(tileWidthInput.value);
    let tileHeight = parseInt(tileHeightInput.value);
    let isMouseDown = false;
    let toggleState = null;
    let isFirstLoad = true;
    let currentHeight = 0;
    let currentWidth = 0;
    let lineStart = null;
    let circlePreviewCells = [];
    let patternState = [];
    let cellMatrix = [];
    const baseCellSize = 20;
    const getGridScale = () => {
        const nextScale = gridScaleInput ? parseFloat(gridScaleInput.value) : 1;
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
    gridScaleInput === null || gridScaleInput === void 0 ? void 0 : gridScaleInput.addEventListener("change", applyGridSizing);
    const isInBounds = (x, y) => x >= 0 && y >= 0 && x < tileWidth && y < tileHeight;
    const setCellActive = (x, y, active) => {
        var _a;
        if (!isInBounds(x, y))
            return;
        patternState[y][x] = active ? 1 : 0;
        const cell = (_a = cellMatrix[y]) === null || _a === void 0 ? void 0 : _a[x];
        if (cell) {
            cell.classList.toggle("active", active);
        }
    };
    const isCellActive = (x, y) => isInBounds(x, y) && patternState[y][x] === 1;
    const setDrawingTools = (tools) => (drawingTools = tools);
    const setLineStart = (point) => {
        var _a, _b, _c, _d;
        if (lineStart) {
            (_b = (_a = cellMatrix[lineStart.y]) === null || _a === void 0 ? void 0 : _a[lineStart.x]) === null || _b === void 0 ? void 0 : _b.classList.remove("line-start");
        }
        lineStart = point;
        if (lineStart) {
            (_d = (_c = cellMatrix[lineStart.y]) === null || _c === void 0 ? void 0 : _c[lineStart.x]) === null || _d === void 0 ? void 0 : _d.classList.add("line-start");
        }
    };
    const clearCirclePreview = () => {
        circlePreviewCells.forEach((point) => { var _a, _b; return (_b = (_a = cellMatrix[point.y]) === null || _a === void 0 ? void 0 : _a[point.x]) === null || _b === void 0 ? void 0 : _b.classList.remove("circle-hover"); });
        circlePreviewCells = [];
    };
    const previewCircle = (center, radius) => {
        clearCirclePreview();
        circlePreviewCells = getCircleCells(center, Math.max(0, radius), toolState.isCircleFilled(), tileWidth, tileHeight);
        circlePreviewCells.forEach((cell) => { var _a, _b; return (_b = (_a = cellMatrix[cell.y]) === null || _a === void 0 ? void 0 : _a[cell.x]) === null || _b === void 0 ? void 0 : _b.classList.add("circle-hover"); });
    };
    gridDiv.onmouseleave = clearCirclePreview;
    toolState.subscribeToToolChanges((tool) => {
        if (tool !== "line")
            setLineStart(null);
        if (tool !== "circle")
            clearCirclePreview();
    });
    const applyPattern = (nextPattern) => {
        var _a;
        for (let y = 0; y < tileHeight; y++) {
            for (let x = 0; x < tileWidth; x++) {
                setCellActive(x, y, ((_a = nextPattern[y]) === null || _a === void 0 ? void 0 : _a[x]) === 1);
            }
        }
    };
    const applyPatternTransform = (transform) => {
        setLineStart(null);
        clearCirclePreview();
        applyPattern(transform(patternState));
        onPatternChange();
    };
    shiftLeftBtn.addEventListener("click", () => {
        applyPatternTransform(shiftPatternLeft);
    });
    shiftRightBtn.addEventListener("click", () => {
        applyPatternTransform(shiftPatternRight);
    });
    shiftDownBtn.addEventListener("click", () => {
        applyPatternTransform(shiftPatternDown);
    });
    shiftUpBtn.addEventListener("click", () => {
        applyPatternTransform(shiftPatternUp);
    });
    invertBtn === null || invertBtn === void 0 ? void 0 : invertBtn.addEventListener("click", () => {
        applyPatternTransform(invertPattern);
    });
    function getCurrentPattern() {
        return patternState;
    }
    function generateGrid(pattern) {
        var _a, _b, _c;
        tileWidth = parseInt(tileWidthInput.value);
        tileHeight = parseInt(tileHeightInput.value);
        setLineStart(null);
        clearCirclePreview();
        applyGridSizing();
        const basePattern = pattern || (isFirstLoad ? initialPattern : patternState);
        patternState = Array.from({ length: tileHeight }, (_, y) => Array.from({ length: tileWidth }, (_, x) => basePattern[y] && basePattern[y][x] === 1 ? 1 : 0));
        const nextCellMatrix = Array.from({ length: tileHeight }, () => []);
        for (let y = tileHeight; y < currentHeight; y++) {
            const row = cellMatrix[y];
            if (!row)
                continue;
            row.forEach((cell) => cell.remove());
        }
        for (let y = 0; y < Math.min(tileHeight, currentHeight); y++) {
            const row = cellMatrix[y];
            if (!row)
                continue;
            for (let x = tileWidth; x < currentWidth; x++) {
                (_a = row[x]) === null || _a === void 0 ? void 0 : _a.remove();
            }
        }
        currentWidth = tileWidth;
        currentHeight = tileHeight;
        let lastCell;
        let centerV = [];
        let centerH = [];
        if (guideState.isCenterEnabled()) {
            if (tileWidth % 2 === 0) {
                centerV = [Math.floor(tileWidth / 2)];
            }
            else {
                centerV = [(tileWidth - 1) / 2, (tileWidth - 1) / 2 + 1];
            }
            if (tileHeight % 2 === 0) {
                centerH = [Math.floor(tileHeight / 2)];
            }
            else {
                centerH = [(tileHeight - 1) / 2, (tileHeight - 1) / 2 + 1];
            }
        }
        const applyPenBrush = (cx, cy, activate) => {
            const size = toolState.getPenSize();
            const radius = Math.floor(size / 2);
            for (let by = cy - radius; by <= cy + radius; by++) {
                if (by < 0 || by >= tileHeight)
                    continue;
                for (let bx = cx - radius; bx <= cx + radius; bx++) {
                    if (bx < 0 || bx >= tileWidth)
                        continue;
                    setCellActive(bx, by, activate);
                }
            }
        };
        for (let y = 0; y < tileHeight; y++) {
            for (let x = 0; x < tileWidth; x++) {
                let cell = (_c = (_b = cellMatrix[y]) === null || _b === void 0 ? void 0 : _b[x]) !== null && _c !== void 0 ? _c : null;
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
                }
                else if (!cell.parentElement) {
                    gridDiv.appendChild(cell);
                }
                nextCellMatrix[y][x] = cell;
                lastCell = cell;
                cell.classList.remove("guide-v", "guide-h", "center-v", "center-h");
                cell.classList.remove("line-start", "circle-hover");
                cell.classList.toggle("active", patternState[y][x] === 1);
                if (guideState.isBlackEnabled()) {
                    if (x !== 0 && x % 5 === 0)
                        cell.classList.add("guide-v");
                    if (y !== 0 && y % 5 === 0)
                        cell.classList.add("guide-h");
                }
                if (guideState.isCenterEnabled()) {
                    if (centerV.indexOf(x) !== -1)
                        cell.classList.add("center-v");
                    if (centerH.indexOf(y) !== -1)
                        cell.classList.add("center-h");
                }
                cell.onclick = () => {
                    const tool = toolState.getCurrentTool();
                    if (tool === "pen") {
                        const shouldActivate = !isCellActive(x, y);
                        applyPenBrush(x, y, shouldActivate);
                    }
                    else if (tool === "line") {
                        if (!lineStart) {
                            setLineStart({ x, y });
                            return;
                        }
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.drawLine(lineStart.x, lineStart.y, x, y);
                        setLineStart(null);
                    }
                    else if (tool === "fill") {
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.floodFill(x, y);
                    }
                    else if (tool === "star") {
                        const r = toolState.getStarRadius();
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.drawStar(x, y, r);
                    }
                    else if (tool === "circle") {
                        clearCirclePreview();
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.drawCircle(x, y, toolState.getCircleRadius(), toolState.isCircleFilled());
                    }
                    else {
                        return;
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
                    else if (!isMouseDown && tool === "circle") {
                        previewCircle({ x, y }, toolState.getCircleRadius());
                    }
                };
            }
        }
        cellMatrix = nextCellMatrix;
        isFirstLoad = false;
        onPatternChange();
    }
    function clearGrid() {
        setLineStart(null);
        clearCirclePreview();
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
