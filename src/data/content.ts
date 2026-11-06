import { getImage } from "astro:assets";
import { getCollection, getEntry } from "astro:content";
import type { Product } from "./products";
import { LOGO, type Site } from "./site";

const PHOTO_WIDTH = 800;
const THUMB_HEIGHT = 160;

export async function loadProducts(): Promise<Product[]> {
  const capas = (await getCollection("capas")).sort((a, b) => a.data.order - b.data.order);
  return Promise.all(
    capas.map(async ({ id, data: { image, order: _, ...data } }) => {
      const [photo, thumb] = await Promise.all([
        getImage({ src: image, width: Math.min(PHOTO_WIDTH, image.width), format: "webp", quality: 80 }),
        getImage({ src: image, height: THUMB_HEIGHT, format: "webp", quality: 80 }),
      ]);
      return { id, ...data, image: photo.src, thumb: thumb.src };
    }),
  );
}

export async function loadSite() {
  const { data } = (await getEntry("site", "site"))!;
  return { ...data, logo: LOGO } satisfies Site;
}

export async function loadHome() {
  return (await getEntry("home", "home"))!.data;
}
