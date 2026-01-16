export function generatePatternBase64(
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
