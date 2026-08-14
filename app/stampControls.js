const clampInt = (value, min, max, fallback) => {
    const parsed = parseInt(value);
    if (!Number.isFinite(parsed))
        return fallback;
    return Math.max(min, Math.min(max, parsed));
};
export function initStampControls(options) {
    const { gridManager, toolState, toolStampBtn, stampWidthInput, stampHeightInput, stampApplyModeSelect, stampEditor, stampApplyBtn, stampClearBtn, onChange, } = options;
    let stampPattern = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0));
    const ensureStampPatternSize = () => {
        const width = clampInt(stampWidthInput.value, 1, 24, 4);
        const height = clampInt(stampHeightInput.value, 1, 24, 4);
        stampWidthInput.value = String(width);
        stampHeightInput.value = String(height);
        stampPattern = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => { var _a, _b; return (_b = (_a = stampPattern[y]) === null || _a === void 0 ? void 0 : _a[x]) !== null && _b !== void 0 ? _b : 0; }));
    };
    const renderStampEditor = () => {
        var _a, _b;
        ensureStampPatternSize();
        stampEditor.style.gridTemplateColumns = `repeat(${(_b = (_a = stampPattern[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0}, 18px)`;
        const cells = [];
        for (let y = 0; y < stampPattern.length; y++) {
            for (let x = 0; x < stampPattern[y].length; x++) {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.className = `stamp-editor-cell${stampPattern[y][x] === 1 ? " active" : ""}`;
                cell.title = `${x}, ${y}`;
                cell.onclick = () => {
                    stampPattern[y][x] = stampPattern[y][x] === 1 ? 0 : 1;
                    renderStampEditor();
                };
                cells.push(cell);
            }
        }
        stampEditor.replaceChildren(...cells);
    };
    const getTiledStampValue = (x, y) => {
        var _a, _b;
        const height = stampPattern.length;
        const width = (_b = (_a = stampPattern[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        if (!width || !height)
            return 0;
        return stampPattern[y % height][x % width] === 1 ? 1 : 0;
    };
    const applyStampPattern = () => {
        const selection = gridManager.getStampSelection();
        if (!selection.length)
            return;
        const targetCells = new Set(selection.map((point) => `${point.x},${point.y}`));
        for (let y = 0; y < gridManager.getTileHeight(); y++) {
            for (let x = 0; x < gridManager.getTileWidth(); x++) {
                if (!targetCells.has(`${x},${y}`))
                    continue;
                if (stampApplyModeSelect.value === "overlay" && gridManager.isCellActive(x, y)) {
                    continue;
                }
                gridManager.setCellActive(x, y, getTiledStampValue(x, y) === 1);
            }
        }
        onChange();
    };
    toolState.subscribeToToolChanges((tool) => {
        var _a;
        if (tool === "stamp") {
            (_a = document.getElementById("stampSection")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ block: "nearest" });
        }
    });
    stampApplyBtn.onclick = applyStampPattern;
    stampClearBtn.onclick = () => {
        ensureStampPatternSize();
        stampPattern = stampPattern.map((row) => row.map(() => 0));
        renderStampEditor();
    };
    stampWidthInput.addEventListener("change", renderStampEditor);
    stampHeightInput.addEventListener("change", renderStampEditor);
    toolStampBtn.addEventListener("click", () => {
        var _a;
        (_a = document.getElementById("stampSection")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ block: "nearest" });
    });
    renderStampEditor();
}
