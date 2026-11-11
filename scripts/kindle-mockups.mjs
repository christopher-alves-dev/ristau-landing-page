// Gera, para cada capa, uma versão com um Kindle saindo da abertura, usada na foto grande da hero.
// Roda antes do build e do dev (prebuild/predev). As fotos originais do painel não mudam.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAPAS = join(ROOT, "src/content/capas");
const OUT = join(ROOT, "src/assets/mockups");
const SCRIPT = fileURLToPath(import.meta.url);

const PEEK = 0.27; // fração da altura do Kindle que fica à mostra
const WIDTH = 0.8; // largura do Kindle em relação ao corpo da capa
const RATIO = 0.72; // largura / altura de um Kindle Paperwhite

// Borda de cima, largura e inclinação do corpo da capa, lidas pela transparência da foto.
async function measure(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const opaque = (x, y) => data[(y * W + x) * 4 + 3] > 200;
  const rowWidth = (y) => {
    let n = 0;
    for (let x = 0; x < W; x++) if (opaque(x, y)) n++;
    return n;
  };
  let top = 0;
  while (top < H && rowWidth(top) < W * 0.5) top++;
  const probe = Math.min(H - 1, top + Math.round(H * 0.08));
  let left = 0;
  let right = W - 1;
  while (left < W && !opaque(left, probe)) left++;
  while (right > 0 && !opaque(right, probe)) right--;

  const topAt = (x) => {
    let y = 0;
    while (y < H && !opaque(x, y)) y++;
    return y;
  };
  const span = right - left;
  const xa = Math.round(left + span * 0.15);
  const xb = Math.round(right - span * 0.15);
  const angle = (Math.atan2(topAt(xb) - topAt(xa), xb - xa) * 180) / Math.PI;
  return { W, H, top, left, right, angle };
}

function kindleSvg(w, h) {
  const radius = w * 0.07;
  const side = w * 0.07;
  const head = w * 0.08;
  const sw = w - 2 * side;
  const sh = h - head - w * 0.16;
  const lines = Array.from({ length: 14 }, (_, i) => {
    const y = head + sw * 0.14 + i * sw * 0.075;
    const len = i % 5 === 4 ? 0.55 : 0.86;
    return `<rect x="${side + sw * 0.08}" y="${y}" width="${sw * 0.84 * len}" height="${sw * 0.022}" rx="${sw * 0.01}" fill="#9a968e"/>`;
  }).join("");
  const shadowFrom = h * (PEEK - 0.1);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3a3c"/><stop offset="1" stop-color="#141415"/></linearGradient>
      <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecebe6"/><stop offset="1" stop-color="#dedcd5"/></linearGradient>
      <linearGradient id="shadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></linearGradient>
    </defs>
    <rect width="${w}" height="${h}" rx="${radius}" fill="url(#body)"/>
    <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${radius}" fill="none" stroke="#5a5a5e" stroke-width="2"/>
    <rect x="${side}" y="${head}" width="${sw}" height="${sh}" rx="${w * 0.012}" fill="url(#screen)"/>
    <text x="${side + sw / 2}" y="${head + sw * 0.09}" font-family="Georgia, serif" font-size="${sw * 0.045}" fill="#6f6b63" text-anchor="middle">Capítulo 1</text>
    ${lines}
    <rect x="0" y="${shadowFrom}" width="${w}" height="${h * 0.1}" fill="url(#shadow)"/>
  </svg>`);
}

async function mockup(source, target) {
  const b = await measure(source);
  const bodyWidth = b.right - b.left;
  const kw = Math.round(bodyWidth * WIDTH);
  const kh = Math.round(kw / RATIO);
  const lift = Math.round(kh * PEEK);
  const kindle = await sharp(kindleSvg(kw, kh))
    .rotate(b.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const { width: rw, height: rh } = await sharp(kindle).metadata();
  const growX = (rw - kw) / 2;
  const growY = (rh - kh) / 2;
  const pad = Math.max(0, Math.ceil(lift + growY - b.top)) + 12;

  await sharp({ create: { width: b.W, height: b.H + pad, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: kindle, left: Math.round(b.left + (bodyWidth - kw) / 2 - growX), top: Math.round(b.top + pad - lift - growY) },
      { input: source, left: 0, top: pad },
    ])
    .webp({ quality: 90 })
    .toFile(target);
}

function imageOf(slug) {
  const yaml = readFileSync(join(CAPAS, slug, "index.yaml"), "utf8");
  const path = yaml.match(/^image:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1];
  return path ? resolve(CAPAS, slug, path) : null;
}

mkdirSync(OUT, { recursive: true });
const scriptTime = statSync(SCRIPT).mtimeMs;
let made = 0;
for (const slug of readdirSync(CAPAS)) {
  const source = imageOf(slug);
  if (!source || !existsSync(source)) continue;
  const target = join(OUT, `${slug}.webp`);
  const fresh = existsSync(target) && statSync(target).mtimeMs > Math.max(statSync(source).mtimeMs, scriptTime);
  if (fresh) continue;
  await mockup(source, target);
  made++;
}
console.log(`kindle-mockups: ${made} gerada(s)`);
