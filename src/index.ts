// Pattern JSON Generator + Preview (TypeScript)

class PatternDecoder {
  private bytes: Uint8Array;
  private tileWidth: number;
  private tileHeight: number;
  private scale: number;

  constructor(base64: string) {
    this.bytes = PatternDecoder.base64ToBytes(base64);

    if (this.bytes.length < 3) {
      throw new Error(
        "Pattern data is too short to contain required metadata.",
      );
    }

    const version = this.bytes[0];
    if (version !== 0) {
      throw new Error(`Unrecognized pattern version ${version}.`);
    }

    const byte1 = this.bytes[1];
    const byte2 = this.bytes[2];
    this.scale = byte1 & 0x07;

    this.tileWidth = (((byte2 & 0x03) << 5) | ((byte1 >> 3) & 0x1f)) + 2;
    this.tileHeight = ((byte2 >> 2) & 0x3f) + 2;

    const expectedBits = this.tileWidth * this.tileHeight;
    const expectedBytes = (expectedBits + 7) >> 3; // Equivalent to: ceil(expectedBits / 8);
    if (this.bytes.length - 3 < expectedBytes) {
      throw new Error(
        "Pattern data is too short for the specified dimensions.",
      );
    }
  }

  static base64ToBytes(base64: string): Uint8Array {
    // atobはURL-safe base64未対応なので、置換
    base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(base64);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  getTileWidth(): number {
    return this.tileWidth;
  }

  getTileHeight(): number {
    return this.tileHeight;
  }

  getScale(): number {
    return this.scale;
  }

  isSet(x: number, y: number): boolean {
    const px = (x >> this.scale) % this.tileWidth;
    const py = (y >> this.scale) % this.tileHeight;
    const idx = py * this.tileWidth + px;
    const byteIndex = idx >> 3;
    const bitIndex = idx & 7;
    const byte = this.bytes[3 + byteIndex];
    if (byte === undefined) throw new Error("Invalid pattern");
    return (byte & (1 << bitIndex)) !== 0;
  }
}

// ここからUIロジックをTypeScriptで実装
// ...（既存index.htmlのロジックをTypeScriptで移植していきます）
// グローバルに公開
(window as any).PatternDecoder = PatternDecoder;
