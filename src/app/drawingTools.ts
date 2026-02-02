export type DrawingTools = {
  drawCircle: (cx: number, cy: number, r: number, fill: boolean) => void;
  drawStar: (cx: number, cy: number, r: number) => void;
  floodFill: (sx: number, sy: number) => void;
};

type DrawingOptions = {
  getTileWidth: () => number;
  getTileHeight: () => number;
  getCellValue: (x: number, y: number) => number;
  setCellValue: (x: number, y: number, value: number) => void;
  getActiveColor: () => number;
};

export function createDrawingTools(options: DrawingOptions): DrawingTools {
  const { getTileWidth, getTileHeight, getCellValue, setCellValue, getActiveColor } =
    options;

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
        setCellValue(px, py, getActiveColor());
      }
    }
  }

  function drawCircle(cx: number, cy: number, r: number, fill: boolean) {
    const activeColor = getActiveColor();
    const width = getTileWidth();
    const height = getTileHeight();
    if (fill) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) {
            const px = cx + x;
            const py = cy + y;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              setCellValue(px, py, activeColor);
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
    const activeColor = getActiveColor();
    let dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    let err = dx + dy,
      e2;
    while (true) {
      setCellValue(x0, y0, activeColor);
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
    const width = getTileWidth();
    const height = getTileHeight();
    const get = (x: number, y: number) => getCellValue(x, y);
    const set = (x: number, y: number, v: number) => {
      setCellValue(x, y, v);
    };
    const target = get(sx, sy);
    const newValue = getActiveColor();
    if (target === newValue) return;
    const visited = Array(height)
      .fill(0)
      .map(() => Array(width).fill(false));
    const stack: [number, number][] = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      if (visited[y][x]) continue;
      if (get(x, y) !== target) continue;
      set(x, y, newValue);
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
