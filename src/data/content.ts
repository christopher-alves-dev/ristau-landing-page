import { getImage } from "astro:assets";
import { getCollection, getEntry } from "astro:content";
import { orderSlugs } from "./carrossel";
import type { Home } from "./home";
import { CUSTOM_ID } from "./preview";
import type { Product } from "./products";
import { LOGO, type Site } from "./site";

const PHOTO_WIDTH = 800;
const THUMB_HEIGHT = 160;
const CARD_WIDTH = 480;

async function toProduct<T>(id: string, { image, ...data }: T & { image: ImageMetadata }) {
  const [photo, card, thumb] = await Promise.all([
    getImage({ src: image, width: Math.min(PHOTO_WIDTH, image.width), format: "webp", quality: 80 }),
    getImage({ src: image, width: Math.min(CARD_WIDTH, image.width), format: "webp", quality: 80 }),
    getImage({ src: image, height: THUMB_HEIGHT, format: "webp", quality: 80 }),
  ]);
  return { id, ...data, image: photo.src, card: card.src, thumb: thumb.src };
}

export async function loadProducts(): Promise<Product[]> {
  const [capas, carrossel, custom] = await Promise.all([
    getCollection("capas"),
    getEntry("carrossel", "carrossel"),
    getEntry("personalizada", CUSTOM_ID),
  ]);
  const byId = new Map(capas.map((capa) => [capa.id, capa.data]));
  const order = orderSlugs(carrossel!.data.capas, [...byId.keys()]);
  return Promise.all([
    ...order.map((id) => toProduct(id, byId.get(id)!)),
    toProduct(CUSTOM_ID, custom!.data),
  ]);
}

export async function loadSite() {
  const { data } = (await getEntry("site", "site"))!;
  return { ...data, logo: LOGO } satisfies Site;
}

export async function loadHome(): Promise<Home> {
  const { data } = (await getEntry("home", "home"))!;
  const items = await Promise.all(
    data.testimonials.items.map(async ({ text, photo }) => {
      if (!photo) return { text };
      const img = await getImage({ src: photo, width: Math.min(CARD_WIDTH, photo.width), format: "webp", quality: 75 });
      return { text, photo: img.src };
    }),
  );
  return { ...data, testimonials: { ...data.testimonials, items } };
}
