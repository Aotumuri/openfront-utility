import { initColorPresetControls } from "./app/colorPresets.js";
import { createDrawingTools } from "./app/drawingTools.js";
import { setupGridGuides } from "./app/gridGuides.js";
import { createGridManager } from "./app/gridManager.js";
import { initialPattern } from "./app/initialPattern.js";
import { decodePatternBase64, generatePatternBase64, } from "./app/patternEncoding.js";
import { createPatternLoader } from "./app/patternLoader.js";
import { createPreviewRenderer } from "./app/previewRenderer.js";
import { createToolState } from "./app/toolState.js";
import { createHistoryManager } from "./app/undoRedo.js";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c, _d;
    const toolbox = document.getElementById("toolbox");
    const base64Input = document.getElementById("base64Input");
    const toolPenBtn = document.getElementById("tool-pen");
    const penSizeInput = document.getElementById("pen-size");
    const toolFillBtn = document.getElementById("tool-fill");
    const toolStarBtn = document.getElementById("tool-star");
    const toolCircleBtn = document.getElementById("tool-circle");
    const starSizeInput = document.getElementById("star-size");
    const circleSizeInput = document.getElementById("circle-size");
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
    const copyOutputBtn = document.getElementById("copyOutputBtn");
    const copyDiscordBtn = document.getElementById("copyDiscordBtn");
    const copyPreviewLinkBtn = document.getElementById("copyPreviewLinkBtn");
    const previewCanvas = document.getElementById("preview");
    const previewPrimaryColorInput = document.getElementById("previewPrimaryColor");
    const previewSecondaryColorInput = document.getElementById("previewSecondaryColor");
    const previewTertiaryColorInput = document.getElementById("previewTertiaryColor");
    const previewQuaternaryColorInput = document.getElementById("previewQuaternaryColor");
    const swapColorsBtn = document.getElementById("swapColorsBtn");
    const drawColorButtons = [
        document.getElementById("draw-color-0"),
        document.getElementById("draw-color-1"),
        document.getElementById("draw-color-2"),
        document.getElementById("draw-color-3"),
    ];
    const colorPresetContainer = document.getElementById("colorPresetContainer");
    const layoutTabsInput = document.getElementById("layout-tabs");
    const viewPreviewInput = document.getElementById("view-preview");
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
        toolFillBtn,
        toolStarBtn,
        toolCircleBtn,
        penSizeInput,
        starSizeInput,
        circleSizeInput,
        circleFillInput,
        colorButtons: drawColorButtons,
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
        initialPattern,
        guideState,
        toolState,
        onPatternChange: () => updateOutput(),
    });
    const drawingTools = createDrawingTools({
        getTileWidth: gridManager.getTileWidth,
        getTileHeight: gridManager.getTileHeight,
        getCellValue: gridManager.getCellValue,
        setCellValue: gridManager.setCellValue,
        getActiveColor: toolState.getActiveColor,
    });
    gridManager.setDrawingTools(drawingTools);
    handleGuideChange = () => gridManager.generateGrid();
    const renderPreview = createPreviewRenderer({
        canvas: previewCanvas,
        context: previewContext,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
        tertiaryColorInput: previewTertiaryColorInput,
        quaternaryColorInput: previewQuaternaryColorInput,
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
        const colors = [
            previewPrimaryColorInput.value,
            previewSecondaryColorInput.value,
            previewTertiaryColorInput.value,
            previewQuaternaryColorInput.value,
        ];
        gridDiv.style.setProperty("--palette-0", colors[0]);
        gridDiv.style.setProperty("--palette-1", colors[1]);
        gridDiv.style.setProperty("--palette-2", colors[2]);
        gridDiv.style.setProperty("--palette-3", colors[3]);
        drawColorButtons.forEach((btn, index) => {
            const nextColor = colors[index];
            if (nextColor) {
                btn.style.backgroundColor = nextColor;
            }
        });
        const pattern = gridManager.getCurrentPattern();
        const scale = parseInt(scaleInput.value);
        const base64 = generatePatternBase64(pattern, gridManager.getTileWidth(), gridManager.getTileHeight(), scale);
        outputTextarea.value = base64;
        discordOutputTextarea.value = `\`\`\`${base64}\`\`\`\nPrimary ${colors[0]}\nSecondary ${colors[1]}\nTertiary ${colors[2]}\nQuaternary ${colors[3]}`;
        previewLinkTextarea.value = buildPreviewLink();
        renderPreview(base64);
        const params = new URLSearchParams({
            primary: colors[0].replace("#", ""),
            secondary: colors[1].replace("#", ""),
            tertiary: colors[2].replace("#", ""),
            quaternary: colors[3].replace("#", ""),
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
            const tertiary = (_c = normalizeHex(params.get("tertiary"))) !== null && _c !== void 0 ? _c : normalizeHex(params.get("t"));
            const quaternary = (_d = normalizeHex(params.get("quaternary"))) !== null && _d !== void 0 ? _d : normalizeHex(params.get("q"));
            if (primary || secondary || tertiary || quaternary) {
                initialColors = {
                    primary: primary !== null && primary !== void 0 ? primary : previewPrimaryColorInput.value,
                    secondary: secondary !== null && secondary !== void 0 ? secondary : previewSecondaryColorInput.value,
                    tertiary: tertiary !== null && tertiary !== void 0 ? tertiary : previewTertiaryColorInput.value,
                    quaternary: quaternary !== null && quaternary !== void 0 ? quaternary : previewQuaternaryColorInput.value,
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
        tertiaryColorInput: previewTertiaryColorInput,
        quaternaryColorInput: previewQuaternaryColorInput,
        initialColors,
        onChange: () => updateOutput(),
    });
    function copyText(value) {
        var _a;
        const fallbackCopy = () => {
            const temp = document.createElement("textarea");
            temp.value = value;
            temp.style.position = "fixed";
            temp.style.opacity = "0";
            document.body.appendChild(temp);
            temp.focus();
            temp.select();
            document.execCommand("copy");
            temp.remove();
        };
        if ((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText) {
            navigator.clipboard.writeText(value).catch(fallbackCopy);
            return;
        }
        fallbackCopy();
    }
    function copyOutput() {
        copyText(outputTextarea.value);
    }
    function copyDiscordOutput() {
        copyText(discordOutputTextarea.value);
    }
    function buildPreviewLink() {
        const base64 = outputTextarea.value.trim();
        const params = new URLSearchParams({
            primary: previewPrimaryColorInput.value.replace("#", ""),
            secondary: previewSecondaryColorInput.value.replace("#", ""),
            tertiary: previewTertiaryColorInput.value.replace("#", ""),
            quaternary: previewQuaternaryColorInput.value.replace("#", ""),
            preview: "1",
        });
        const hash = base64 ? `#${base64}?${params.toString()}` : "";
        const url = new URL(window.location.href);
        url.hash = hash;
        return url.toString();
    }
    function copyPreviewLink() {
        const link = buildPreviewLink();
        previewLinkTextarea.value = link;
        copyText(link);
    }
    loadBtn.onclick = loadFromBase64;
    clearGridBtn.onclick = gridManager.clearGrid;
    copyOutputBtn.onclick = copyOutput;
    copyDiscordBtn.onclick = copyDiscordOutput;
    copyPreviewLinkBtn.onclick = copyPreviewLink;
    undoBtn.onclick = () => {
        const base64 = historyManager.undo();
        if (!base64)
            return;
        applyHistoryState(base64);
    };
    redoBtn.onclick = () => {
        const base64 = historyManager.redo();
        if (!base64)
            return;
        applyHistoryState(base64);
    };
    swapColorsBtn.onclick = () => {
        const primary = previewPrimaryColorInput.value;
        previewPrimaryColorInput.value = previewSecondaryColorInput.value;
        previewSecondaryColorInput.value = primary;
        colorPresetControls.setCustomSelection();
        updateOutput();
    };
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
