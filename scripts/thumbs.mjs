import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SRC = "public/capas/fotos";
const OUT = join(SRC, "thumbs");
const HEIGHT = 160;

await mkdir(OUT, { recursive: true });

for (const file of await readdir(SRC)) {
  if (!file.endsWith(".webp")) continue;
  const info = await sharp(join(SRC, file))
    .resize({ height: HEIGHT })
    .webp({ quality: 80, effort: 6 })
    .toFile(join(OUT, file));
  console.log(`${file}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}
