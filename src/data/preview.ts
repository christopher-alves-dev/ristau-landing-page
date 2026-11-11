import type { Home } from "./home";
import type { Product } from "./products";
import type { Site } from "./site";

export const PREVIEW_MESSAGE = "ristau:preview";
export const PREVIEW_READY = "ristau:preview-ready";
export const PREVIEW_ID = "preview";
export const CUSTOM_ID = "personalizada";

export type CapaDraft = {
  /** Slug da capa quando o formulário abriu; vazio numa capa nova. */
  slug?: string;
  name?: string;
  description?: string;
  price?: string;
  cta?: string;
  image?: string | null;
  colors?: Partial<Product["colors"]>;
};

const HEX = /^#[0-9a-f]{6}$/i;

/** A capa em edição vira a primeira do carrossel, no lugar da versão salva. */
export function previewProducts(draft: CapaDraft, products: Product[]): Product[] {
  const saved = products.find((p) => p.id === draft.slug);
  const others = products.filter((p) => p !== saved);
  const base = saved ?? products[0];

  const colors = { ...base.colors };
  for (const [key, value] of Object.entries(draft.colors ?? {})) {
    if (value && HEX.test(value)) colors[key as keyof typeof colors] = value;
  }
  const image = draft.image ?? (saved ? saved.image : "");

  return [
    {
      id: PREVIEW_ID,
      name: draft.name || "Nome da capa",
      description: draft.description ?? "",
      price: saved && !saved.price ? undefined : draft.price || "R$ 0",
      cta: draft.cta || saved?.cta,
      ctaMessage: saved?.ctaMessage,
      image,
      hero: draft.image ?? saved?.hero,
      thumb: draft.image ?? (saved ? saved.thumb : ""),
      colors,
    },
    ...others,
  ];
}

export type SiteDraft = Partial<Pick<Site, "brand" | "slogan" | "whatsapp" | "instagram" | "tiktok" | "footerText">>;
export type Draft = { capa?: CapaDraft; site?: SiteDraft; home?: Partial<Home> };
export type Section = "topo" | "feito-a-mao" | "como-encomendar" | "depoimentos" | "duvidas" | "rodape";

const OPTIONAL: (keyof SiteDraft)[] = ["tiktok"];

export function previewSite(draft: SiteDraft | undefined, site: Site): Site {
  // Campo obrigatório vazio é só digitação em andamento; opcional vazio esconde o link.
  const filled = Object.entries(draft ?? {}).filter(([key, value]) => value || OPTIONAL.includes(key as keyof SiteDraft));
  return { ...site, ...Object.fromEntries(filled) };
}

export function previewHome(draft: Partial<Home> | undefined, home: Home): Home {
  const merged = { ...home, ...draft };
  if (!draft?.testimonials) return merged;
  const items = draft.testimonials.items.map((item, i) => ({
    ...item,
    photo: typeof item.photo === "string" ? item.photo : home.testimonials.items[i]?.photo,
  }));
  return { ...merged, testimonials: { ...draft.testimonials, items } };
}

const SITE_SECTION: Record<keyof SiteDraft, Section | null> = {
  slogan: "topo",
  instagram: "topo",
  tiktok: "topo",
  brand: "rodape",
  footerText: "rodape",
  whatsapp: null,
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Onde a prévia deve rolar: a seção do que acabou de mudar, ou a primeira editada ao abrir. */
export function changedSection(prev: Draft | null, next: Draft): Section | null {
  if (!prev) {
    if (next.home) return "feito-a-mao";
    return next.capa || next.site ? "topo" : null;
  }
  if (!same(prev.capa, next.capa)) return "topo";
  if (!same(prev.home?.features, next.home?.features)) return "feito-a-mao";
  if (!same(prev.home?.steps, next.home?.steps)) return "como-encomendar";
  if (!same(prev.home?.testimonials, next.home?.testimonials)) return "depoimentos";
  if (!same(prev.home?.faq, next.home?.faq)) return "duvidas";
  for (const key of Object.keys(SITE_SECTION) as (keyof SiteDraft)[]) {
    if (prev.site?.[key] !== next.site?.[key]) return SITE_SECTION[key];
  }
  return null;
}
