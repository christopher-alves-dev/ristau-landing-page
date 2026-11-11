export type Product = {
  id: string;
  name: string;
  word: string;
  description: string;
  price?: string;
  cta?: string;
  ctaMessage?: string;
  image: string;
  card?: string;
  thumb: string;
  colors: {
    bg: string;
    blob: string;
    accent: string;
    ink: string;
  };
};
