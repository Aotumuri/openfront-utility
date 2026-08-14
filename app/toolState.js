export function createToolState(options) {
    const { toolPenBtn, toolLineBtn, toolFillBtn, toolShadeBtn, toolStarBtn, toolCircleBtn, toolSelectBtn, toolStampBtn, penSizeInput, starSizeInput, circleSizeInput, stampBrushSizeInput, circleFillInput, } = options;
    let currentTool = null;
    const listeners = new Set();
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
        listeners.forEach((listener) => listener(tool));
    }
    toolPenBtn.onclick = () => selectTool("pen");
    toolLineBtn.onclick = () => selectTool("line");
    toolFillBtn.onclick = () => selectTool("fill");
    toolShadeBtn.onclick = () => selectTool("shade");
    toolStarBtn.onclick = () => selectTool("star");
    toolCircleBtn.onclick = () => selectTool("circle");
    toolSelectBtn.onclick = () => selectTool(currentTool === "select" ? null : "select");
    toolStampBtn.onclick = () => selectTool("stamp");
    selectTool("pen");
    starSizeInput.oninput = () => {
        if (currentTool === "star") {
            // No preview behavior yet.
        }
    };
    penSizeInput.oninput = () => {
        if (currentTool === "pen") {
            // No preview behavior yet.
        }
    };
    circleSizeInput.oninput = () => {
        if (currentTool === "circle") {
            // No preview behavior yet.
        }
    };
    circleFillInput.onchange = () => {
        if (currentTool === "circle") {
            // No preview behavior yet.
        }
    };
    return {
        getCurrentTool: () => currentTool !== null && currentTool !== void 0 ? currentTool : "pen",
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
