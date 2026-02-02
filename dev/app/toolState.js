export function createToolState(options) {
    const { toolPenBtn, toolFillBtn, toolStarBtn, toolCircleBtn, penSizeInput, starSizeInput, circleSizeInput, circleFillInput, colorButtons, } = options;
    let currentTool = "pen";
    let activeColor = 1;
    function selectTool(tool) {
        currentTool = tool;
        [toolPenBtn, toolFillBtn, toolStarBtn, toolCircleBtn].forEach((btn) => btn.classList.remove("selected"));
        if (tool === "pen")
            toolPenBtn.classList.add("selected");
        if (tool === "fill")
            toolFillBtn.classList.add("selected");
        if (tool === "star")
            toolStarBtn.classList.add("selected");
        if (tool === "circle")
            toolCircleBtn.classList.add("selected");
    }
    toolPenBtn.onclick = () => selectTool("pen");
    toolFillBtn.onclick = () => selectTool("fill");
    toolStarBtn.onclick = () => selectTool("star");
    toolCircleBtn.onclick = () => selectTool("circle");
    selectTool("pen");
    const selectColor = (index) => {
        activeColor = index;
        colorButtons.forEach((btn) => {
            var _a;
            const value = Number((_a = btn.dataset.color) !== null && _a !== void 0 ? _a : "-1");
            const isActive = value === index;
            btn.classList.toggle("selected", isActive);
            btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    };
    colorButtons.forEach((btn) => {
        btn.type = "button";
        btn.addEventListener("click", () => {
            var _a;
            const value = Number((_a = btn.dataset.color) !== null && _a !== void 0 ? _a : "0");
            if (!Number.isFinite(value))
                return;
            selectColor(Math.max(0, Math.min(3, Math.floor(value))));
        });
    });
    selectColor(activeColor);
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
        getCurrentTool: () => currentTool,
        getPenSize: () => parseInt(penSizeInput.value),
        getStarRadius: () => parseInt(starSizeInput.value),
        getCircleRadius: () => parseInt(circleSizeInput.value),
        isCircleFilled: () => circleFillInput.checked,
        getActiveColor: () => activeColor,
    };
}
