export function initCopyPasteShortcuts(gridManager, toolState) {
    document.addEventListener("keydown", (event) => {
        const target = event.target;
        if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
            return;
        if (event.key === "Escape") {
            gridManager.exitPasteMode();
            return;
        }
        if (!(event.metaKey || event.ctrlKey))
            return;
        if (event.key.toLowerCase() === "c" && gridManager.copySelection()) {
            toolState.clearCurrentTool();
            gridManager.enterPasteMode();
            event.preventDefault();
        }
    });
}
