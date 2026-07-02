export function initEditorViewControls(options) {
    var _a;
    const { shell, toolbarToggleButton, modeButtons, previewPanel, previewHeader, floatPreviewButton, dockPreviewButton, } = options;
    let floatingPointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let dockedViewMode = (_a = shell.dataset.viewMode) !== null && _a !== void 0 ? _a : "both";
    const singlePaneQuery = window.matchMedia("(max-width: 600px) and (orientation: portrait)");
    const isPreviewFloating = () => previewPanel.classList.contains("floating");
    const getEffectiveViewMode = (mode) => singlePaneQuery.matches && mode === "both" ? "canvas" : mode;
    const clampFloatingPreview = () => {
        if (!isPreviewFloating())
            return;
        const rect = previewPanel.getBoundingClientRect();
        const maxLeft = window.innerWidth - rect.width - 8;
        const maxTop = window.innerHeight - rect.height - 8;
        const nextLeft = Math.max(8, Math.min(maxLeft, rect.left));
        const nextTop = Math.max(8, Math.min(maxTop, rect.top));
        previewPanel.style.left = `${nextLeft}px`;
        previewPanel.style.top = `${nextTop}px`;
    };
    const applyViewMode = (mode) => {
        const effectiveMode = getEffectiveViewMode(mode);
        shell.dataset.viewMode = effectiveMode;
        modeButtons.forEach((button) => {
            button.classList.toggle("selected", button.dataset.viewMode === effectiveMode);
        });
    };
    const syncModeButtons = () => {
        const floating = isPreviewFloating();
        modeButtons.forEach((button) => {
            button.disabled =
                (floating && button.dataset.viewMode !== "canvas") ||
                    (singlePaneQuery.matches && button.dataset.viewMode === "both");
        });
    };
    const setViewMode = (mode) => {
        if (!isPreviewFloating()) {
            dockedViewMode = mode;
            applyViewMode(mode);
            return;
        }
        applyViewMode("canvas");
    };
    const setToolbarOpen = (open) => {
        shell.classList.toggle("toolbar-collapsed", !open);
        shell.classList.toggle("toolbar-open", open);
        toolbarToggleButton.setAttribute("aria-expanded", String(open));
    };
    const floatPreview = () => {
        var _a;
        dockedViewMode = (_a = shell.dataset.viewMode) !== null && _a !== void 0 ? _a : "both";
        previewPanel.classList.add("floating");
        dockPreviewButton.hidden = false;
        floatPreviewButton.hidden = true;
        applyViewMode("canvas");
        syncModeButtons();
        clampFloatingPreview();
    };
    const dockPreview = () => {
        previewPanel.classList.remove("floating");
        previewPanel.style.left = "";
        previewPanel.style.top = "";
        dockPreviewButton.hidden = true;
        floatPreviewButton.hidden = false;
        applyViewMode(dockedViewMode);
        syncModeButtons();
    };
    modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const mode = button.dataset.viewMode;
            if (mode)
                setViewMode(mode);
        });
    });
    toolbarToggleButton.addEventListener("click", () => {
        setToolbarOpen(shell.classList.contains("toolbar-collapsed"));
    });
    floatPreviewButton.addEventListener("click", floatPreview);
    dockPreviewButton.addEventListener("click", dockPreview);
    previewHeader.addEventListener("pointerdown", (event) => {
        if (!previewPanel.classList.contains("floating"))
            return;
        const target = event.target;
        if (target.closest("button"))
            return;
        event.preventDefault();
        const rect = previewPanel.getBoundingClientRect();
        floatingPointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        previewHeader.setPointerCapture(event.pointerId);
    });
    previewHeader.addEventListener("pointermove", (event) => {
        if (floatingPointerId !== event.pointerId)
            return;
        const maxLeft = window.innerWidth - previewPanel.offsetWidth - 8;
        const maxTop = window.innerHeight - previewPanel.offsetHeight - 8;
        const nextLeft = startLeft + event.clientX - startX;
        const nextTop = startTop + event.clientY - startY;
        previewPanel.style.left = `${Math.max(8, Math.min(maxLeft, nextLeft))}px`;
        previewPanel.style.top = `${Math.max(8, Math.min(maxTop, nextTop))}px`;
    });
    const stopDrag = (event) => {
        if (floatingPointerId !== event.pointerId)
            return;
        floatingPointerId = null;
        previewHeader.releasePointerCapture(event.pointerId);
    };
    previewHeader.addEventListener("pointerup", stopDrag);
    previewHeader.addEventListener("pointercancel", stopDrag);
    singlePaneQuery.addEventListener("change", () => {
        if (!isPreviewFloating())
            applyViewMode(dockedViewMode);
        syncModeButtons();
        clampFloatingPreview();
    });
    window.addEventListener("resize", clampFloatingPreview);
    applyViewMode(dockedViewMode);
    setToolbarOpen(!window.matchMedia("(max-width: 900px)").matches);
    syncModeButtons();
    return { setViewMode, dockPreview, floatPreview };
}
