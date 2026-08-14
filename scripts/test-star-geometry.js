import assert from "node:assert/strict";
import { getStarCells } from "../docs/app/starGeometry.js";

const star = getStarCells({ x: 6, y: 6 }, 4, 13, 13);
const contains = (x, y) => star.some((cell) => cell.x === x && cell.y === y);

assert.ok(contains(6, 6), "Stars should always fill their center");
assert.ok(contains(6, 2), "Stars should include their top point");
assert.ok(contains(4, 9) && contains(8, 9), "Stars should include both lower points");
assert.ok(star.length > 25, "Stars should be a filled shape, not only an outline");

console.log("ok: star geometry produces a filled five-point shape");
