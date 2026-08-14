import type { GridManager } from "./gridManager.js";
import type { ToolState } from "./toolState.js";

export function initCopyPasteShortcuts(gridManager: GridManager, toolState: ToolState) {
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    if (event.key === "Escape") {
      gridManager.exitPasteMode();
      return;
    }
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key.toLowerCase() === "c" && gridManager.copySelection()) {
      toolState.clearCurrentTool();
      gridManager.enterPasteMode();
      event.preventDefault();
    }
  });
}
