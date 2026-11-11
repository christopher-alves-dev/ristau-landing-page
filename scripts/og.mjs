// Gera public/og.jpg (1200x630), a imagem que aparece ao compartilhar o link.
// Uso: npm run og -- tiffany vinho roma
import sharp from "sharp";

const W = 1200;
const H = 630;
const slugs = process.argv.slice(2);
if (slugs.length !== 3) throw new Error("Informe 3 capas, ex.: npm run og -- tiffany vinho roma");

const text = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="80" y="390" font-family="Georgia, serif" font-weight="900" font-size="64" fill="#2b1d17">Capas de Kindle</text>
  <text x="80" y="465" font-family="Georgia, serif" font-weight="900" font-size="64" fill="#2b1d17">em crochê</text>
  <text x="80" y="530" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#c8553d">Feitas à mão, sob medida</text>
</svg>`;

const placements = [
  { left: 600, top: 190, rotate: -12, height: 320 },
  { left: 840, top: 180, rotate: 10, height: 320 },
  { left: 710, top: 130, rotate: -3, height: 360 },
];

const covers = await Promise.all(
  slugs.map(async (slug, i) => {
    const { left, top, rotate, height } = placements[i];
    const input = await sharp(`src/content/capas/${slug}/image.webp`)
      .resize({ height })
      .rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    return { input, left, top };
  }),
);

const logo = await sharp("public/logo.webp").resize({ height: 200 }).toBuffer();

await sharp({ create: { width: W, height: H, channels: 3, background: "#fbf6ef" } })
  .composite([{ input: logo, left: 80, top: 70 }, { input: Buffer.from(text), left: 0, top: 0 }, ...covers])
  .jpeg({ quality: 85 })
  .toFile("public/og.jpg");

console.log("public/og.jpg gerada");
