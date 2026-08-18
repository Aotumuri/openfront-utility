export function createToolState(options) {
    const { toolPenBtn, toolLineBtn, toolFillBtn, toolShadeBtn, toolStarBtn, toolCircleBtn, toolSelectBtn, toolStampBtn, penSizeInput, compactToolSizeInput, compactToolSizeControl, starSizeInput, circleSizeInput, stampBrushSizeInput, circleFillInput, initialTool, } = options;
    let currentTool = null;
    const listeners = new Set();
    const sizeInputByTool = {
        pen: penSizeInput,
        star: starSizeInput,
        circle: circleSizeInput,
    };
    const syncCompactToolSize = () => {
        var _a;
        const sizeInput = currentTool ? sizeInputByTool[currentTool] : undefined;
        compactToolSizeControl.hidden = !sizeInput;
        compactToolSizeInput.disabled = !sizeInput;
        if (!sizeInput)
            return;
        compactToolSizeInput.min = sizeInput.min;
        compactToolSizeInput.max = sizeInput.max;
        compactToolSizeInput.step = sizeInput.step || "1";
        compactToolSizeInput.value = sizeInput.value;
        compactToolSizeInput.setAttribute("aria-label", (_a = sizeInput.getAttribute("aria-label")) !== null && _a !== void 0 ? _a : "Tool size");
    };
    function selectTool(tool) {
        if (currentTool === tool)
            return;
        currentTool = tool;
        [
            toolPenBtn,
            toolLineBtn,
            toolFillBtn,
            toolShadeBtn,
            toolStarBtn,
            toolCircleBtn,
            toolSelectBtn,
            toolStampBtn,
        ].forEach((btn) => {
            btn.classList.remove("selected");
            btn.setAttribute("aria-pressed", "false");
        });
        const selectedButton = {
            pen: toolPenBtn,
            line: toolLineBtn,
            fill: toolFillBtn,
            shade: toolShadeBtn,
            star: toolStarBtn,
            circle: toolCircleBtn,
            select: toolSelectBtn,
            stamp: toolStampBtn,
        }[tool !== null && tool !== void 0 ? tool : "pen"];
        if (tool && selectedButton) {
            selectedButton.classList.add("selected");
            selectedButton.setAttribute("aria-pressed", "true");
        }
        syncCompactToolSize();
        listeners.forEach((listener) => listener(tool));
    }
    const toggleTool = (tool) => {
        selectTool(currentTool === tool ? null : tool);
    };
    toolPenBtn.onclick = () => toggleTool("pen");
    toolLineBtn.onclick = () => toggleTool("line");
    toolFillBtn.onclick = () => toggleTool("fill");
    toolShadeBtn.onclick = () => toggleTool("shade");
    toolStarBtn.onclick = () => toggleTool("star");
    toolCircleBtn.onclick = () => toggleTool("circle");
    toolSelectBtn.onclick = () => toggleTool("select");
    toolStampBtn.onclick = () => toggleTool("stamp");
    selectTool(initialTool !== null && initialTool !== void 0 ? initialTool : "pen");
    compactToolSizeInput.addEventListener("input", () => {
        const sizeInput = currentTool ? sizeInputByTool[currentTool] : undefined;
        if (sizeInput)
            sizeInput.value = compactToolSizeInput.value;
    });
    [penSizeInput, starSizeInput, circleSizeInput].forEach((input) => {
        input.addEventListener("input", syncCompactToolSize);
    });
    circleFillInput.onchange = () => {
        if (currentTool === "circle") {
            // No preview behavior yet.
        }
    };
    return {
        getCurrentTool: () => currentTool,
        getSelectedTool: () => currentTool,
        getPenSize: () => parseInt(penSizeInput.value),
        getStarRadius: () => parseInt(starSizeInput.value),
        getCircleRadius: () => parseInt(circleSizeInput.value),
        getStampBrushRadius: () => parseInt(stampBrushSizeInput.value),
        isCircleFilled: () => circleFillInput.checked,
        subscribeToToolChanges: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        clearCurrentTool: () => selectTool(null),
    };
}
