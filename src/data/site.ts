export type Site = {
  brand: string;
  logo: string;
  slogan: string;
  whatsapp: string;
  instagram: string;
  tiktok?: string;
  footerText: string;
};

export const LOGO = "/logo.webp";

export const whatsappLink = (phone: string, message: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
