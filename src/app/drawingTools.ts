export type DrawingTools = {
  drawCircle: (cx: number, cy: number, r: number, fill: boolean) => void;
  drawStar: (cx: number, cy: number, r: number) => void;
  floodFill: (sx: number, sy: number) => void;
};

type DrawingOptions = {
  gridDiv: HTMLElement;
  getTileWidth: () => number;
  getTileHeight: () => number;
};

export function createDrawingTools(options: DrawingOptions): DrawingTools {
  const { gridDiv, getTileWidth, getTileHeight } = options;

  function plotCirclePoints(
    cx: number,
    cy: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
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
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const c = gridDiv.querySelector(
          `.cell[data-x='${px}'][data-y='${py}']`
        );
        if (c) c.classList.add("active");
      }
    }
  }

  function drawCircle(cx: number, cy: number, r: number, fill: boolean) {
    const width = getTileWidth();
    const height = getTileHeight();
    if (fill) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) {
            const px = cx + x;
            const py = cy + y;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const c = gridDiv.querySelector(
                `.cell[data-x='${px}'][data-y='${py}']`
              );
              if (c) c.classList.add("active");
            }
          }
        }
      }
    } else {
      let x = r,
        y = 0,
        err = 0;
      while (x >= y) {
        plotCirclePoints(cx, cy, x, y, width, height);
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

  function drawStar(cx: number, cy: number, r: number) {
    const points: [number, number][] = [];
    for (let i = 0; i < 5; i++) {
      const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
      points.push([
        Math.round(cx + r * Math.cos(angle)),
        Math.round(cy + r * Math.sin(angle)),
      ]);
    }
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

  function floodFill(sx: number, sy: number) {
    gridDiv.querySelectorAll(".cell");
    const width = getTileWidth();
    const height = getTileHeight();
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
    const visited = Array(height)
      .fill(0)
      .map(() => Array(width).fill(false));
    const stack: [number, number][] = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      if (visited[y][x]) continue;
      if (get(x, y) !== target) continue;
      set(x, y, newValue as 0 | 1);
      visited[y][x] = true;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }

  return {
    drawCircle,
    drawStar,
    floodFill,
  };
}
