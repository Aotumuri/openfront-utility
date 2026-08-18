import type { GridManager } from "./gridManager.js";

export function initCopyPasteShortcuts(gridManager: GridManager) {
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    if (event.key === "Escape") {
      gridManager.exitPasteMode();
      return;
    }
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key.toLowerCase() === "c" && gridManager.copySelection()) {
      // Keep the active tool while pasting. Clearing it switches the workspace
      // into move mode, whose capture handler prevents cell clicks from
      // reaching the paste handler.
      gridManager.enterPasteMode();
      event.preventDefault();
    }
  });
}
