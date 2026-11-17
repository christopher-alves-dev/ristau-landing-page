const MAX_WIDTH = 800;
const QUALITY = 0.8;

export type Upload = { data: Uint8Array; extension: string; filename: string };
export type Optimized = { upload: Upload; transparent: boolean };

function decode(data: Uint8Array) {
  return createImageBitmap(new Blob([data as BlobPart])).catch(() => {
    throw new Error("Não foi possível abrir essa foto. Envie PNG, WebP ou JPG.");
  });
}

/** Caixa que contém os pixels visíveis, para descartar as sobras transparentes em volta da peça. */
function visibleBox(pixels: Uint8ClampedArray, width: number, height: number) {
  let top = height, left = width, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < 8) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  if (right < 0) return null;
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function optimizeImage(file: Upload): Promise<Optimized> {
  const bitmap = await decode(file.data);
  const source = document.createElement("canvas");
  source.width = bitmap.width;
  source.height = bitmap.height;
  const sctx = source.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const pixels = sctx.getImageData(0, 0, source.width, source.height).data;
  const box = visibleBox(pixels, source.width, source.height);
  if (!box) throw new Error("A foto parece estar toda transparente.");
  const transparent = pixels.some((v, i) => i % 4 === 3 && v < 250);

  const scale = Math.min(1, MAX_WIDTH / box.width);
  const out = document.createElement("canvas");
  out.width = Math.round(box.width * scale);
  out.height = Math.round(box.height * scale);
  const octx = out.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(source, box.x, box.y, box.width, box.height, 0, 0, out.width, out.height);

  // Navegadores sem codificador WebP (Safari antigo) devolvem PNG; o site converte no build de qualquer forma.
  const blob = (await toBlob(out, "image/webp")) ?? (await toBlob(out, "image/png"));
  if (!blob) throw new Error("Não foi possível otimizar a foto.");
  const extension = blob.type === "image/webp" ? "webp" : "png";
  const base = file.filename.replace(/\.[^.]+$/, "") || "image";

  return {
    upload: { data: new Uint8Array(await blob.arrayBuffer()), extension, filename: `${base}.${extension}` },
    transparent,
  };
}
