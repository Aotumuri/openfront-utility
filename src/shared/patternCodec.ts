export type BinaryMatrix = number[][];

export type DecodedPattern = {
  matrix: BinaryMatrix;
  width: number;
  height: number;
  scale: number;
};

const HEADER_SIZE = 3;
const PATTERN_VERSION = 0;

type BufferLike = {
  from: (input: string | Uint8Array, encoding?: string) => {
    toString: (encoding: string) => string;
    values: () => IterableIterator<number>;
  };
};

function getBuffer() {
  return (globalThis as typeof globalThis & { Buffer?: BufferLike }).Buffer;
}

function normalizeBinaryValue(value: number | undefined) {
  return value === 1 ? 1 : 0;
}

function normalizeBase64(base64: string) {
  const cleaned = base64.trim().replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (cleaned.length % 4)) % 4;
  return `${cleaned}${"=".repeat(padLength)}`;
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof btoa === "function") {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  const Buffer = getBuffer();
  if (Buffer) {
    return Buffer.from(bytes).toString("base64");
  }

  throw new Error("Base64 encoding is not supported in this environment.");
}

function base64ToBytes(base64: string) {
  const normalized = normalizeBase64(base64);

  if (typeof atob === "function") {
    const binary = atob(normalized);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  }

  const Buffer = getBuffer();
  if (Buffer) {
    return Uint8Array.from(Buffer.from(normalized, "base64").values());
  }

  throw new Error("Base64 decoding is not supported in this environment.");
}

export function createEmptyMatrix(width: number, height: number, fill = 0) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => normalizeBinaryValue(fill))
  );
}

export function cloneMatrix(matrix: BinaryMatrix) {
  return matrix.map(row => row.map(value => normalizeBinaryValue(value)));
}

export function getMatrixWidth(matrix: BinaryMatrix) {
  return matrix[0]?.length ?? 0;
}

export function getMatrixHeight(matrix: BinaryMatrix) {
  return matrix.length;
}

export function decodePattern(base64: string): DecodedPattern {
  const bytes = base64ToBytes(base64);

  if (bytes.length < HEADER_SIZE) {
    throw new Error("Pattern data is too short to contain required metadata.");
  }

  const version = bytes[0];
  if (version !== PATTERN_VERSION) {
    throw new Error(`Unrecognized pattern version ${version}.`);
  }

  const scale = bytes[1] & 0x07;
  const width = (((bytes[2] & 0x03) << 5) | ((bytes[1] >> 3) & 0x1f)) + 2;
  const height = ((bytes[2] >> 2) & 0x3f) + 2;
  const expectedBits = width * height;
  const expectedBytes = (expectedBits + 7) >> 3;

  if (bytes.length - HEADER_SIZE < expectedBytes) {
    throw new Error("Pattern data is too short for the specified dimensions.");
  }

  const matrix = createEmptyMatrix(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const byteIndex = index >> 3;
      const bitIndex = index & 7;
      const byte = bytes[HEADER_SIZE + byteIndex];
      if (byte === undefined) {
        throw new Error("Invalid pattern");
      }
      matrix[y][x] = (byte & (1 << bitIndex)) !== 0 ? 1 : 0;
    }
  }

  return { matrix, width, height, scale };
}

export function decodePatternToMatrix(base64: string) {
  return decodePattern(base64).matrix;
}

export function encodeMatrixToPattern(
  matrix: BinaryMatrix,
  options: { width?: number; height?: number; scale?: number } = {}
) {
  const width = options.width ?? getMatrixWidth(matrix);
  const height = options.height ?? getMatrixHeight(matrix);
  const scale = options.scale ?? 0;
  const widthBits = width - 2;
  const heightBits = height - 2;

  if (scale !== (scale & 0x07)) throw new Error(`Invalid scale: ${scale}`);
  if (widthBits !== (widthBits & 0x7f)) throw new Error(`Invalid width: ${width}`);
  if (heightBits !== (heightBits & 0x3f)) {
    throw new Error(`Invalid height: ${height}`);
  }

  const header = new Uint8Array(HEADER_SIZE);
  header[0] = PATTERN_VERSION;
  header[1] = (scale & 0x07) | ((widthBits & 0x1f) << 3);
  header[2] = ((widthBits & 0x60) >> 5) | ((heightBits & 0x3f) << 2);

  const totalBits = width * height;
  const totalBytes = Math.ceil(totalBits / 8);
  const data = new Uint8Array(totalBytes);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (normalizeBinaryValue(matrix[y]?.[x]) !== 1) continue;
      const index = y * width + x;
      const byteIndex = Math.floor(index / 8);
      const bitOffset = index % 8;
      data[byteIndex] |= 1 << bitOffset;
    }
  }

  const payload = new Uint8Array(header.length + data.length);
  payload.set(header, 0);
  payload.set(data, header.length);

  return bytesToBase64(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function sampleMatrixCell(
  matrix: BinaryMatrix,
  scale: number,
  x: number,
  y: number
) {
  const width = getMatrixWidth(matrix);
  const height = getMatrixHeight(matrix);
  if (width === 0 || height === 0) return 0;

  const scaledX = (x >> scale) % width;
  const scaledY = (y >> scale) % height;
  return normalizeBinaryValue(matrix[scaledY]?.[scaledX]);
}
