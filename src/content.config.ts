import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { PRICE_REGEX } from "./data/price";

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
const single = (name: string) => glob({ pattern: `${name}.yaml`, base: "src/content" });

const capas = defineCollection({
  loader: glob({
    pattern: "*/index.yaml",
    base: "src/content/capas",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      order: z.number().int(),
      word: z.string().min(1),
      description: z.string().min(1),
      price: z.string().regex(PRICE_REGEX),
      image: image(),
      colors: z.object({ bg: hex, blob: hex, accent: hex, ink: hex }),
    }),
});

const site = defineCollection({
  loader: single("site"),
  schema: z.object({
    brand: z.string(),
    slogan: z.string(),
    whatsapp: z.string().regex(/^\d{12,13}$/),
    instagram: z.url(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    footerText: z.string(),
  }),
});

const home = defineCollection({
  loader: single("home"),
  schema: z.object({
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
  }),
});

export const collections = { capas, site, home };
