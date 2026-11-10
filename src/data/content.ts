import { getImage } from "astro:assets";
import { getCollection, getEntry } from "astro:content";
import { orderSlugs } from "./carrossel";
import type { Home } from "./home";
import { CUSTOM_ID } from "./preview";
import type { Product } from "./products";
import { LOGO, type Site } from "./site";

const PHOTO_WIDTH = 800;
const THUMB_HEIGHT = 160;

async function toProduct<T>(id: string, { image, ...data }: T & { image: ImageMetadata }) {
  const [photo, thumb] = await Promise.all([
    getImage({ src: image, width: Math.min(PHOTO_WIDTH, image.width), format: "webp", quality: 80 }),
    getImage({ src: image, height: THUMB_HEIGHT, format: "webp", quality: 80 }),
  ]);
  return { id, ...data, image: photo.src, thumb: thumb.src };
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

export async function loadHome() {
  return (await getEntry("home", "home"))!.data satisfies Home;
}
