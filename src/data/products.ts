export type Product = {
  id: string;
  name: string;
  word: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  colors: {
    bg: string;
    blob: string;
    accent: string;
    ink: string;
  };
};

export const products: Product[] = [
  {
    id: "mostarda",
    name: "Caramelo Outono",
    word: "Caramelo",
    tagline: "Quentinha como um café",
    description: "Trança caramelo encorpada, com faixa azul no topo e etiqueta de couro.",
    price: "R$ 92",
    image: "/capas/fotos/caramelo.webp",
    colors: { bg: "#f3e0ce", blob: "#e4b68c", accent: "#a96628", ink: "#452a11" },
  },
  {
    id: "aquarela",
    name: "Aquarela Pastel",
    word: "Aquarela",
    tagline: "Todas as cores de um dia leve",
    description: "Fio mesclado em lilás, verde-água, pêssego e amarelo, como uma pintura em aquarela.",
    price: "R$ 89",
    image: "/capas/fotos/pastel.webp",
    colors: { bg: "#dbd2ef", blob: "#ab95da", accent: "#5e3caa", ink: "#241740" },
  },
  {
    id: "terra-mar",
    name: "Terra e Mar",
    word: "Terra",
    tagline: "Da areia ao oceano",
    description: "Faixas em cru, caramelo, bege com poá, cacau e azul, com pingente de franjas e inicial.",
    price: "R$ 89",
    image: "/capas/fotos/color-block.webp",
    colors: { bg: "#e8ded9", blob: "#cab1a6", accent: "#906956", ink: "#362820" },
  },
  {
    id: "vinho",
    name: "Vinho com Pingente",
    word: "Vinho",
    tagline: "Elegância em cada página",
    description: "Trança vinho intensa, com pingente de franjas mostarda e inicial dourada.",
    price: "R$ 89",
    image: "/capas/fotos/vinho-transparente.webp",
    colors: { bg: "#f0d1d6", blob: "#d98e9b", accent: "#8c1c32", ink: "#3d0f18" },
  },
  {
    id: "turquesa",
    name: "Turquesa com Laço",
    word: "Turquesa",
    tagline: "Um mergulho na leitura",
    description: "Azul turquesa com cordão de laço, ponteiras douradas e plaquinha de metal.",
    price: "R$ 89",
    image: "/capas/fotos/turquesa.webp",
    colors: { bg: "#d4eced", blob: "#9bd2d4", accent: "#398184", ink: "#1a3b3d" },
  },
];
