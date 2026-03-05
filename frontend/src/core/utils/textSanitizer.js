const BROKEN_PATTERN = /(Ã.|Â.|â.|ï¿½|�)/;

const badnessScore = (value) => {
  if (!value) return 0;

  const matches = value.match(/(Ã.|Â.|â.|ï¿½|�)/g);
  return matches ? matches.length : 0;
};

const isPrintable = (value) => {
  if (!value) return false;

  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    const isControl = code < 32 && code !== 9 && code !== 10 && code !== 13;

    if (isControl) {
      return false;
    }
  }

  return true;
};

const decodeLatin1AsUtf8 = (value) => {
  const bytes = new Uint8Array(value.length);

  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);

    if (code > 255) {
      return value;
    }

    bytes[i] = code;
  }

  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    return decoder.decode(bytes);
  } catch {
    return value;
  }
};

export const normalizeDisplayText = (rawValue) => {
  if (typeof rawValue !== "string") {
    return rawValue;
  }

  let value = rawValue.normalize("NFC");

  if (!BROKEN_PATTERN.test(value)) {
    return value;
  }

  const decoded = decodeLatin1AsUtf8(value);

  if (isPrintable(decoded) && badnessScore(decoded) < badnessScore(value)) {
    value = decoded;
  }

  // Fallback para caracteres de substituicao nao recuperaveis.
  value = value.replaceAll("ï¿½", "").replaceAll("�", "");

  return value;
};
