export const site = {
  brand: "Ristau",
  logo: "/logo.webp",
  slogan: "Suas histórias favoritas e bem guardadas",
  whatsapp: "5500000000000",
  instagram: "https://instagram.com/",
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
