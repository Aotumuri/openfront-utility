import { initColorPresetControls } from "./app/colorPresets.js";
import { copyText } from "./app/copyText.js";
import { createDrawingTools } from "./app/drawingTools.js";
import { buildDevStorageOutput, buildDiscordOutput, buildPreviewLink, } from "./app/exportOutputs.js";
import { setupGridGuides } from "./app/gridGuides.js";
import { createGridManager } from "./app/gridManager.js";
import { setupHistoryShortcuts } from "./app/historyShortcuts.js";
import { initImageImportOverlay } from "./app/imageImportOverlay.js";
import { initialPattern } from "./app/initialPattern.js";
import { decodePatternBase64, generatePatternBase64, } from "./app/patternEncoding.js";
import { createPatternLoader } from "./app/patternLoader.js";
import { createPreviewRenderer } from "./app/previewRenderer.js";
import { createToolState } from "./app/toolState.js";
import { createHistoryManager } from "./app/undoRedo.js";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    const toolbox = document.getElementById("toolbox");
    const base64Input = document.getElementById("base64Input");
    const toolPenBtn = document.getElementById("tool-pen");
    const penSizeInput = document.getElementById("pen-size");
    const toolLineBtn = document.getElementById("tool-line");
    const toolFillBtn = document.getElementById("tool-fill");
    const toolStarBtn = document.getElementById("tool-star");
    const toolCircleBtn = document.getElementById("tool-circle");
    const toolStampBtn = document.getElementById("tool-stamp");
    const toolSelectBtn = document.getElementById("tool-select");
    const starSizeInput = document.getElementById("star-size");
    const circleSizeInput = document.getElementById("circle-size");
    const stampBrushSizeInput = document.getElementById("stamp-brush-size");
    const circleFillInput = document.getElementById("circle-fill");
    const loadBtn = document.getElementById("loadBtn");
    const tileWidthInput = document.getElementById("tileWidth");
    const tileWidthValue = document.getElementById("tileWidth-value");
    const tileHeightInput = document.getElementById("tileHeight");
    const tileHeightValue = document.getElementById("tileHeight-value");
    const scaleInput = document.getElementById("scale");
    const scaleValue = document.getElementById("scale-value");
    const gridScaleInput = document.getElementById("gridScale");
    const clearGridBtn = document.getElementById("clearGridBtn");
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const shiftUpBtn = document.getElementById("shiftUpBtn");
    const shiftLeftBtn = document.getElementById("shiftLeftBtn");
    const shiftRightBtn = document.getElementById("shiftRightBtn");
    const shiftDownBtn = document.getElementById("shiftDownBtn");
    const stampWidthInput = document.getElementById("stampWidth");
    const stampHeightInput = document.getElementById("stampHeight");
    const stampApplyModeSelect = document.getElementById("stampApplyMode");
    const stampEditor = document.getElementById("stampEditor");
    const stampApplyBtn = document.getElementById("stampApplyBtn");
    const stampClearBtn = document.getElementById("stampClearBtn");
    const rotateLeftBtn = document.getElementById("rotateLeftBtn");
    const rotateRightBtn = document.getElementById("rotateRightBtn");
    const gridDiv = document.getElementById("grid");
    const outputTextarea = document.getElementById("output");
    const discordOutputTextarea = document.getElementById("discordOutput");
    const previewLinkTextarea = document.getElementById("previewLinkOutput");
    const devStorageTextarea = document.getElementById("devStorageOutput");
    const copyOutputBtn = document.getElementById("copyOutputBtn");
    const copyDiscordBtn = document.getElementById("copyDiscordBtn");
    const copyPreviewLinkBtn = document.getElementById("copyPreviewLinkBtn");
    const copyDevStorageBtn = document.getElementById("copyDevStorageBtn");
    const previewCanvas = document.getElementById("preview");
    const previewPrimaryColorInput = document.getElementById("previewPrimaryColor");
    const previewSecondaryColorInput = document.getElementById("previewSecondaryColor");
    const swapColorsBtn = document.getElementById("swapColorsBtn");
    const colorPresetContainer = document.getElementById("colorPresetContainer");
    const layoutTabsInput = document.getElementById("layout-tabs");
    const viewPreviewInput = document.getElementById("view-preview");
    const tabActionsInput = document.getElementById("tab-actions");
    const tabToolsInput = document.getElementById("tab-tools");
    const tabGridInput = document.getElementById("tab-grid");
    const tabStampInput = document.getElementById("tab-stamp");
    const previewPanel = document.querySelector(".preview-panel");
    if (!colorPresetContainer) {
        throw new Error("Missing color preset container");
    }
    const previewContext = previewCanvas.getContext("2d");
    if (!previewContext)
        throw new Error("2D context not supported");
    let handleGuideChange = () => { };
    const guideState = setupGridGuides(toolbox, () => handleGuideChange());
    const toolState = createToolState({
        toolPenBtn,
        toolLineBtn,
        toolFillBtn,
        toolStarBtn,
        toolCircleBtn,
        toolSelectBtn,
        toolStampBtn,
        penSizeInput,
        starSizeInput,
        circleSizeInput,
        stampBrushSizeInput,
        circleFillInput,
    });
    toolState.subscribeToToolChanges((tool) => {
        if (tool === "stamp") {
            tabStampInput.checked = true;
        }
    });
    let updateOutput = () => { };
    const gridManager = createGridManager({
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
        invertBtn: document.getElementById("invertGridBtn"),
        rotateLeftBtn,
        rotateRightBtn,
        initialPattern,
        guideState,
        toolState,
        onPatternChange: () => updateOutput(),
    });
    const drawingTools = createDrawingTools({
        getTileWidth: gridManager.getTileWidth,
        getTileHeight: gridManager.getTileHeight,
        isCellActive: gridManager.isCellActive,
        setCellActive: gridManager.setCellActive,
    });
    gridManager.setDrawingTools(drawingTools);
    handleGuideChange = () => gridManager.generateGrid();
    const renderPreview = createPreviewRenderer({
        canvas: previewCanvas,
        context: previewContext,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
    });
    const historyManager = createHistoryManager();
    let isApplyingHistory = false;
    let stampPattern = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0));
    const clampInt = (value, min, max, fallback) => {
        const parsed = parseInt(value);
        if (!Number.isFinite(parsed))
            return fallback;
        return Math.max(min, Math.min(max, parsed));
    };
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
        const mode = stampApplyModeSelect.value;
        for (let y = 0; y < gridManager.getTileHeight(); y++) {
            for (let x = 0; x < gridManager.getTileWidth(); x++) {
                if (!targetCells.has(`${x},${y}`))
                    continue;
                if (mode === "overlay" && gridManager.isCellActive(x, y))
                    continue;
                gridManager.setCellActive(x, y, getTiledStampValue(x, y) === 1);
            }
        }
        updateOutput();
    };
    const updateHistoryButtons = () => {
        undoBtn.disabled = !historyManager.canUndo();
        redoBtn.disabled = !historyManager.canRedo();
    };
    const applyHistoryState = (base64) => {
        let decoded;
        try {
            decoded = decodePatternBase64(base64);
        }
        catch (error) {
            console.warn("Failed to decode history state", error);
            return;
        }
        const { pattern, tileWidth, tileHeight, scale } = decoded;
        tileWidthInput.value = tileWidth.toString();
        tileHeightInput.value = tileHeight.toString();
        tileWidthValue.value = tileWidthInput.value;
        tileHeightValue.value = tileHeightInput.value;
        scaleInput.value = scale.toString();
        scaleValue.textContent = String(1 << parseInt(scaleInput.value));
        isApplyingHistory = true;
        gridManager.generateGrid(pattern);
        isApplyingHistory = false;
    };
    updateOutput = () => {
        const pattern = gridManager.getCurrentPattern();
        const scale = parseInt(scaleInput.value);
        const base64 = generatePatternBase64(pattern, gridManager.getTileWidth(), gridManager.getTileHeight(), scale);
        outputTextarea.value = base64;
        discordOutputTextarea.value = buildDiscordOutput(base64, previewPrimaryColorInput.value, previewSecondaryColorInput.value);
        previewLinkTextarea.value = buildPreviewLink(window.location.href, base64, previewPrimaryColorInput.value, previewSecondaryColorInput.value);
        devStorageTextarea.value = buildDevStorageOutput(base64, previewPrimaryColorInput.value, previewSecondaryColorInput.value);
        renderPreview(base64);
        const params = new URLSearchParams({
            primary: previewPrimaryColorInput.value.replace("#", ""),
            secondary: previewSecondaryColorInput.value.replace("#", ""),
        });
        window.history.replaceState(null, "", `#${base64}?${params.toString()}`);
        if (!isApplyingHistory) {
            historyManager.record(base64);
        }
        updateHistoryButtons();
    };
    scaleInput.addEventListener("input", () => {
        scaleValue.textContent = String(1 << parseInt(scaleInput.value));
        updateOutput();
    });
    const loadFromBase64 = createPatternLoader({
        base64Input,
        tileWidthInput,
        tileHeightInput,
        tileWidthValue,
        tileHeightValue,
        scaleInput,
        scaleValue,
        onPatternLoaded: (pattern) => gridManager.generateGrid(pattern),
    });
    const normalizeHex = (value) => {
        if (!value)
            return null;
        const cleaned = value.trim().replace(/^#/, "");
        if (!/^[0-9a-fA-F]{6}$/.test(cleaned))
            return null;
        return `#${cleaned.toLowerCase()}`;
    };
    const hashValue = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
    let initialColors = null;
    let shouldFocusPreview = false;
    if (hashValue) {
        const [patternPart, queryPart] = hashValue.split("?");
        if (patternPart) {
            base64Input.value = patternPart;
            setTimeout(loadFromBase64, 0);
        }
        if (queryPart) {
            const params = new URLSearchParams(queryPart);
            const primary = (_a = normalizeHex(params.get("primary"))) !== null && _a !== void 0 ? _a : normalizeHex(params.get("p"));
            const secondary = (_b = normalizeHex(params.get("secondary"))) !== null && _b !== void 0 ? _b : normalizeHex(params.get("s"));
            if (primary || secondary) {
                initialColors = {
                    primary: primary !== null && primary !== void 0 ? primary : previewPrimaryColorInput.value,
                    secondary: secondary !== null && secondary !== void 0 ? secondary : previewSecondaryColorInput.value,
                };
            }
            const previewFlag = params.get("preview");
            if (previewFlag !== null &&
                previewFlag !== "0" &&
                previewFlag !== "false") {
                shouldFocusPreview = true;
            }
        }
    }
    const colorPresetControls = initColorPresetControls({
        container: colorPresetContainer,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
        initialColors,
        onChange: () => updateOutput(),
    });
    initImageImportOverlay({
        onApply: (pattern, size) => {
            tileWidthInput.value = size.width.toString();
            tileHeightInput.value = size.height.toString();
            tileWidthValue.value = tileWidthInput.value;
            tileHeightValue.value = tileHeightInput.value;
            gridManager.generateGrid(pattern);
        },
    });
    function copyOutput() {
        copyText(outputTextarea.value);
    }
    function copyDiscordOutput() {
        copyText(discordOutputTextarea.value);
    }
    function copyPreviewLink() {
        const link = buildPreviewLink(window.location.href, outputTextarea.value.trim(), previewPrimaryColorInput.value, previewSecondaryColorInput.value);
        previewLinkTextarea.value = link;
        copyText(link);
    }
    function copyDevStorageOutput() {
        copyText(devStorageTextarea.value);
    }
    const handleUndo = () => {
        const base64 = historyManager.undo();
        if (!base64)
            return;
        applyHistoryState(base64);
    };
    const handleRedo = () => {
        const base64 = historyManager.redo();
        if (!base64)
            return;
        applyHistoryState(base64);
    };
    loadBtn.onclick = loadFromBase64;
    clearGridBtn.onclick = gridManager.clearGrid;
    stampApplyBtn.onclick = applyStampPattern;
    stampClearBtn.onclick = () => {
        ensureStampPatternSize();
        stampPattern = stampPattern.map((row) => row.map(() => 0));
        renderStampEditor();
    };
    copyOutputBtn.onclick = copyOutput;
    copyDiscordBtn.onclick = copyDiscordOutput;
    copyPreviewLinkBtn.onclick = copyPreviewLink;
    copyDevStorageBtn.onclick = copyDevStorageOutput;
    undoBtn.onclick = handleUndo;
    redoBtn.onclick = handleRedo;
    swapColorsBtn.onclick = () => {
        const primary = previewPrimaryColorInput.value;
        previewPrimaryColorInput.value = previewSecondaryColorInput.value;
        previewSecondaryColorInput.value = primary;
        colorPresetControls.setCustomSelection();
        updateOutput();
    };
    setupHistoryShortcuts({ onUndo: handleUndo, onRedo: handleRedo });
    const syncRotateSelectWithActionsTab = () => {
        if (!tabActionsInput.checked && toolState.getCurrentTool() === "select") {
            toolSelectBtn.click();
        }
    };
    const syncStampToolWithTab = () => {
        if (tabStampInput.checked && toolState.getCurrentTool() !== "stamp") {
            toolStampBtn.click();
        }
    };
    tabActionsInput.addEventListener("change", syncRotateSelectWithActionsTab);
    tabToolsInput.addEventListener("change", syncRotateSelectWithActionsTab);
    tabGridInput.addEventListener("change", syncRotateSelectWithActionsTab);
    tabStampInput.addEventListener("change", syncStampToolWithTab);
    stampWidthInput.addEventListener("change", renderStampEditor);
    stampHeightInput.addEventListener("change", renderStampEditor);
    renderStampEditor();
    gridManager.generateGrid();
    if (shouldFocusPreview) {
        if (layoutTabsInput) {
            layoutTabsInput.checked = true;
        }
        if (viewPreviewInput) {
            viewPreviewInput.checked = true;
        }
        const scrollTarget = previewPanel !== null && previewPanel !== void 0 ? previewPanel : previewCanvas;
        setTimeout(() => {
            scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    }
});
