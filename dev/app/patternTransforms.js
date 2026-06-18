export function shiftPatternLeft(pattern) {
    return pattern.map((row) => { var _a; return row.slice(1).concat((_a = row[0]) !== null && _a !== void 0 ? _a : 0); });
}
export function shiftPatternRight(pattern) {
    return pattern.map((row) => {
        var _a;
        const last = (_a = row[row.length - 1]) !== null && _a !== void 0 ? _a : 0;
        return [last, ...row.slice(0, -1)];
    });
}
export function shiftPatternDown(pattern) {
    var _a, _b, _c, _d, _e, _f;
    const height = pattern.length;
    const width = (_b = (_a = pattern[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    const nextPattern = Array.from({ length: height }, () => new Array(width).fill(0));
    for (let x = 0; x < width; x++) {
        nextPattern[0][x] = (_d = (_c = pattern[height - 1]) === null || _c === void 0 ? void 0 : _c[x]) !== null && _d !== void 0 ? _d : 0;
        for (let y = 1; y < height; y++) {
            nextPattern[y][x] = (_f = (_e = pattern[y - 1]) === null || _e === void 0 ? void 0 : _e[x]) !== null && _f !== void 0 ? _f : 0;
        }
    }
    return nextPattern;
}
export function shiftPatternUp(pattern) {
    var _a, _b, _c, _d, _e, _f;
    const height = pattern.length;
    const width = (_b = (_a = pattern[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    const nextPattern = Array.from({ length: height }, () => new Array(width).fill(0));
    for (let x = 0; x < width; x++) {
        nextPattern[height - 1][x] = (_d = (_c = pattern[0]) === null || _c === void 0 ? void 0 : _c[x]) !== null && _d !== void 0 ? _d : 0;
        for (let y = 0; y < height - 1; y++) {
            nextPattern[y][x] = (_f = (_e = pattern[y + 1]) === null || _e === void 0 ? void 0 : _e[x]) !== null && _f !== void 0 ? _f : 0;
        }
    }
    return nextPattern;
}
export function invertPattern(pattern) {
    return pattern.map((row) => row.map((cell) => (cell === 1 ? 0 : 1)));
}
