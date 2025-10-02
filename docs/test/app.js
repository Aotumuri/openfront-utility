"use strict";
// UIロジック本体（TypeScript）
// v1のみ使用（2bit/px: 0=white,1=black-weak,2=black-normal,3=black-strong）
document.addEventListener("DOMContentLoaded", () => {
    // ===== Grid guide styles =====
    function injectGridGuideStyle() {
        if (document.getElementById("grid-guide-style"))
            return;
        const style = document.createElement("style");
        style.id = "grid-guide-style";
        style.textContent = `
      .cell.guide-v { border-left: 2px solid #222 !important; }
      .cell.guide-h { border-top: 2px solid #222 !important; }
      .cell.center-v { border-left: 2px solid red !important; }
      .cell.center-h { border-top: 2px solid blue !important; }
      .guide-btn-on { background: #222; color: #fff; font-weight: bold; }
      .guide-btn-off { background: #eee; color: #222; }
    `;
        document.head.appendChild(style);
    }
    injectGridGuideStyle();
    // ===== Guide buttons =====
    const toolbox = document.getElementById("toolbox");
    const blackGuideBtn = document.createElement("button");
    blackGuideBtn.textContent = "Grid Guide (Black)";
    blackGuideBtn.id = "gridGuideBlackBtn";
    blackGuideBtn.style.marginLeft = "8px";
    const centerGuideBtn = document.createElement("button");
    centerGuideBtn.textContent = "Center Guide (Red/Blue)";
    centerGuideBtn.id = "gridGuideCenterBtn";
    centerGuideBtn.style.marginLeft = "8px";
    if (toolbox) {
        toolbox.appendChild(blackGuideBtn);
        toolbox.appendChild(centerGuideBtn);
    }
    let gridGuideBlack = false;
    let gridGuideCenter = false;
    function updateGuideBtnStyle() {
        blackGuideBtn.className = gridGuideBlack ? "guide-btn-on" : "guide-btn-off";
        centerGuideBtn.className = gridGuideCenter ? "guide-btn-on" : "guide-btn-off";
    }
    blackGuideBtn.onclick = () => {
        gridGuideBlack = !gridGuideBlack;
        updateGuideBtnStyle();
        generateGrid();
    };
    centerGuideBtn.onclick = () => {
        gridGuideCenter = !gridGuideCenter;
        updateGuideBtnStyle();
        generateGrid();
    };
    updateGuideBtnStyle();
    // ===== DOM refs =====
    const base64Input = document.getElementById("base64Input");
    // tools
    const toolPenBtn = document.getElementById("tool-pen");
    const toolFillBtn = document.getElementById("tool-fill");
    const toolStarBtn = document.getElementById("tool-star");
    const toolCircleBtn = document.getElementById("tool-circle");
    let currentTool = "pen";
    // tool controls
    const starSizeInput = document.getElementById("star-size");
    const circleSizeInput = document.getElementById("circle-size");
    const circleFillInput = document.getElementById("circle-fill");
    const loadBtn = document.getElementById("loadBtn");
    const tileWidthInput = document.getElementById("tileWidth");
    const tileWidthValue = document.getElementById("tileWidth-value");
    const tileHeightInput = document.getElementById("tileHeight");
    const tileHeightValue = document.getElementById("tileHeight-value");
    const scaleInput = document.getElementById("scale");
    const scaleValue = document.getElementById("scale-value");
    const clearGridBtn = document.getElementById("clearGridBtn");
    const gridDiv = document.getElementById("grid");
    const outputTextarea = document.getElementById("output");
    const copyOutputBtn = document.getElementById("copyOutputBtn");
    const previewCanvas = document.getElementById("preview");
    const previewBgColorInput = document.getElementById("previewBgColor");
    const previewContext = previewCanvas.getContext("2d");
    if (!previewContext)
        throw new Error("2D context not supported");
    // ===== Shade helpers (v1=2bit/px) =====
    function getCellShadeIndex(cell) {
        if (!cell)
            return 0;
        const v = cell.dataset.shade;
        const n = v ? parseInt(v, 10) : 0;
        return isNaN(n) ? 0 : Math.max(0, Math.min(3, n));
    }
    function setCellActiveWithShade(cell, active, shadeIdx) {
        if (active) {
            cell.classList.add("active");
            const idx = shadeIdx === undefined ? 3 : Math.max(0, Math.min(3, shadeIdx)); // default strong
            cell.dataset.shade = String(idx);
        }
        else {
            cell.classList.remove("active");
            cell.removeAttribute("data-shade");
        }
    }
    function cycleCellShade(cell) {
        const cur = getCellShadeIndex(cell);
        const next = (cur + 1) % 4; // 0->1->2->3->0
        setCellActiveWithShade(cell, next > 0, next);
    }
    // ===== Shift buttons =====
    const shiftUpBtn = document.getElementById("shiftUpBtn");
    const shiftLeftBtn = document.getElementById("shiftLeftBtn");
    const shiftRightBtn = document.getElementById("shiftRightBtn");
    const shiftDownBtn = document.getElementById("shiftDownBtn");
    let tileWidth = parseInt(tileWidthInput.value);
    let tileHeight = parseInt(tileHeightInput.value);
    let isMouseDown = false;
    let toggleState = null;
    let isFirstLoad = true;
    document.body.onmousedown = () => (isMouseDown = true);
    document.body.onmouseup = () => {
        isMouseDown = false;
        toggleState = null;
    };
    tileWidthInput.addEventListener("input", () => {
        tileWidthValue.textContent = tileWidthInput.value;
        generateGrid();
    });
    tileHeightInput.addEventListener("input", () => {
        tileHeightValue.textContent = tileHeightInput.value;
        generateGrid();
    });
    scaleInput.addEventListener("input", () => {
        scaleValue.textContent = String(1 << parseInt(scaleInput.value));
        updateOutput();
    });
    // ===== Initial pattern (0/1). 1は描画時に既定で濃い(3)にする場合は下で変換 =====
    const initialPattern = [
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1,
        ],
        [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0,
        ],
        [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0,
        ],
        [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0,
        ],
        [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
        ],
        [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
        ],
        [
            0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
    ];
    function getCell(x, y) {
        const cell = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
        if (cell === null)
            throw new Error(`Missing cell (${x}, ${y})`);
        return cell;
    }
    // ===== Shift handlers (shade-aware) =====
    shiftLeftBtn.addEventListener("click", () => {
        for (let y = 0; y < tileHeight; y++) {
            const shades = [];
            for (let x = 0; x < tileWidth; x++) {
                const cell = getCell(x, y);
                shades.push(cell.classList.contains("active") ? getCellShadeIndex(cell) : 0);
            }
            const rotated = shades.map((_, x) => shades[(x + 1) % tileWidth]);
            for (let x = 0; x < tileWidth; x++) {
                const cell = getCell(x, y);
                const v = rotated[x];
                setCellActiveWithShade(cell, v > 0, v);
            }
        }
        updateOutput();
    });
    shiftRightBtn.addEventListener("click", () => {
        for (let y = 0; y < tileHeight; y++) {
            const shades = [];
            for (let x = 0; x < tileWidth; x++) {
                const cell = getCell(x, y);
                shades.push(cell.classList.contains("active") ? getCellShadeIndex(cell) : 0);
            }
            const rotated = shades.map((_, x) => shades[(x - 1 + tileWidth) % tileWidth]);
            for (let x = 0; x < tileWidth; x++) {
                const cell = getCell(x, y);
                const v = rotated[x];
                setCellActiveWithShade(cell, v > 0, v);
            }
        }
        updateOutput();
    });
    shiftDownBtn.addEventListener("click", () => {
        for (let x = 0; x < tileWidth; x++) {
            const shades = [];
            for (let y = 0; y < tileHeight; y++) {
                const cell = getCell(x, y);
                shades.push(cell.classList.contains("active") ? getCellShadeIndex(cell) : 0);
            }
            const rotated = shades.map((_, y) => shades[(y - 1 + tileHeight) % tileHeight]);
            for (let y = 0; y < tileHeight; y++) {
                const cell = getCell(x, y);
                const v = rotated[y];
                setCellActiveWithShade(cell, v > 0, v);
            }
        }
        updateOutput();
    });
    shiftUpBtn.addEventListener("click", () => {
        for (let x = 0; x < tileWidth; x++) {
            const shades = [];
            for (let y = 0; y < tileHeight; y++) {
                const cell = getCell(x, y);
                shades.push(cell.classList.contains("active") ? getCellShadeIndex(cell) : 0);
            }
            const rotated = shades.map((_, y) => shades[(y + 1) % tileHeight]);
            for (let y = 0; y < tileHeight; y++) {
                const cell = getCell(x, y);
                const v = rotated[y];
                setCellActiveWithShade(cell, v > 0, v);
            }
        }
        updateOutput();
    });
    // ===== Pattern IO =====
    function getCurrentPattern() {
        const pattern = [];
        for (let y = 0; y < tileHeight; y++) {
            const row = [];
            for (let x = 0; x < tileWidth; x++) {
                const cell = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
                const active = !!(cell && cell.classList.contains("active"));
                row.push(active ? getCellShadeIndex(cell) : 0);
            }
            pattern.push(row);
        }
        return pattern;
    }
    let currentHeight = 0;
    let currentWidth = 0;
    function generateGrid(pattern) {
        tileWidth = parseInt(tileWidthInput.value);
        tileHeight = parseInt(tileHeightInput.value);
        gridDiv.style.gridTemplateColumns = `repeat(${tileWidth}, 20px)`;
        const usePattern = pattern || (isFirstLoad ? initialPattern : getCurrentPattern());
        // Remove extra rows
        for (let y = tileHeight; y < currentHeight; y++) {
            for (const div of gridDiv.querySelectorAll(`.cell[data-y="${y}"]`)) {
                div.remove();
            }
        }
        // Remove extra cols
        for (let x = tileWidth; x < currentWidth; x++) {
            for (const div of gridDiv.querySelectorAll(`.cell[data-x="${x}"]`)) {
                div.remove();
            }
        }
        currentWidth = tileWidth;
        currentHeight = tileHeight;
        let lastCell;
        let centerV = [];
        let centerH = [];
        if (gridGuideCenter) {
            centerV = tileWidth % 2 === 0 ? [Math.floor(tileWidth / 2)] : [(tileWidth - 1) / 2, (tileWidth - 1) / 2 + 1];
            centerH = tileHeight % 2 === 0 ? [Math.floor(tileHeight / 2)] : [(tileHeight - 1) / 2, (tileHeight - 1) / 2 + 1];
        }
        for (let y = 0; y < tileHeight; y++) {
            for (let x = 0; x < tileWidth; x++) {
                let cell = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
                if (cell === null) {
                    cell = document.createElement("div");
                    cell.className = "cell";
                    cell.dataset.x = x.toString();
                    cell.dataset.y = y.toString();
                    if (lastCell !== undefined)
                        gridDiv.insertBefore(cell, lastCell.nextSibling);
                    else
                        gridDiv.appendChild(cell);
                }
                lastCell = cell;
                // clear guide classes
                cell.classList.remove("guide-v", "guide-h", "center-v", "center-h");
                // apply pattern (0..3)
                const pvRaw = usePattern[y] ? usePattern[y][x] : 0;
                const pv = Math.max(0, Math.min(3, pvRaw || 0));
                if (pv > 0)
                    setCellActiveWithShade(cell, true, pv);
                else
                    setCellActiveWithShade(cell, false);
                // guides
                if (gridGuideBlack) {
                    if (x !== 0 && x % 5 === 0)
                        cell.classList.add("guide-v");
                    if (y !== 0 && y % 5 === 0)
                        cell.classList.add("guide-h");
                }
                if (gridGuideCenter) {
                    if (centerV.indexOf(x) !== -1)
                        cell.classList.add("center-v");
                    if (centerH.indexOf(y) !== -1)
                        cell.classList.add("center-h");
                }
                // click/drag handlers
                cell.onclick = () => {
                    if (currentTool === "pen") {
                        // クリックで shade を循環
                        cycleCellShade(cell);
                    }
                    else if (currentTool === "fill") {
                        floodFill(x, y);
                    }
                    else if (currentTool === "star") {
                        const r = parseInt(starSizeInput.value);
                        drawStar(x, y, r);
                    }
                    else if (currentTool === "circle") {
                        const r = parseInt(circleSizeInput.value);
                        const fill = circleFillInput.checked;
                        drawCircle(x, y, r, fill);
                    }
                    updateOutput();
                };
                cell.onmouseover = () => {
                    if (isMouseDown && currentTool === "pen") {
                        if (toggleState === null) {
                            toggleState = !cell.classList.contains("active");
                        }
                        if (toggleState) {
                            // ドラッグ描画は既定で濃い(3)
                            setCellActiveWithShade(cell, true, 3);
                        }
                        else {
                            setCellActiveWithShade(cell, false);
                        }
                        updateOutput();
                    }
                };
            }
        }
        isFirstLoad = false;
        updateOutput();
    }
    // ===== Tool switching =====
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
    // ===== Shapes =====
    function drawCircle(cx, cy, r, fill) {
        if (fill) {
            for (let y = -r; y <= r; y++) {
                for (let x = -r; x <= r; x++) {
                    if (x * x + y * y <= r * r) {
                        const px = cx + x;
                        const py = cy + y;
                        if (px >= 0 && px < tileWidth && py >= 0 && py < tileHeight) {
                            const c = gridDiv.querySelector(`.cell[data-x='${px}'][data-y='${py}']`);
                            if (c)
                                setCellActiveWithShade(c, true, 3);
                        }
                    }
                }
            }
        }
        else {
            let x = r, y = 0, err = 0;
            while (x >= y) {
                plotCirclePoints(cx, cy, x, y);
                y++;
                if (err <= 0) {
                    err += 2 * y + 1;
                }
                else {
                    x--;
                    err -= 2 * x + 1;
                }
            }
        }
    }
    function plotCirclePoints(cx, cy, x, y) {
        const pts = [
            [cx + x, cy + y], [cx + y, cy + x], [cx - y, cy + x], [cx - x, cy + y],
            [cx - x, cy - y], [cx - y, cy - x], [cx + y, cy - x], [cx + x, cy - y],
        ];
        for (const [px, py] of pts) {
            if (px >= 0 && px < tileWidth && py >= 0 && py < tileHeight) {
                const c = gridDiv.querySelector(`.cell[data-x='${px}'][data-y='${py}']`);
                if (c)
                    setCellActiveWithShade(c, true, 3);
            }
        }
    }
    starSizeInput.oninput = () => { };
    circleSizeInput.oninput = () => { };
    circleFillInput.onchange = () => { };
    // ブレゼンハム
    function drawLine(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
        let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        let err = dx + dy, e2;
        while (true) {
            const c = gridDiv.querySelector(`.cell[data-x='${x0}'][data-y='${y0}']`);
            if (c)
                setCellActiveWithShade(c, true, 3);
            if (x0 === x1 && y0 === y1)
                break;
            e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
    // 塗りつぶし
    function floodFill(sx, sy) {
        const get = (x, y) => {
            var _a;
            return ((_a = gridDiv
                .querySelector(`.cell[data-x='${x}'][data-y='${y}']`)) === null || _a === void 0 ? void 0 : _a.classList.contains("active")) ? 1 : 0;
        };
        const set = (x, y, v) => {
            const c = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
            if (!c)
                return;
            if (v)
                setCellActiveWithShade(c, true, 3);
            else
                setCellActiveWithShade(c, false);
        };
        const target = get(sx, sy);
        const newValue = target ? 0 : 1;
        if (get(sx, sy) === newValue)
            return;
        const visited = Array(tileHeight).fill(0).map(() => Array(tileWidth).fill(false));
        const stack = [[sx, sy]];
        while (stack.length) {
            const [x, y] = stack.pop();
            if (x < 0 || y < 0 || x >= tileWidth || y >= tileHeight)
                continue;
            if (visited[y][x])
                continue;
            if (get(x, y) !== target)
                continue;
            set(x, y, newValue);
            visited[y][x] = true;
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
    // Star
    function drawStar(cx, cy, r) {
        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
            points.push([Math.round(cx + r * Math.cos(angle)), Math.round(cy + r * Math.sin(angle))]);
        }
        for (let i = 0; i < 5; i++) {
            drawLine(cx, cy, points[i][0], points[i][1]);
            drawLine(points[i][0], points[i][1], points[(i + 2) % 5][0], points[(i + 2) % 5][1]);
        }
    }
    // ===== Utils =====
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16),
        } : { r: 255, g: 255, b: 255 };
    }
    function generatePatternBase64(pattern, width, height, scale) {
        const w_bin = width - 2;
        const h_bin = height - 2;
        if (scale !== (scale & 0x07))
            throw new Error(`Invalid scale: ${scale}`);
        if (w_bin !== (w_bin & 0x7f))
            throw new Error(`Invalid width: ${width}`);
        if (h_bin !== (h_bin & 0x3f))
            throw new Error(`Invalid height: ${height}`);
        const version = 1; // v1 only (2 bits per pixel)
        const header = new Uint8Array(3);
        header[0] = version;
        header[1] = (scale & 0x7) | ((w_bin & 0x1f) << 3);
        header[2] = ((w_bin & 0x60) >> 5) | ((h_bin & 0x3f) << 2);
        const totalBits = width * height * 2;
        const totalBytes = Math.ceil(totalBits / 8);
        const data = new Uint8Array(totalBytes);
        const write2 = (pixelIndex, value) => {
            const bitPos = pixelIndex * 2;
            const byteIndex = bitPos >> 3;
            const offset = bitPos & 7;
            const v = value & 0b11;
            data[byteIndex] |= v << offset;
            const spill = offset + 2 - 8;
            if (spill > 0) {
                data[byteIndex + 1] |= v >> (2 - spill);
            }
        };
        let p = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++, p++) {
                const v = pattern[y] && pattern[y][x] ? pattern[y][x] : 0;
                const shadeVal = Math.max(0, Math.min(3, v));
                write2(p, shadeVal);
            }
        }
        const full = new Uint8Array(header.length + data.length);
        full.set(header, 0);
        full.set(data, header.length);
        return btoa(String.fromCharCode(...full)).replace(/\+/g, "-").replace(/\//g, "_").replace(/\=/g, "");
    }
    function updateOutput() {
        const pattern = getCurrentPattern();
        const scale = parseInt(scaleInput.value);
        const base64 = generatePatternBase64(pattern, tileWidth, tileHeight, scale);
        outputTextarea.value = base64;
        renderPreview(base64);
        history.replaceState(null, "", "#" + base64);
    }
    function renderPreview(b64) {
        const decoder = new window.PatternDecoder_v1(b64);
        const width = 512, height = 512;
        previewCanvas.width = width;
        previewCanvas.height = height;
        const bgRgb = hexToRgb(previewBgColorInput.value);
        const imageData = previewContext.createImageData(width, height);
        const data = imageData.data;
        let i = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const shadeIdx = decoder.getShade(x, y); // 0..3
                if (shadeIdx === 0) {
                    data[i++] = 255;
                    data[i++] = 255;
                    data[i++] = 255;
                    data[i++] = 255;
                }
                else {
                    const a = [0, 0.28, 0.58, 0.88][shadeIdx];
                    const inv = 1 - a;
                    const r = Math.round(bgRgb.r * inv);
                    const g = Math.round(bgRgb.g * inv);
                    const b = Math.round(bgRgb.b * inv);
                    data[i++] = r;
                    data[i++] = g;
                    data[i++] = b;
                    data[i++] = 255;
                }
            }
        }
        previewContext.putImageData(imageData, 0, 0);
    }
    function loadFromBase64() {
        const base64 = base64Input.value;
        if (!base64)
            return;
        let decoder;
        try {
            decoder = new window.PatternDecoder_v1(base64);
        }
        catch (e) {
            alert(e.message);
            return;
        }
        tileWidth = decoder.getTileWidth();
        tileHeight = decoder.getTileHeight();
        const scale = decoder.getScale();
        tileWidthInput.value = tileWidth.toString();
        tileHeightInput.value = tileHeight.toString();
        tileWidthValue.textContent = tileWidthInput.value;
        tileHeightValue.textContent = tileHeightInput.value;
        scaleInput.value = scale.toString();
        scaleValue.textContent = String(1 << parseInt(scaleInput.value));
        const pattern = new Array(tileHeight);
        for (let y = 0; y < tileHeight; y++) {
            const row = new Array(tileWidth);
            for (let x = 0; x < tileWidth; x++) {
                row[x] = decoder.getShade(x << scale, y << scale); // 0..3
            }
            pattern[y] = row;
        }
        generateGrid(pattern);
    }
    function copyOutput() {
        outputTextarea.select();
        document.execCommand("copy");
    }
    // Events
    loadBtn.onclick = loadFromBase64;
    clearGridBtn.onclick = clearGrid;
    copyOutputBtn.onclick = copyOutput;
    previewBgColorInput.addEventListener("change", updateOutput);
    function clearGrid() {
        const cells = gridDiv.querySelectorAll(".cell");
        cells.forEach((cell) => setCellActiveWithShade(cell, false));
        updateOutput();
    }
    // 初期化
    const hash = window.location.hash;
    if (hash.startsWith("#")) {
        base64Input.value = hash.slice(1);
        setTimeout(loadFromBase64, 0);
    }
    generateGrid();
});
