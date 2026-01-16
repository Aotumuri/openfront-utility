import { initColorPresetControls } from "./app/colorPresets.js";
import { createDrawingTools } from "./app/drawingTools.js";
import { setupGridGuides } from "./app/gridGuides.js";
import { createGridManager } from "./app/gridManager.js";
import { initialPattern } from "./app/initialPattern.js";
import { generatePatternBase64 } from "./app/patternEncoding.js";
import { createPatternLoader } from "./app/patternLoader.js";
import { createPreviewRenderer } from "./app/previewRenderer.js";
import { createToolState } from "./app/toolState.js";
document.addEventListener("DOMContentLoaded", () => {
    const toolbox = document.getElementById("toolbox");
    const base64Input = document.getElementById("base64Input");
    const toolPenBtn = document.getElementById("tool-pen");
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
    const clearGridBtn = document.getElementById("clearGridBtn");
    const shiftUpBtn = document.getElementById("shiftUpBtn");
    const shiftLeftBtn = document.getElementById("shiftLeftBtn");
    const shiftRightBtn = document.getElementById("shiftRightBtn");
    const shiftDownBtn = document.getElementById("shiftDownBtn");
    const gridDiv = document.getElementById("grid");
    const outputTextarea = document.getElementById("output");
    const copyOutputBtn = document.getElementById("copyOutputBtn");
    const previewCanvas = document.getElementById("preview");
    const previewPrimaryColorInput = document.getElementById("previewPrimaryColor");
    const previewSecondaryColorInput = document.getElementById("previewSecondaryColor");
    const colorPresetContainer = document.getElementById("colorPresetContainer");
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
        starSizeInput,
        circleSizeInput,
        circleFillInput,
    });
    const drawingTools = createDrawingTools({
        gridDiv,
        getTileWidth: () => parseInt(tileWidthInput.value),
        getTileHeight: () => parseInt(tileHeightInput.value),
    });
    let updateOutput = () => { };
    const gridManager = createGridManager({
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
        onPatternChange: () => updateOutput(),
    });
    handleGuideChange = () => gridManager.generateGrid();
    const renderPreview = createPreviewRenderer({
        canvas: previewCanvas,
        context: previewContext,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
    });
    updateOutput = () => {
        const pattern = gridManager.getCurrentPattern();
        const scale = parseInt(scaleInput.value);
        const base64 = generatePatternBase64(pattern, gridManager.getTileWidth(), gridManager.getTileHeight(), scale);
        outputTextarea.value = base64;
        renderPreview(base64);
        history.replaceState(null, "", "#" + base64);
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
    const hash = window.location.hash;
    if (hash.startsWith("#")) {
        base64Input.value = hash.slice(1);
        setTimeout(loadFromBase64, 0);
    }
    initColorPresetControls({
        container: colorPresetContainer,
        primaryColorInput: previewPrimaryColorInput,
        secondaryColorInput: previewSecondaryColorInput,
        onChange: () => updateOutput(),
    });
    function copyOutput() {
        outputTextarea.select();
        document.execCommand("copy");
    }
    loadBtn.onclick = loadFromBase64;
    clearGridBtn.onclick = gridManager.clearGrid;
    copyOutputBtn.onclick = copyOutput;
    gridManager.generateGrid();
});
