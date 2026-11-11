import type { Product } from "../../../src/data/products";
import type { Site } from "../../../src/data/site";

const colors = { bg: "#ffffff", blob: "#eeeeee", accent: "#333333", ink: "#000000" };

export const products: Product[] = ["Caramelo", "Aquarela", "Turquesa"].map((name) => ({
  id: name.toLowerCase(),
  name: `Capa ${name}`,
  description: `Descrição da capa ${name}`,
  price: "R$ 89",
  image: `/_astro/${name}.webp`,
  thumb: `/_astro/${name}-thumb.webp`,
  colors,
}));

export const site: Site = {
  brand: "Ristau",
  logo: "/logo.webp",
  slogan: "Slogan",
  whatsapp: "5511999999999",
  instagram: "https://instagram.com/",
  footerText: "Rodapé",
};
