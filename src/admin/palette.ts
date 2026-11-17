import { contrast } from "../data/color";

export type Palette = { bg: string; blob: string; accent: string; ink: string };

const SAMPLE = 96;
const HUE_BUCKETS = 24;
const MIN_INK_CONTRAST = 7;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function hslToHex(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível ler a foto"));
    img.src = url;
  });
}

/** Cor predominante da peça: agrupa os pixels opacos por matiz, pesando pela saturação. */
function dominantColor(data: Uint8ClampedArray) {
  const buckets = Array.from({ length: HUE_BUCKETS }, () => ({ weight: 0, r: 0, g: 0, b: 0 }));
  const all = { n: 0, r: 0, g: 0, b: 0 };

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    all.n++;
    all.r += r;
    all.g += g;
    all.b += b;

    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.15 || l < 0.08 || l > 0.95) continue;
    const bucket = buckets[Math.floor(h / (360 / HUE_BUCKETS)) % HUE_BUCKETS];
    const w = s * (1 - Math.abs(2 * l - 1));
    bucket.weight += w;
    bucket.r += r * w;
    bucket.g += g * w;
    bucket.b += b * w;
  }

  if (!all.n) throw new Error("A foto parece estar toda transparente");

  const best = buckets.reduce((a, b) => (b.weight > a.weight ? b : a));
  // Capas neutras (bege, cinza, preto) quase não pontuam por saturação: usa a média geral.
  if (best.weight < all.n * 0.02) return rgbToHsl(all.r / all.n, all.g / all.n, all.b / all.n);
  return rgbToHsl(best.r / best.weight, best.g / best.weight, best.b / best.weight);
}

export async function suggestPalette(url: string): Promise<Palette> {
  const img = await loadImage(url);
  const scale = SAMPLE / Math.max(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Seu navegador não permitiu ler a foto");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const [h, rawS, l] = dominantColor(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
  // A média do tom puxa a saturação para baixo; reforça, exceto em capas neutras.
  const s = rawS < 0.12 ? rawS : clamp(rawS * 1.3, 0.45, 0.8);
  const bg = hslToHex(h, s * 0.85, 0.91);

  let inkL = 0.17;
  let ink = hslToHex(h, s * 0.7, inkL);
  while (contrast(ink, bg) < MIN_INK_CONTRAST && inkL > 0.04) {
    inkL -= 0.02;
    ink = hslToHex(h, s * 0.7, inkL);
  }

  return {
    bg,
    blob: hslToHex(h, s * 0.8, 0.74),
    accent: hslToHex(h, s, clamp(l, 0.3, 0.42)),
    ink,
  };
}
