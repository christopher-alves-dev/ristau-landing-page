import { describe, expect, it } from "vitest";
import { changedSection, PREVIEW_ID, previewProducts, previewSite } from "../../src/data/preview";
import { products, site } from "./fixtures/hero";

const [first, second] = products;

describe("previewProducts", () => {
  it("coloca a capa em edição no lugar da salva, em primeiro", () => {
    const list = previewProducts({ slug: second.id, name: "Novo nome", price: "R$ 95" }, products);
    expect(list).toHaveLength(products.length);
    expect(list[0]).toMatchObject({ id: PREVIEW_ID, name: "Novo nome", price: "R$ 95", image: second.image });
    expect(list.map((p) => p.id)).not.toContain(second.id);
  });

  it("usa só as cores válidas do rascunho", () => {
    const [capa] = previewProducts({ slug: first.id, colors: { bg: "#123456", ink: "#12" } }, products);
    expect(capa.colors).toEqual({ ...first.colors, bg: "#123456" });
  });

  it("mostra a foto nova assim que ela é escolhida", () => {
    const [capa] = previewProducts({ slug: first.id, image: "blob:foto" }, products);
    expect(capa).toMatchObject({ image: "blob:foto", thumb: "blob:foto" });
  });

  it("numa capa nova mantém as outras e usa textos de exemplo", () => {
    const list = previewProducts({ slug: "" }, products);
    expect(list).toHaveLength(products.length + 1);
    expect(list[0]).toMatchObject({ name: "Nome da capa", word: "Palavra", image: "" });
  });
});

describe("previewSite", () => {
  it("troca só os campos preenchidos", () => {
    const live = previewSite({ slogan: "Novo slogan", brand: "" }, site);
    expect(live).toEqual({ ...site, slogan: "Novo slogan" });
  });

  it("apagar o TikTok esconde o link na prévia", () => {
    const live = previewSite({ tiktok: "" }, { ...site, tiktok: "https://www.tiktok.com/@ristau" });
    expect(live.tiktok).toBe("");
  });
});

describe("changedSection", () => {
  const features = { eyebrow: "A", title: "B", cards: [] };
  const steps = { eyebrow: "C", title: "D", items: [], cta: "E", ctaMessage: "F" };

  it("ao abrir, vai para a parte que está sendo editada", () => {
    expect(changedSection(null, { home: { features, steps } })).toBe("feito-a-mao");
    expect(changedSection(null, { capa: { name: "x" } })).toBe("topo");
    expect(changedSection(null, {})).toBeNull();
  });

  it("vai para a seção do campo que mudou", () => {
    const home = { features, steps };
    expect(changedSection({ home }, { home: { features, steps: { ...steps, cta: "Novo" } } })).toBe("como-encomendar");
    expect(changedSection({ home }, { home: { steps, features: { ...features, title: "Novo" } } })).toBe("feito-a-mao");
    expect(changedSection({ site: { footerText: "a" } }, { site: { footerText: "b" } })).toBe("rodape");
    expect(changedSection({ site: { slogan: "a" } }, { site: { slogan: "b" } })).toBe("topo");
    expect(changedSection({ site: { whatsapp: "1" } }, { site: { whatsapp: "2" } })).toBeNull();
  });
});
