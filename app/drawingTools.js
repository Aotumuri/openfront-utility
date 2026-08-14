import { getCircleCells } from "./circleGeometry.js";
import { getStarCells } from "./starGeometry.js";
export function createDrawingTools(options) {
    const { getTileWidth, getTileHeight, isCellActive, setCellActive } = options;
    function drawCircle(cx, cy, r, fill) {
        const width = getTileWidth();
        const height = getTileHeight();
        const points = getCircleCells({ x: cx, y: cy }, r, fill, width, height);
        points.forEach((point) => setCellActive(point.x, point.y, true));
    }
    function drawLine(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
        let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        let err = dx + dy, e2;
        while (true) {
            setCellActive(x0, y0, true);
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
    function drawStar(cx, cy, r) {
        const width = getTileWidth();
        const height = getTileHeight();
        getStarCells({ x: cx, y: cy }, r, width, height).forEach((point) => setCellActive(point.x, point.y, true));
    }
    function floodFill(sx, sy) {
        const width = getTileWidth();
        const height = getTileHeight();
        const get = (x, y) => {
            return isCellActive(x, y) ? 1 : 0;
        };
        const set = (x, y, v) => {
            setCellActive(x, y, v === 1);
        };
        const target = get(sx, sy);
        const newValue = target ? 0 : 1;
        if (get(sx, sy) === newValue)
            return;
        const visited = Array(height)
            .fill(0)
            .map(() => Array(width).fill(false));
        const stack = [[sx, sy]];
        while (stack.length) {
            const [x, y] = stack.pop();
            if (x < 0 || y < 0 || x >= width || y >= height)
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
    function shadeFill(sx, sy) {
        const width = getTileWidth();
        const height = getTileHeight();
        const target = isCellActive(sx, sy);
        const visited = Array.from({ length: height }, () => Array(width).fill(false));
        const stack = [[sx, sy]];
        while (stack.length) {
            const [x, y] = stack.pop();
            if (x < 0 || y < 0 || x >= width || y >= height || visited[y][x] || isCellActive(x, y) !== target)
                continue;
            visited[y][x] = true;
            setCellActive(x, y, (x + y) % 2 === 0);
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
    return {
        drawLine,
        drawCircle,
        drawStar,
        floodFill,
        shadeFill,
    };
}
