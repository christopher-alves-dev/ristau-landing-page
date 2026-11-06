export type Site = {
  brand: string;
  logo: string;
  slogan: string;
  whatsapp: string;
  instagram: string;
};

export const LOGO = "/logo.webp";

export const whatsappLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
