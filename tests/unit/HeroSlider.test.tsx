import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HeroSlider from "../../src/components/hero/HeroSlider";
import { products } from "../../src/data/products";

const [first, second] = products;
const last = products.at(-1)!;

const heading = () => screen.getByRole("heading", { level: 1 });

describe("HeroSlider", () => {
  beforeEach(() => {
    render(<HeroSlider />);
  });

  it("mostra a primeira capa ao carregar", () => {
    expect(heading()).toHaveTextContent(first.name);
    expect(screen.getByText(first.price)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` })).toHaveAttribute("src", first.image);
  });

  it("renderiza uma miniatura por capa, com a primeira selecionada", () => {
    const tabs = screen.getAllByRole("tab");
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

  it("monta o link do WhatsApp com o nome da capa atual", () => {
    const link = screen.getByRole("link", { name: "Quero a minha" });
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(text).toContain(first.name);
  });
});
