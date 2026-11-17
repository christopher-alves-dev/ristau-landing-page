// O admin converte as fotos para WebP antes de salvar; isto só barra o que escapou da conversão.
export const MAX_UPLOAD_MB = 3;
export const UPLOAD_FORMATS = ["png", "webp"];

type Upload = { data: Uint8Array; extension: string } | null;

export function uploadError(value: Upload): string | null {
  if (!value) return null;
  const mb = value.data.byteLength / 1024 / 1024;
  if (!UPLOAD_FORMATS.includes(value.extension.toLowerCase()) || mb > MAX_UPLOAD_MB) {
    return "A foto não foi otimizada. Envie de novo; se o erro continuar, tente outro navegador.";
  }
  return null;
}
