export type Home = {
  features: {
    eyebrow: string;
    title: string;
    cards: { title: string; subtitle?: string; text?: string; items: string[] }[];
  };
  steps: {
    eyebrow: string;
    title: string;
    items: { title: string; text: string }[];
    cta: string;
    ctaMessage: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    text?: string;
    items: { text: string; photo?: string | null }[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { question: string; answer: string }[];
  };
};
