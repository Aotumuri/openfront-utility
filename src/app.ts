// UIロジック本体（TypeScript）

// ここに既存index.htmlのロジックをTypeScriptで移植していきます
// まずはイベントリスナーやDOM操作の雛形を用意

document.addEventListener("DOMContentLoaded", () => {
  // Add grid guide style for better grid visibility
  function injectGridGuideStyle() {
    if (document.getElementById("grid-guide-style")) return;
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

  // Add separate guide buttons
  injectGridGuideStyle();
  const toolbox = document.getElementById("toolbox");
  // Black line (5-grid) button
  const blackGuideBtn = document.createElement("button");
  blackGuideBtn.textContent = "Grid Guide (Black)";
  blackGuideBtn.id = "gridGuideBlackBtn";
  blackGuideBtn.style.marginLeft = "8px";
  // Center line (red/blue) button
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

  // Get all necessary elements
  const base64Input = document.getElementById(
    "base64Input"
  ) as HTMLInputElement;
  // Tool buttons
  const toolPenBtn = document.getElementById("tool-pen") as HTMLButtonElement;
  const toolFillBtn = document.getElementById("tool-fill") as HTMLButtonElement;
  const toolStarBtn = document.getElementById("tool-star") as HTMLButtonElement;
  const toolCircleBtn = document.getElementById(
    "tool-circle"
  ) as HTMLButtonElement;
  let currentTool: "pen" | "fill" | "star" | "circle" = "pen";
  // Tool controls
  const starSizeInput = document.getElementById(
    "star-size"
  ) as HTMLInputElement;
  const circleSizeInput = document.getElementById(
    "circle-size"
  ) as HTMLInputElement;
  const circleFillInput = document.getElementById(
    "circle-fill"
  ) as HTMLInputElement;

  const loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  const tileWidthInput = document.getElementById(
    "tileWidth"
  ) as HTMLInputElement;
  const tileWidthValue = document.getElementById(
    "tileWidth-value"
  ) as HTMLSpanElement;
  const tileHeightInput = document.getElementById(
    "tileHeight"
  ) as HTMLInputElement;
  const tileHeightValue = document.getElementById(
    "tileHeight-value"
  ) as HTMLSpanElement;
  const scaleInput = document.getElementById("scale") as HTMLInputElement;
  const scaleValue = document.getElementById("scale-value") as HTMLSpanElement;
  const patternNameInput = document.getElementById(
    "patternName"
  ) as HTMLInputElement;
  const clearGridBtn = document.getElementById(
    "clearGridBtn"
  ) as HTMLButtonElement;
  const gridDiv = document.getElementById("grid")!;
  const outputTextarea = document.getElementById(
    "output"
  ) as HTMLTextAreaElement;
  const copyOutputBtn = document.getElementById(
    "copyOutputBtn"
  ) as HTMLButtonElement;
  const downloadBinBtn = document.getElementById(
    "downloadBinBtn"
  ) as HTMLButtonElement;
  const previewCanvas = document.getElementById("preview") as HTMLCanvasElement;

  const previewContext = previewCanvas.getContext("2d")!;
  if (!previewContext) throw new Error("2D context not supported");

  // Shift pattern buttons
  const shiftUpBtn = document.getElementById("shiftUpBtn") as HTMLButtonElement;
  const shiftLeftBtn = document.getElementById(
    "shiftLeftBtn"
  ) as HTMLButtonElement;
  const shiftRightBtn = document.getElementById(
    "shiftRightBtn"
  ) as HTMLButtonElement;
  const shiftDownBtn = document.getElementById(
    "shiftDownBtn"
  ) as HTMLButtonElement;

  let tileWidth = parseInt(tileWidthInput.value);
  let tileHeight = parseInt(tileHeightInput.value);
  let isMouseDown = false;
  let toggleState: boolean | null = null;
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
  patternNameInput.addEventListener("input", updateOutput);

  // 初期パターン
  const initialPattern: number[][] = [
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0,
      0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
      0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0,
    ],
    [
      0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1,
      0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
      1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    [
      0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
      1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
      1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    [
      0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0,
      0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    [
      0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
      0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0,
      1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    [
      0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0,
      0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
      1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0,
      0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1,
      0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  ];

  function getCell(x: number, y: number) {
    const cell = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
    if (cell === null) throw new Error(`Missing cell (${x}, ${y})`);
    return cell;
  }

  shiftLeftBtn.addEventListener("click", () => {
    for (let y = 0; y < tileHeight; y++) {
      const firstCell = getCell(tileWidth - 1, y);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let x = tileWidth - 2; x >= 0; x--) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    updateOutput();
  });
  shiftRightBtn.addEventListener("click", () => {
    for (let y = 0; y < tileHeight; y++) {
      const firstCell = getCell(0, y);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let x = 1; x < tileWidth; x++) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    updateOutput();
  });
  shiftDownBtn.addEventListener("click", () => {
    for (let x = 0; x < tileWidth; x++) {
      const firstCell = getCell(x, 0);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let y = 1; y < tileHeight; y++) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    updateOutput();
  });
  shiftUpBtn.addEventListener("click", () => {
    for (let x = 0; x < tileWidth; x++) {
      const firstCell = getCell(x, tileHeight - 1);
      let firstActive = firstCell.classList.contains("active");
      let active = firstActive;
      for (let y = tileHeight - 2; y >= 0; y--) {
        const nextCell = getCell(x, y);
        let nextActive = nextCell.classList.contains("active");
        if (active !== nextActive) {
          nextCell.classList.toggle("active", active);
          active = nextActive;
        }
      }
      if (firstActive !== active) {
        firstCell.classList.toggle("active", active);
      }
    }
    updateOutput();
  });

  function getCurrentPattern(): number[][] {
    const pattern: number[][] = [];
    for (let y = 0; y < tileHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < tileWidth; x++) {
        const cell = gridDiv.querySelector(
          `.cell[data-x='${x}'][data-y='${y}']`
        );
        row.push(cell && cell.classList.contains("active") ? 1 : 0);
      }
      pattern.push(row);
    }
    return pattern;
  }

  let currentHeight = 0;
  let currentWidth = 0;
  function generateGrid(pattern?: number[][]) {
    tileWidth = parseInt(tileWidthInput.value);
    tileHeight = parseInt(tileHeightInput.value);
    gridDiv.style.gridTemplateColumns = `repeat(${tileWidth}, 20px)`;
    const usePattern =
      pattern || (isFirstLoad ? initialPattern : getCurrentPattern());

    // Remove extra rows
    for (let y = tileHeight; y < currentHeight; y++) {
      // console.log(`Removing row ${y}`);
      for (const div of gridDiv.querySelectorAll(`.cell[data-y="${y}"]`)) {
        div.remove();
      }
    }

    // Remove extra columns
    for (let x = tileWidth; x < currentWidth; x++) {
      // console.log(`Removing column ${x}`);
      for (const div of gridDiv.querySelectorAll(`.cell[data-x="${x}"]`)) {
        div.remove();
      }
    }
    currentWidth = tileWidth;
    currentHeight = tileHeight;

    let lastCell: HTMLDivElement | undefined;
    // Calculate center lines for guide (odd: 1 line, even: 2 lines)
    let centerV: number[] = [];
    let centerH: number[] = [];
    if (gridGuideCenter) {
      // For even, two center lines; for odd, one center line
      if (tileWidth % 2 === 0) {
        centerV = [Math.floor(tileWidth / 2)];
      } else {
        centerV = [(tileWidth - 1) / 2, (tileWidth - 1) / 2 + 1];
      }
      if (tileHeight % 2 === 0) {
        centerH = [Math.floor(tileHeight / 2)];
      } else {
        centerH = [(tileHeight - 1) / 2, (tileHeight - 1) / 2 + 1];
      }
    }
    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        let cell: HTMLDivElement | null = gridDiv.querySelector(
          `.cell[data-x='${x}'][data-y='${y}']`
        );
        if (cell === null) {
          // Create missing cell
          cell = document.createElement("div");
          cell.className = "cell";
          cell.dataset.x = x.toString();
          cell.dataset.y = y.toString();
          if (lastCell !== undefined) {
            gridDiv.insertBefore(cell, lastCell.nextSibling);
          } else {
            gridDiv.appendChild(cell);
          }
        }
        lastCell = cell;
        // Remove all guide classes first
        cell.classList.remove("guide-v", "guide-h", "center-v", "center-h");
        if (usePattern[y] && usePattern[y][x] === 1) {
          cell.classList.add("active");
        } else {
          cell.classList.remove("active");
        }

        // Add black guide lines if enabled
        if (gridGuideBlack) {
          if (x !== 0 && x % 5 === 0) cell.classList.add("guide-v");
          if (y !== 0 && y % 5 === 0) cell.classList.add("guide-h");
        }
        // Add center lines if enabled
        if (gridGuideCenter) {
          if (centerV.indexOf(x) !== -1) cell.classList.add("center-v");
          if (centerH.indexOf(y) !== -1) cell.classList.add("center-h");
        }

        cell.onclick = () => {
          if (currentTool === "pen") {
            cell.classList.toggle("active");
          } else if (currentTool === "fill") {
            floodFill(x, y);
          } else if (currentTool === "star") {
            const r = parseInt(starSizeInput.value);
            drawStar(x, y, r);
          } else if (currentTool === "circle") {
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
              cell.classList.add("active");
            } else {
              cell.classList.remove("active");
            }
            updateOutput();
          }
        };
      }
    }
    isFirstLoad = false;
    updateOutput();
  }

  // Read the pattern from the window hash
  const hash = window.location.hash;
  if (hash.startsWith("#")) {
    base64Input.value = hash.slice(1);
    setTimeout(loadFromBase64, 0);
  }

  // ツール切り替えUI
  function selectTool(tool: "pen" | "fill" | "star" | "circle") {
    currentTool = tool;
    [toolPenBtn, toolFillBtn, toolStarBtn, toolCircleBtn].forEach((btn) =>
      btn.classList.remove("selected")
    );
    if (tool === "pen") toolPenBtn.classList.add("selected");
    if (tool === "fill") toolFillBtn.classList.add("selected");
    if (tool === "star") toolStarBtn.classList.add("selected");
    if (tool === "circle") toolCircleBtn.classList.add("selected");
  }
  toolPenBtn.onclick = () => selectTool("pen");
  toolFillBtn.onclick = () => selectTool("fill");
  toolStarBtn.onclick = () => selectTool("star");
  toolCircleBtn.onclick = () => selectTool("circle");
  selectTool("pen");

  // Draw a circle at (cx, cy) with radius r, optionally filled
  function drawCircle(cx: number, cy: number, r: number, fill: boolean) {
    if (fill) {
      // Midpoint circle fill
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) {
            const px = cx + x;
            const py = cy + y;
            if (px >= 0 && px < tileWidth && py >= 0 && py < tileHeight) {
              const c = gridDiv.querySelector(
                `.cell[data-x='${px}'][data-y='${py}']`
              );
              if (c) c.classList.add("active");
            }
          }
        }
      }
    } else {
      // Midpoint circle outline
      let x = r,
        y = 0,
        err = 0;
      while (x >= y) {
        plotCirclePoints(cx, cy, x, y);
        y++;
        if (err <= 0) {
          err += 2 * y + 1;
        } else {
          x--;
          err -= 2 * x + 1;
        }
      }
    }
  }
  function plotCirclePoints(cx: number, cy: number, x: number, y: number) {
    const pts = [
      [cx + x, cy + y],
      [cx + y, cy + x],
      [cx - y, cy + x],
      [cx - x, cy + y],
      [cx - x, cy - y],
      [cx - y, cy - x],
      [cx + y, cy - x],
      [cx + x, cy - y],
    ];
    for (const [px, py] of pts) {
      if (px >= 0 && px < tileWidth && py >= 0 && py < tileHeight) {
        const c = gridDiv.querySelector(
          `.cell[data-x='${px}'][data-y='${py}']`
        );
        if (c) c.classList.add("active");
      }
    }
  }

  // 塗りつぶし（バケツ）
  function floodFill(sx: number, sy: number) {
    const cells = gridDiv.querySelectorAll(".cell");
    const get = (x: number, y: number) => {
      return gridDiv
        .querySelector(`.cell[data-x='${x}'][data-y='${y}']`)
        ?.classList.contains("active")
        ? 1
        : 0;
    };
    const set = (x: number, y: number, v: 0 | 1) => {
      const c = gridDiv.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
      if (c) {
        if (v) c.classList.add("active");
        else c.classList.remove("active");
      }
    };
    const target = get(sx, sy);
    const newValue = target ? 0 : 1;
    if (get(sx, sy) === newValue) return;
    const visited = Array(tileHeight)
      .fill(0)
      .map(() => Array(tileWidth).fill(false));
    const stack: [number, number][] = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || y < 0 || x >= tileWidth || y >= tileHeight) continue;
      if (visited[y][x]) continue;
      if (get(x, y) !== target) continue;
      set(x, y, newValue as 0 | 1);
      visited[y][x] = true;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }

  // Draw a star at (cx, cy) with radius r
  function drawStar(cx: number, cy: number, r: number) {
    // 5-pointed star
    const points: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
      points.push([
        Math.round(cx + r * Math.cos(angle)),
        Math.round(cy + r * Math.sin(angle)),
      ]);
    }
    // Draw star lines
    for (let i = 0; i < 5; i++) {
      drawLine(cx, cy, points[i][0], points[i][1]);
      drawLine(
        points[i][0],
        points[i][1],
        points[(i + 2) % 5][0],
        points[(i + 2) % 5][1]
      );
    }
  }
  // When tool controls change, update tool (for immediate feedback if needed)
  starSizeInput.oninput = () => {
    if (currentTool === "star") {
      // Optionally, could preview star size on hover, but for now do nothing
    }
  };
  circleSizeInput.oninput = () => {
    if (currentTool === "circle") {
      // Optionally, could preview circle size on hover, but for now do nothing
    }
  };
  circleFillInput.onchange = () => {
    if (currentTool === "circle") {
      // Optionally, could preview fill on hover, but for now do nothing
    }
  };
  // ブレゼンハムの線分アルゴリズム
  function drawLine(x0: number, y0: number, x1: number, y1: number) {
    let dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    let err = dx + dy,
      e2;
    while (true) {
      const c = gridDiv.querySelector(`.cell[data-x='${x0}'][data-y='${y0}']`);
      if (c) c.classList.add("active");
      if (x0 === x1 && y0 === y1) break;
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

  function clearGrid() {
    const cells = gridDiv.querySelectorAll(".cell");
    cells.forEach((cell) => cell.classList.remove("active"));
    updateOutput();
  }

  function generatePatternBase64(
    pattern: number[][],
    width: number,
    height: number,
    scale: number
  ): string {
    const w_bin = width - 2;
    const h_bin = height - 2;
    if (scale !== (scale & 0x07)) throw new Error(`Invalid scale: ${scale}`);
    if (w_bin !== (w_bin & 0x7f)) throw new Error(`Invalid width: ${width}`);
    if (h_bin !== (h_bin & 0x3f)) throw new Error(`Invalid height: ${height}`);
    const version = 0;
    const header = new Uint8Array(3);
    header[0] = version;
    header[1] = (scale & 0x7) | ((w_bin & 0x1f) << 3);
    header[2] = ((w_bin & 0x60) >> 5) | ((h_bin & 0x3f) << 2);
    const totalBits = width * height;
    const totalBytes = Math.ceil(totalBits / 8);
    const data = new Uint8Array(totalBytes);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const byteIndex = Math.floor(idx / 8);
        const bitOffset = idx % 8;
        if (pattern[y][x]) {
          data[byteIndex] |= 1 << bitOffset;
        }
      }
    }
    const full = new Uint8Array(header.length + data.length);
    full.set(header, 0);
    full.set(data, header.length);
    return btoa(String.fromCharCode(...full))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/\=/g, "");
  }

  function updateOutput() {
    const pattern = getCurrentPattern();
    const name = patternNameInput.value;
    const scale = parseInt(scaleInput.value);
    const base64 = generatePatternBase64(pattern, tileWidth, tileHeight, scale);
    const formatted = JSON.stringify({ [base64]: { name } });
    outputTextarea.value = formatted;
    renderPreview(base64);

    // Store the pattern in the window hash
    history.replaceState(null, "", "#" + base64);
  }

  function renderPreview(pattern: string) {
    const decoder = new PatternDecoder(pattern);
    const width = 1600;
    const height = 900;
    previewCanvas.width = width;
    previewCanvas.height = height;

    // Draw the image
    const imageData = previewContext.createImageData(width, height);
    const data = imageData.data;
    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = decoder.isSet(x, y) ? 0 : 255; // black if set
        const alpha = 255 - value;
        data[i++] = value; // R
        data[i++] = value; // G
        data[i++] = value; // B
        data[i++] = alpha;
      }
    }

    previewContext.putImageData(imageData, 0, 0);
  }

  function loadFromBase64() {
    const base64 = base64Input.value;
    if (!base64) return;
    let decoder: PatternDecoder;
    try {
      decoder = new PatternDecoder(base64);
    } catch (e) {
      alert((e as Error).message);
      return;
    }
    // デコードした値でboxを更新
    tileWidth = decoder.getTileWidth();
    tileHeight = decoder.getTileHeight();
    const scale = decoder.getScale();
    tileWidthInput.value = tileWidth.toString();
    tileHeightInput.value = tileHeight.toString();
    tileWidthValue.textContent = tileWidthInput.value;
    tileHeightValue.textContent = tileHeightInput.value;
    scaleInput.value = scale.toString();
    const pattern: number[][] = new Array(tileHeight);
    for (let y = 0; y < tileHeight; y++) {
      const row: number[] = new Array(tileWidth);
      for (let x = 0; x < tileWidth; x++) {
        row[x] = decoder.isSet(x << scale, y << scale) ? 1 : 0;
      }
      pattern[y] = row;
    }
    generateGrid(pattern);
  }

  function copyOutput() {
    outputTextarea.select();
    document.execCommand("copy");
  }

  function downloadBin() {
    const pattern = getCurrentPattern();
    const height = pattern.length;
    const width = pattern[0]?.length || 0;
    const scale = parseInt(scaleInput.value) || 1;
    const header = new Uint8Array(3);
    header[0] = 1; // version
    header[1] = (scale & 0x7) | ((width & 0x1f) << 3);
    header[2] = ((width & 0x60) >> 5) | ((height & 0x3f) << 2);
    const totalBits = width * height;
    const totalBytes = Math.ceil(totalBits / 8);
    const data = new Uint8Array(totalBytes);
    let bitIndex = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (pattern[y][x]) {
          const byteIndex = Math.floor(bitIndex / 8);
          const bitOffset = bitIndex % 8;
          data[byteIndex] |= 1 << bitOffset;
        }
        bitIndex++;
      }
    }
    const full = new Uint8Array(header.length + data.length);
    full.set(header, 0);
    full.set(data, header.length);
    const blob = new Blob([full], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = patternNameInput.value.trim() || "pattern";
    a.download = name.replace(/\s+/g, "_") + ".bin";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // イベントバインド
  loadBtn.onclick = loadFromBase64;
  clearGridBtn.onclick = clearGrid;
  copyOutputBtn.onclick = copyOutput;
  downloadBinBtn.onclick = downloadBin;

  // 初期グリッド生成
  generateGrid();
});
