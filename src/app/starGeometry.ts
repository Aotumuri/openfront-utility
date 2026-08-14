import type { GridPoint } from "./circleGeometry.js";

type Vertex = { x: number; y: number };

function isInsidePolygon(point: Vertex, vertices: Vertex[]) {
  let inside = false;
  for (let index = 0, previous = vertices.length - 1; index < vertices.length; previous = index++) {
    const current = vertices[index];
    const prior = vertices[previous];
    const crossesRay =
      (current.y > point.y) !== (prior.y > point.y) &&
      point.x < ((prior.x - current.x) * (point.y - current.y)) / (prior.y - current.y) + current.x;
    if (crossesRay) inside = !inside;
  }
  return inside;
}

export function getStarCells(
  center: GridPoint,
  radius: number,
  width: number,
  height: number,
) {
  const outerRadius = Math.max(1, radius) + 0.5;
  const innerRadius = outerRadius * 0.45;
  const centerPoint = { x: center.x + 0.5, y: center.y + 0.5 };
  const vertices = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * index) / 5;
    const distance = index % 2 === 0 ? outerRadius : innerRadius;
    return {
      x: centerPoint.x + distance * Math.cos(angle),
      y: centerPoint.y + distance * Math.sin(angle),
    };
  });
  const cells: GridPoint[] = [];
  const minX = Math.max(0, Math.floor(center.x - outerRadius));
  const maxX = Math.min(width - 1, Math.ceil(center.x + outerRadius));
  const minY = Math.max(0, Math.floor(center.y - outerRadius));
  const maxY = Math.min(height - 1, Math.ceil(center.y + outerRadius));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isInsidePolygon({ x: x + 0.5, y: y + 0.5 }, vertices)) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}
