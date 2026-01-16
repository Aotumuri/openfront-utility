export function createGridManager(options) {
    const { gridDiv, tileWidthInput, tileHeightInput, tileWidthValue, tileHeightValue, gridScaleInput, shiftUpBtn, shiftDownBtn, shiftLeftBtn, shiftRightBtn, initialPattern, guideState, toolState, drawingTools: initialDrawingTools, onPatternChange, } = options;
    let drawingTools = initialDrawingTools !== null && initialDrawingTools !== void 0 ? initialDrawingTools : null;
    let tileWidth = parseInt(tileWidthInput.value);
    let tileHeight = parseInt(tileHeightInput.value);
    let isMouseDown = false;
    let toggleState = null;
    let isFirstLoad = true;
    let currentHeight = 0;
    let currentWidth = 0;
    let patternState = [];
    let cellMatrix = [];
    const baseCellSize = 20;
    const getGridScale = () => {
        if (!gridScaleInput)
            return 1;
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
    gridScaleInput === null || gridScaleInput === void 0 ? void 0 : gridScaleInput.addEventListener("change", () => {
        applyGridSizing();
    });
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
    const isCellActive = (x, y) => {
        if (!isInBounds(x, y))
            return false;
        return patternState[y][x] === 1;
    };
    const setDrawingTools = (tools) => {
        drawingTools = tools;
    };
    const applyPattern = (nextPattern) => {
        var _a;
        for (let y = 0; y < tileHeight; y++) {
            for (let x = 0; x < tileWidth; x++) {
                setCellActive(x, y, ((_a = nextPattern[y]) === null || _a === void 0 ? void 0 : _a[x]) === 1);
            }
        }
    };
    shiftLeftBtn.addEventListener("click", () => {
        var _a, _b;
        const nextPattern = [];
        for (let y = 0; y < tileHeight; y++) {
            const row = (_a = patternState[y]) !== null && _a !== void 0 ? _a : [];
            nextPattern[y] = row.slice(1).concat((_b = row[0]) !== null && _b !== void 0 ? _b : 0);
        }
        applyPattern(nextPattern);
        onPatternChange();
    });
    shiftRightBtn.addEventListener("click", () => {
        var _a, _b;
        const nextPattern = [];
        for (let y = 0; y < tileHeight; y++) {
            const row = (_a = patternState[y]) !== null && _a !== void 0 ? _a : [];
            const last = (_b = row[row.length - 1]) !== null && _b !== void 0 ? _b : 0;
            nextPattern[y] = [last, ...row.slice(0, -1)];
        }
        applyPattern(nextPattern);
        onPatternChange();
    });
    shiftDownBtn.addEventListener("click", () => {
        var _a, _b, _c, _d;
        const nextPattern = Array.from({ length: tileHeight }, () => new Array(tileWidth).fill(0));
        for (let x = 0; x < tileWidth; x++) {
            const bottomValue = (_b = (_a = patternState[tileHeight - 1]) === null || _a === void 0 ? void 0 : _a[x]) !== null && _b !== void 0 ? _b : 0;
            nextPattern[0][x] = bottomValue;
            for (let y = 1; y < tileHeight; y++) {
                nextPattern[y][x] = (_d = (_c = patternState[y - 1]) === null || _c === void 0 ? void 0 : _c[x]) !== null && _d !== void 0 ? _d : 0;
            }
        }
        applyPattern(nextPattern);
        onPatternChange();
    });
    shiftUpBtn.addEventListener("click", () => {
        var _a, _b, _c, _d;
        const nextPattern = Array.from({ length: tileHeight }, () => new Array(tileWidth).fill(0));
        for (let x = 0; x < tileWidth; x++) {
            const topValue = (_b = (_a = patternState[0]) === null || _a === void 0 ? void 0 : _a[x]) !== null && _b !== void 0 ? _b : 0;
            nextPattern[tileHeight - 1][x] = topValue;
            for (let y = 0; y < tileHeight - 1; y++) {
                nextPattern[y][x] = (_d = (_c = patternState[y + 1]) === null || _c === void 0 ? void 0 : _c[x]) !== null && _d !== void 0 ? _d : 0;
            }
        }
        applyPattern(nextPattern);
        onPatternChange();
    });
    function getCurrentPattern() {
        return patternState;
    }
    function generateGrid(pattern) {
        var _a, _b, _c;
        tileWidth = parseInt(tileWidthInput.value);
        tileHeight = parseInt(tileHeightInput.value);
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
                    else if (tool === "fill") {
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.floodFill(x, y);
                    }
                    else if (tool === "star") {
                        const r = toolState.getStarRadius();
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.drawStar(x, y, r);
                    }
                    else if (tool === "circle") {
                        const r = toolState.getCircleRadius();
                        const fill = toolState.isCircleFilled();
                        drawingTools === null || drawingTools === void 0 ? void 0 : drawingTools.drawCircle(x, y, r, fill);
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
