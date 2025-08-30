"use strict";
/// <reference lib="es2017" />
function renderPatternsFromInput(container) {
    const input = document.getElementById("json-input").value;
    try {
        const parsed = JSON.parse(input);
        localStorage.setItem("last-pattern-json", input);
        const patterns = parsed.patterns;
        container.innerHTML = "";
        Object.entries(patterns).
            forEach(([key, { name, pattern }]) => {
            const div = document.createElement("div");
            div.className = "pattern-item";
            const nameEl = document.createElement("div");
            nameEl.className = "pattern-name";
            nameEl.textContent = name !== null && name !== void 0 ? name : key;
            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext("2d");
            try {
                const decoder = new PatternDecoder(pattern);
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                const data = imageData.data;
                let i = 0;
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const value = decoder.isSet(x, y) ? 0 : 255;
                        data[i++] = value;
                        data[i++] = value;
                        data[i++] = value;
                        data[i++] = 255;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                div.appendChild(canvas);
            }
            catch (e) {
                console.error(e);
                const error = document.createElement("div");
                error.textContent = "Invalid pattern";
                div.appendChild(error);
            }
            div.appendChild(nameEl);
            container.appendChild(div);
        });
    }
    catch (err) {
        alert("Invalid JSON");
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("pattern-list");
    const button = document.getElementById("load-button");
    const textarea = document.getElementById("json-input");
    if (!container || !textarea) {
        console.warn("Missing required elements: #pattern-list or #json-input");
        return;
    }
    // Prefer hash -> then last saved -> else keep whatever is there
    const hash = decodeURIComponent(location.hash);
    if (hash.startsWith("#json=")) {
        const json = hash.slice(6);
        try {
            textarea.value = json;
            localStorage.setItem("last-pattern-json", json);
        }
        catch (_a) {
            console.warn("Failed to parse pattern JSON from URL hash");
        }
    }
    else {
        const lastInput = localStorage.getItem("last-pattern-json");
        if (lastInput !== null) {
            textarea.value = lastInput;
        }
    }
    if (button) {
        button.addEventListener("click", () => renderPatternsFromInput(container));
    }
    // Auto-render if a #json=... hash is present
    if (hash.startsWith("#json=")) {
        renderPatternsFromInput(container);
    }
});
