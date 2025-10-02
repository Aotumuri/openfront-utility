"use strict";
// Pattern JSON Generator + Preview (TypeScript)
class PatternDecoder_v1 {
    constructor(base64) {
        this.bytes = PatternDecoder_v1.base64ToBytes(base64);
        if (this.bytes.length < 3) {
            throw new Error("Pattern data is too short to contain required metadata.");
        }
        const version = this.bytes[0];
        if (version !== 1) {
            throw new Error(`Unrecognized pattern version ${version}. Expected 1.`);
        }
        const byte1 = this.bytes[1];
        const byte2 = this.bytes[2];
        this.scale = byte1 & 0x07;
        this.tileWidth = (((byte2 & 0x03) << 5) | ((byte1 >> 3) & 0x1f)) + 2;
        this.tileHeight = ((byte2 >> 2) & 0x3f) + 2;
        const totalPixels = this.tileWidth * this.tileHeight;
        const totalBits = totalPixels * 2; // 2 bits per pixel
        const expectedBytes = (totalBits + 7) >> 3; // ceil(bits/8)
        if (this.bytes.length - 3 < expectedBytes) {
            throw new Error("Pattern data is too short for the specified dimensions (v2 shades).");
        }
    }
    static base64ToBytes(base64) {
        base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
        const bin = atob(base64);
        return Uint8Array.from(bin, c => c.charCodeAt(0));
    }
    getTileWidth() { return this.tileWidth; }
    getTileHeight() { return this.tileHeight; }
    getScale() { return this.scale; }
    getShade(x, y) {
        const px = (x >> this.scale) % this.tileWidth;
        const py = (y >> this.scale) % this.tileHeight;
        const idx = py * this.tileWidth + px;
        const bitPos = idx * 2;
        const byteIndex = (bitPos >> 3);
        const offset = bitPos & 7;
        const b0 = this.bytes[3 + byteIndex];
        const b1 = this.bytes[3 + byteIndex + 1];
        if (b0 === undefined)
            throw new Error("Invalid pattern (oob byte).");
        const window = (b0 | ((b1 !== null && b1 !== void 0 ? b1 : 0) << 8)) >>> 0;
        const value = (window >> offset) & 0b11;
        return value;
    }
    isSet(x, y) {
        return this.getShade(x, y) !== 0;
    }
}
window.PatternDecoder_v1 = PatternDecoder_v1;
