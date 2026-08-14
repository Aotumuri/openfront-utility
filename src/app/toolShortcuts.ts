type ToolShortcutOptions = {
  pen: HTMLButtonElement;
  line: HTMLButtonElement;
  fill: HTMLButtonElement;
  star: HTMLButtonElement;
  circle: HTMLButtonElement;
  stamp: HTMLButtonElement;
};

export function initToolShortcuts(options: ToolShortcutOptions) {
  const shortcuts: Record<string, HTMLButtonElement> = {
    p: options.pen,
    l: options.line,
    f: options.fill,
    s: options.star,
    c: options.circle,
    t: options.stamp,
  };
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    if (event.metaKey || event.ctrlKey || event.altKey || target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
    const button = shortcuts[event.key.toLowerCase()];
    if (!button) return;
    event.preventDefault();
    button.click();
  });
}
