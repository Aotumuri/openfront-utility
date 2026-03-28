import { getCircleCells } from "./circleGeometry.js";

export type DrawingTools = {
  drawLine: (x0: number, y0: number, x1: number, y1: number) => void;
  drawCircle: (cx: number, cy: number, r: number, fill: boolean) => void;
  drawStar: (cx: number, cy: number, r: number) => void;
  floodFill: (sx: number, sy: number) => void;
};

type DrawingOptions = {
  getTileWidth: () => number;
  getTileHeight: () => number;
  isCellActive: (x: number, y: number) => boolean;
  setCellActive: (x: number, y: number, active: boolean) => void;
};

export function createDrawingTools(options: DrawingOptions): DrawingTools {
  const { getTileWidth, getTileHeight, isCellActive, setCellActive } = options;

  function drawCircle(cx: number, cy: number, r: number, fill: boolean) {
    const width = getTileWidth();
    const height = getTileHeight();
    const points = getCircleCells({ x: cx, y: cy }, r, fill, width, height);
    points.forEach((point) => setCellActive(point.x, point.y, true));
  }

  function drawLine(x0: number, y0: number, x1: number, y1: number) {
    let dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    let err = dx + dy,
      e2;
    while (true) {
      setCellActive(x0, y0, true);
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
    const get = (x: number, y: number) => {
      return isCellActive(x, y) ? 1 : 0;
    };
    const set = (x: number, y: number, v: 0 | 1) => {
      setCellActive(x, y, v === 1);
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
    drawLine,
    drawCircle,
    drawStar,
    floodFill,
  };
}
