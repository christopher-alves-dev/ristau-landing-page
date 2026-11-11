import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { PRICE_REGEX } from "./data/price";

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
const single = (name: string) => glob({ pattern: `${name}.yaml`, base: "src/content" });

const colors = z.object({ bg: hex, blob: hex, accent: hex, ink: hex });

const capas = defineCollection({
  loader: glob({
    pattern: "*/index.yaml",
    base: "src/content/capas",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      price: z.string().regex(PRICE_REGEX),
      image: image(),
      colors,
    }),
});

const carrossel = defineCollection({
  loader: single("carrossel"),
  schema: z.object({ capas: z.array(z.string()) }),
});

const personalizada = defineCollection({
  loader: glob({ pattern: "index.yaml", base: "src/content/personalizada", generateId: () => "personalizada" }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      cta: z.string().min(1),
      ctaMessage: z.string().min(1),
      image: image(),
      colors,
    }),
});

const site = defineCollection({
  loader: single("site"),
  schema: z.object({
    brand: z.string(),
    slogan: z.string(),
    whatsapp: z.string().regex(/^\d{12,13}$/),
    instagram: z.url(),
    tiktok: z.url().optional(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    footerText: z.string(),
  }),
});

const home = defineCollection({
  loader: single("home"),
  schema: ({ image }) => z.object({
    features: z.object({
      eyebrow: z.string(),
      title: z.string(),
      cards: z.array(
        z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          text: z.string().optional(),
          items: z.array(z.string()).default([]),
        }),
      ),
    }),
    steps: z.object({
      eyebrow: z.string(),
      title: z.string(),
      items: z.array(z.object({ title: z.string(), text: z.string() })),
      cta: z.string(),
      ctaMessage: z.string(),
    }),
    testimonials: z.object({
      eyebrow: z.string(),
      title: z.string(),
      text: z.string().optional(),
      items: z.array(z.object({ text: z.string().min(1), photo: image().nullish() })),
    }),
    faq: z.object({
      eyebrow: z.string(),
      title: z.string(),
      items: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })),
    }),
  }),
});

export const collections = { capas, carrossel, personalizada, site, home };
