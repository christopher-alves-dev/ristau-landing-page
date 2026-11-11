export type Product = {
  id: string;
  name: string;
  description: string;
  price?: string;
  cta?: string;
  ctaMessage?: string;
  image: string;
  /** Foto da hero: a capa com um Kindle saindo da abertura, quando houver. */
  hero?: string;
  heroSrcSet?: string;
  card?: string;
  thumb: string;
  colors: {
    bg: string;
    blob: string;
    accent: string;
    ink: string;
  };
};
