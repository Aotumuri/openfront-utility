export function initToolShortcuts(options) {
    const shortcuts = {
        p: options.pen,
        l: options.line,
        f: options.fill,
        h: options.shade,
        s: options.star,
        c: options.circle,
        t: options.stamp,
    };
    document.addEventListener("keydown", (event) => {
        var _a;
        const target = event.target;
        if (event.metaKey || event.ctrlKey || event.altKey || (target === null || target === void 0 ? void 0 : target.isContentEditable) || ["INPUT", "TEXTAREA", "SELECT"].includes((_a = target === null || target === void 0 ? void 0 : target.tagName) !== null && _a !== void 0 ? _a : ""))
            return;
        const button = shortcuts[event.key.toLowerCase()];
        if (!button)
            return;
        event.preventDefault();
        button.click();
    });
}
