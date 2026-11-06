export const MAX_UPLOAD_MB = 3;
export const UPLOAD_FORMATS = ["png", "webp"];

type Upload = { data: Uint8Array; extension: string } | null;

export function uploadError(value: Upload): string | null {
  if (!value) return null;
  if (!UPLOAD_FORMATS.includes(value.extension.toLowerCase())) {
    return `Formato .${value.extension} não aceito. Envie PNG ou WebP com fundo transparente.`;
  }
  const mb = value.data.byteLength / 1024 / 1024;
  if (mb > MAX_UPLOAD_MB) {
    return `A foto tem ${mb.toFixed(1)} MB. O limite é ${MAX_UPLOAD_MB} MB: reduza a resolução ou exporte em WebP.`;
  }
  return null;
}
