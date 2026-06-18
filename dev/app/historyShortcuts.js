const isEditableTarget = (target) => {
    if (!(target instanceof HTMLElement))
        return false;
    if (target.isContentEditable)
        return true;
    const tagName = target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select";
};
export function setupHistoryShortcuts(options) {
    const { onUndo, onRedo } = options;
    document.addEventListener("keydown", (event) => {
        if (event.defaultPrevented || isEditableTarget(event.target))
            return;
        const key = event.key.toLowerCase();
        const hasModifier = event.metaKey || event.ctrlKey;
        const isUndo = hasModifier && !event.shiftKey && key === "z";
        const isRedo = hasModifier && event.shiftKey && key === "z";
        if (isUndo) {
            event.preventDefault();
            onUndo();
            return;
        }
        if (isRedo) {
            event.preventDefault();
            onRedo();
        }
    });
}
