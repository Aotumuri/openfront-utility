import { initColorPresetControls } from "./app/colorPresets.js";
import { copyText } from "./app/copyText.js";
import { createDrawingTools } from "./app/drawingTools.js";
import { initEditorViewControls } from "./app/editorViewControls.js";
import { buildDevStorageOutput, buildDiscordOutput, buildPreviewLink, } from "./app/exportOutputs.js";
import { setupGridGuides } from "./app/gridGuides.js";
import { createGridManager } from "./app/gridManager.js";
import { setupHistoryShortcuts } from "./app/historyShortcuts.js";
import { initImageImportOverlay } from "./app/imageImportOverlay.js";
import { decodePatternBase64, generatePatternBase64, } from "./app/patternEncoding.js";
import { createPatternLoader } from "./app/patternLoader.js";
import { initPaneResizeControls } from "./app/paneResizeControls.js";
import { createPreviewRenderer } from "./app/previewRenderer.js";
import { initShiftControls } from "./app/shiftControls.js";
import { initStampControls } from "./app/stampControls.js";
import { createToolState } from "./app/toolState.js";
import { createHistoryManager } from "./app/undoRedo.js";
import { initWorkspaceControls } from "./app/workspaceControls.js";
import { initCopyPasteShortcuts } from "./app/copyPasteShortcuts.js";
import { initToolShortcuts } from "./app/toolShortcuts.js";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    const toolbox = document.getElementById("toolbox");
    const base64Input = document.getElementById("base64Input");
    const toolPenBtn = document.getElementById("tool-pen");
    const penSizeInput = document.getElementById("pen-size");
    const toolLineBtn = document.getElementById("tool-line");
    const toolFillBtn = document.getElementById("tool-fill");
    const toolShadeBtn = document.getElementById("tool-shade");
    const toolStarBtn = document.getElementById("tool-star");
    const toolCircleBtn = document.getElementById("tool-circle");
    const toolStampBtn = document.getElementById("tool-stamp");
    const toolSelectBtn = document.getElementById("tool-select");
    const shiftSelectBtn = document.getElementById("shift-select-btn");
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
    const selectedPresetLabel = document.getElementById("selectedPresetLabel");
    const editorShell = document.querySelector(".editor-shell");
    const toolbarToggleBtn = document.getElementById("toolbarToggleBtn");
    const modeButtons = document.querySelectorAll("[data-view-mode]");
    const floatPreviewBtn = document.getElementById("floatPreviewBtn");
    const dockPreviewBtn = document.getElementById("dockPreviewBtn");
    const previewPanel = document.querySelector(".preview-panel");
    const previewHeader = document.querySelector(".preview-header");
    const previewBody = document.querySelector(".preview-body");
    const previewScrollCue = document.getElementById("previewScrollCue");
    const toolbarScroll = document.querySelector(".toolbar-scroll");
    const toolbarScrollCue = document.getElementById("toolbarScrollCue");
    const shortcutsMenu = document.querySelector(".shortcuts-menu");
    const toolStatus = document.getElementById("toolStatus");
    const toast = document.getElementById("toast");
    if (!colorPresetContainer) {
        throw new Error("Missing color preset container");
    }
    const previewContext = previewCanvas.getContext("2d");
    if (!previewContext)
        throw new Error("2D context not supported");
    document.addEventListener("click", (event) => {
        if (shortcutsMenu.open && !shortcutsMenu.contains(event.target)) {
            shortcutsMenu.open = false;
        }
    });
    const updatePreviewScrollCue = () => {
        const hasMoreContent = previewBody.scrollTop + previewBody.clientHeight < previewBody.scrollHeight - 2;
        previewScrollCue.hidden = !hasMoreContent;
    };
    previewBody.addEventListener("scroll", updatePreviewScrollCue, { passive: true });
    previewScrollCue.addEventListener("click", () => {
        previewBody.scrollTo({ top: previewBody.scrollHeight, behavior: "smooth" });
    });
    new ResizeObserver(updatePreviewScrollCue).observe(previewBody);
    new ResizeObserver(updatePreviewScrollCue).observe(previewCanvas);
    const updateToolbarScrollCue = () => {
        const hasMoreContent = toolbarScroll.scrollTop + toolbarScroll.clientHeight < toolbarScroll.scrollHeight - 2;
        toolbarScrollCue.hidden = !hasMoreContent;
    };
    toolbarScroll.addEventListener("scroll", updateToolbarScrollCue, { passive: true });
    toolbarScrollCue.addEventListener("click", () => {
        toolbarScroll.scrollBy({ top: toolbarScroll.clientHeight * 0.8, behavior: "smooth" });
    });
    new ResizeObserver(updateToolbarScrollCue).observe(toolbarScroll);
    const workspaceControls = initWorkspaceControls({
        workspace: document.getElementById("canvasWorkspace"),
        viewport: document.getElementById("gridViewport"),
        zoomInButton: document.getElementById("zoomInBtn"),
        zoomOutButton: document.getElementById("zoomOutBtn"),
        resetButton: document.getElementById("resetViewBtn"),
        zoomValue: document.getElementById("zoomValue"),
    });
    const editorViewControls = initEditorViewControls({
        shell: editorShell,
        toolbarToggleButton: toolbarToggleBtn,
        modeButtons,
        previewPanel,
        previewHeader,
        floatPreviewButton: floatPreviewBtn,
        dockPreviewButton: dockPreviewBtn,
    });
    initPaneResizeControls({
        shell: editorShell,
        workspaceSplit: document.querySelector(".workspace-split"),
        toolbarHandle: document.getElementById("toolbarResizeHandle"),
        previewHandle: document.getElementById("previewResizeHandle"),
    });
    let handleGuideChange = () => { };
    const guideState = setupGridGuides(toolbox, () => handleGuideChange());
    const toolState = createToolState({
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
    });
    const toolDescriptions = {
        pen: "Pen · draw cells",
        line: "Line · select start and end",
        fill: "Fill · fill a connected area",
        shade: "Shade · fill an area with a checker pattern",
        star: "Star · place a star shape",
        circle: "Circle · place a circle shape",
        select: "Rotate Select · drag an area",
        stamp: "Stamp · paint with your stamp",
    };
    toolState.subscribeToToolChanges((tool) => {
        toolStatus.textContent = tool ? toolDescriptions[tool] : "Choose a drawing tool";
    });
    let toastTimeout;
    document.addEventListener("pattern:copied", () => {
        window.clearTimeout(toastTimeout);
        toast.textContent = "Copied to clipboard";
        toast.classList.add("is-visible");
        toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
    });
    let updateOutput = () => { };
    let isPatternChangeGroupOpen = false;
    let pendingPatternChangeBase64 = null;
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
        rotateLeftBtn: document.getElementById("rotateLeftBtn"),
        rotateRightBtn: document.getElementById("rotateRightBtn"),
        guideState,
        toolState,
        onPatternChange: () => updateOutput(),
        onPatternChangeStart: () => {
            if (isApplyingHistory)
                return;
            isPatternChangeGroupOpen = true;
            pendingPatternChangeBase64 = null;
        },
        onPatternChangeEnd: () => {
            if (!isPatternChangeGroupOpen)
                return;
            isPatternChangeGroupOpen = false;
            if (pendingPatternChangeBase64) {
                historyManager.record(pendingPatternChangeBase64);
                pendingPatternChangeBase64 = null;
            }
            updateHistoryButtons();
        },
    });
    const drawingTools = createDrawingTools({
        getTileWidth: gridManager.getTileWidth,
        getTileHeight: gridManager.getTileHeight,
        isCellActive: gridManager.isCellActive,
        setCellActive: gridManager.setCellActive,
    });
    gridManager.setDrawingTools(drawingTools);
    initCopyPasteShortcuts(gridManager, toolState);
    initToolShortcuts({
        pen: toolPenBtn,
        line: toolLineBtn,
        fill: toolFillBtn,
        shade: toolShadeBtn,
        star: toolStarBtn,
        circle: toolCircleBtn,
        stamp: toolStampBtn,
    });
    gridManager.subscribeToPasteMode((active) => {
        toolStatus.textContent = active
            ? "Paste · move over the canvas, then click to place"
            : (toolState.getSelectedTool()
                ? toolDescriptions[toolState.getSelectedTool()]
                : "Choose a drawing tool");
    });
    handleGuideChange = () => gridManager.generateGrid();
    const renderPreview = createPreviewRenderer({
        canvas: previewCanvas,
        context: previewContext,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
    });
    const historyManager = createHistoryManager();
    let isApplyingHistory = false;
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
            if (isPatternChangeGroupOpen) {
                pendingPatternChangeBase64 = base64;
            }
            else {
                historyManager.record(base64);
            }
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
    if (!window.location.hash) {
        const isEasterEgg = Math.random() < 0.25;
        const injectedHash = isEasterEgg
            ? "#AFlhAAAAAADg______8DAAAAAAA4sbvhzgBRIVFEBGBOZIaZA0SRRBFRgKuRK-4MAAAAAADg______8DAAAAAADgAHAAOAAiABGACCAIMAQIAgICi4GAQECgIBAQBBCCCAGEqsIooaqwaggirBoCCAmGAEJVoaJQVVg1JBhWDQICIYGAgCBAGiAI4APwAfgAAAAAAAAA?primary=fedd67&secondary=000000"
            : "#AAEiAAAAAAAAAAAAAAAAAAAAAIDD8YnweTiiD5FIYEIgEpkIRCKBCoFIpCIQeTwyPB6RjEAkEIgQKEQiApFAIEIgEYkIOAKfCIGIIyIAAAAAAAAAAAA?primary=ffffff&secondary=000000";
        window.history.replaceState(null, "", injectedHash);
    }
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
            shouldFocusPreview =
                previewFlag !== null && previewFlag !== "0" && previewFlag !== "false";
        }
    }
    const colorPresetControls = initColorPresetControls({
        container: colorPresetContainer,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
        selectedLabel: selectedPresetLabel,
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
    initStampControls({
        gridManager,
        toolState,
        toolStampBtn,
        stampWidthInput: document.getElementById("stampWidth"),
        stampHeightInput: document.getElementById("stampHeight"),
        stampApplyModeSelect: document.getElementById("stampApplyMode"),
        stampEditor: document.getElementById("stampEditor"),
        stampApplyBtn: document.getElementById("stampApplyBtn"),
        stampClearBtn: document.getElementById("stampClearBtn"),
        onChange: () => updateOutput(),
    });
    initShiftControls({
        gridManager,
        toolState,
        toolSelectBtn,
        shiftSelectBtn,
        shiftModeAll: document.getElementById("shift-mode-all"),
        shiftModePartial: document.getElementById("shift-mode-partial"),
        shiftOverwriteOn: document.getElementById("shift-overwrite-on"),
        shiftOverwriteOff: document.getElementById("shift-overwrite-off"),
    });
    loadBtn.onclick = loadFromBase64;
    clearGridBtn.onclick = gridManager.clearGrid;
    copyOutputBtn.onclick = () => copyText(outputTextarea.value);
    copyDiscordBtn.onclick = () => copyText(discordOutputTextarea.value);
    copyPreviewLinkBtn.onclick = () => {
        const link = buildPreviewLink(window.location.href, outputTextarea.value.trim(), previewPrimaryColorInput.value, previewSecondaryColorInput.value);
        previewLinkTextarea.value = link;
        copyText(link);
    };
    copyDevStorageBtn.onclick = () => copyText(devStorageTextarea.value);
    const handleUndo = () => {
        const base64 = historyManager.undo();
        if (base64)
            applyHistoryState(base64);
    };
    const handleRedo = () => {
        const base64 = historyManager.redo();
        if (base64)
            applyHistoryState(base64);
    };
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
    gridManager.generateGrid();
    requestAnimationFrame(updatePreviewScrollCue);
    requestAnimationFrame(updateToolbarScrollCue);
    if (shouldFocusPreview)
        editorViewControls.setViewMode("preview");
    workspaceControls.reset();
});
