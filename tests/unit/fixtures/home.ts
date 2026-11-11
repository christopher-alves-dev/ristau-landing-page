import type { Home } from "../../../src/data/home";

export const home: Home = {
  features: { eyebrow: "A", title: "B", cards: [] },
  steps: { eyebrow: "C", title: "D", items: [], cta: "Pedir", ctaMessage: "Oi" },
  testimonials: {
    eyebrow: "Depoimentos",
    title: "Quem recebe, se apaixona.",
    items: [{ text: "Amei demais!", photo: "/_astro/foto.webp" }, { text: "Serviu certinho." }],
  },
  faq: {
    eyebrow: "Dúvidas",
    title: "Perguntas frequentes",
    items: [{ question: "Serve no meu Kindle?", answer: "Sim, em todos os modelos." }],
  },
};
