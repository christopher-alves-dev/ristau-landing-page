import type { Home } from "./home";
import type { Product } from "./products";
import type { Site } from "./site";

export const PREVIEW_MESSAGE = "ristau:preview";
export const PREVIEW_READY = "ristau:preview-ready";
export const PREVIEW_ID = "preview";

export type CapaDraft = {
  /** Slug da capa quando o formulário abriu; vazio numa capa nova. */
  slug?: string;
  name?: string;
  word?: string;
  description?: string;
  price?: string;
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
      word: draft.word || "Palavra",
      description: draft.description ?? "",
      price: draft.price || "R$ 0",
      image,
      thumb: draft.image ?? (saved ? saved.thumb : ""),
      colors,
    },
    ...others,
  ];
}

export type SiteDraft = Partial<Pick<Site, "brand" | "slogan" | "whatsapp" | "instagram" | "footerText">>;
export type Draft = { capa?: CapaDraft; site?: SiteDraft; home?: Partial<Home> };
export type Section = "topo" | "feito-a-mao" | "como-encomendar" | "rodape";

export function previewSite(draft: SiteDraft | undefined, site: Site): Site {
  const filled = Object.entries(draft ?? {}).filter(([, value]) => value);
  return { ...site, ...Object.fromEntries(filled) };
}

export function previewHome(draft: Partial<Home> | undefined, home: Home): Home {
  return { ...home, ...draft };
}

const SITE_SECTION: Record<keyof SiteDraft, Section | null> = {
  slogan: "topo",
  instagram: "topo",
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
  for (const key of Object.keys(SITE_SECTION) as (keyof SiteDraft)[]) {
    if (prev.site?.[key] !== next.site?.[key]) return SITE_SECTION[key];
  }
  return null;
}
