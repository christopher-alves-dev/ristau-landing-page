import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HeroSlider from "../../src/components/hero/HeroSlider";
import { products, site } from "./fixtures/hero";

const [first, second] = products;
const last = products.at(-1)!;

const heading = () => screen.getByRole("heading", { level: 2 });

describe("HeroSlider com a capa personalizada", () => {
  it("usa o botão e a mensagem próprios e esconde o preço", () => {
    const custom = { ...first, price: undefined, cta: "Criar a minha", ctaMessage: "Quero personalizar" };
    render(<HeroSlider products={[custom]} site={site} />);
    const link = screen.getByRole("link", { name: "Criar a minha" });
    expect(decodeURIComponent(link.getAttribute("href")!)).toContain("Quero personalizar");
    expect(screen.queryByText(/a partir de/)).not.toBeInTheDocument();
  });
});

describe("HeroSlider · foto da hero", () => {
  it("usa a versão com Kindle na foto grande e a original na miniatura", () => {
    render(<HeroSlider products={[{ ...first, hero: "/_astro/com-kindle.webp" }, second]} site={site} />);
    expect(screen.getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` })).toHaveAttribute("src", "/_astro/com-kindle.webp");
    expect(screen.getByRole("tab", { name: first.name }).querySelector("img")).toHaveAttribute("src", first.thumb);
  });
});

describe("HeroSlider", () => {
  beforeEach(() => {
    render(<HeroSlider products={products} site={site} />);
  });

  it("mostra a primeira capa ao carregar", () => {
    expect(heading()).toHaveTextContent(first.name);
    expect(screen.getByText(first.price!)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` })).toHaveAttribute("src", first.image);
  });

  it("renderiza uma miniatura por capa, com a primeira selecionada", () => {
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0].querySelector("img")).toHaveAttribute("src", first.thumb);
    expect(tabs).toHaveLength(products.length);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs.slice(1).every((t) => t.getAttribute("aria-selected") === "false")).toBe(true);
  });

  it("avança e volta com os botões", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Próxima capa" }));
    expect(await screen.findByRole("heading", { name: second.name })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Capa anterior" }));
    expect(await screen.findByRole("heading", { name: first.name })).toBeInTheDocument();
  });

  it("dá a volta da primeira para a última capa", async () => {
    await userEvent.setup().click(screen.getByRole("button", { name: "Capa anterior" }));
    expect(await screen.findByRole("heading", { name: last.name })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: last.name })).toHaveAttribute("aria-selected", "true");
  });

  it("seleciona a capa clicada na miniatura", async () => {
    await userEvent.setup().click(screen.getByRole("tab", { name: last.name }));
    expect(await screen.findByRole("heading", { name: last.name })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: first.name })).toHaveAttribute("aria-selected", "false");
  });

  it("navega pelas setas do teclado quando a hero está visível", async () => {
    const hero = screen.getByRole("region", { name: "Capas de Kindle em crochê" });
    vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({ top: 0, bottom: window.innerHeight } as DOMRect);
    const user = userEvent.setup();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("heading", { name: second.name })).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByRole("heading", { name: first.name })).toBeInTheDocument();
  });

  it("ignora as setas do teclado quando a hero saiu da tela", async () => {
    const hero = screen.getByRole("region", { name: "Capas de Kindle em crochê" });
    vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({ top: -window.innerHeight, bottom: 0 } as DOMRect);
    await userEvent.setup().keyboard("{ArrowRight}");
    expect(heading()).toHaveTextContent(first.name);
  });

  it("troca de capa pelas setas ao lado da foto", async () => {
    const [prev, next] = document.querySelectorAll<HTMLButtonElement>('button[aria-hidden="true"]');
    await userEvent.click(next);
    expect(await screen.findByRole("heading", { name: second.name })).toBeInTheDocument();
    await userEvent.click(prev);
    expect(await screen.findByRole("heading", { name: first.name })).toBeInTheDocument();
  });

  it("monta o link do WhatsApp com o nome da capa atual", () => {
    const link = screen.getByRole("link", { name: "Quero a minha" });
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(link.getAttribute("href")).toMatch(`https://wa.me/${site.whatsapp}?`);
    expect(text).toContain(first.name);
  });
});

describe("HeroSlider · redes sociais", () => {
  it("mostra o TikTok só quando ele está preenchido", () => {
    const { unmount } = render(<HeroSlider products={products} site={site} />);
    expect(screen.queryByRole("link", { name: "TikTok" })).not.toBeInTheDocument();
    unmount();

    render(<HeroSlider products={products} site={{ ...site, tiktok: "https://www.tiktok.com/@ristau" }} />);
    expect(screen.getByRole("link", { name: "TikTok" })).toHaveAttribute("href", "https://www.tiktok.com/@ristau");
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", site.instagram);
  });
});
