import { describe, expect, it } from "vitest";
import { CUSTOM_ID } from "../../src/data/preview";
import { llmsText, structuredData } from "../../src/data/seo";
import { products, site } from "./fixtures/hero";
import { home } from "./fixtures/home";

const url = new URL("https://ristau.example/");
const custom = { ...products[0], id: CUSTOM_ID, name: "Crie do seu jeito", price: undefined };
const input = { site, products: [...products, custom], home, url };
const graph = structuredData(input)["@graph"] as Record<string, any>[];
const byType = (type: string) => graph.find((node) => node["@type"] === type)!;

describe("structuredData", () => {
  it("lista as capas com preço em BRL e URL absoluta, sem a personalizada", () => {
    const items = byType("ItemList").itemListElement;
    expect(items).toHaveLength(products.length);
    expect(items[0].item).toMatchObject({
      "@type": "Product",
      image: `https://ristau.example${products[0].image}`,
      offers: { price: "89.00", priceCurrency: "BRL", availability: "https://schema.org/MadeToOrder" },
    });
  });

  it("descreve a marca com cidade e redes", () => {
    expect(byType("Organization")).toMatchObject({
      name: site.brand,
      address: { addressLocality: "Palhoça", addressRegion: "SC" },
      sameAs: [site.instagram],
    });
  });

  it("transforma as perguntas frequentes em FAQPage", () => {
    expect(byType("FAQPage").mainEntity[0]).toEqual({
      "@type": "Question",
      name: "Serve no meu Kindle?",
      acceptedAnswer: { "@type": "Answer", text: "Sim, em todos os modelos." },
    });
  });
});

describe("llmsText", () => {
  it("traz as capas com preço e as perguntas", () => {
    const text = llmsText(input);
    expect(text).toContain(`- ${products[0].name} (a partir de R$ 89)`);
    expect(text).toContain("### Serve no meu Kindle?");
    expect(text).not.toContain(custom.name);
  });

  it("usa links em Markdown, como o Lighthouse exige", () => {
    expect(llmsText(input)).toMatch(/\[Site\]\(https?:\/\/.+\)/);
  });
});
