function normalizeCode(value = "") {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function resolveProductBarcode(product) {
  if (!product) {
    return "";
  }

  return normalizeCode(product.barcode || `TRK-${product.sku}`);
}

export function buildBarcodePattern(value = "") {
  const normalized = normalizeCode(value);
  if (!normalized) {
    return [];
  }

  return Array.from(normalized).flatMap((character, index) => {
    const code = character.charCodeAt(0) + index * 7;
    return Array.from({ length: 8 }, (_, bitIndex) => ((code >> bitIndex) & 1) === 1);
  });
}

export function buildQrMatrix(value = "", size = 17) {
  const normalized = normalizeCode(value);
  const chars = normalized || "TRACKIT";

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const source = chars.charCodeAt((row * size + col) % chars.length);
      return ((source + row * 11 + col * 13) % 5) < 2;
    }),
  );
}
