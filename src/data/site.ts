export const site = {
  brand: "Fio & Folha",
  whatsapp: "5500000000000",
  instagram: "https://instagram.com/",
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
