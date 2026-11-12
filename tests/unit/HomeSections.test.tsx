import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeSections from "../../src/components/HomeSections";
import { CUSTOM_ID } from "../../src/data/preview";
import { products, site } from "./fixtures/hero";
import { home } from "./fixtures/home";

const social = () => within(screen.getByRole("navigation", { name: "Redes sociais" }));

describe("HomeSections · rodapé", () => {
  it("tem o Instagram e esconde o TikTok vazio", () => {
    render(<HomeSections {...home} site={site} />);
    expect(social().getByRole("link", { name: "Instagram" })).toHaveAttribute("href", site.instagram);
    expect(social().queryByRole("link", { name: "TikTok" })).not.toBeInTheDocument();
  });

  it("mostra o TikTok quando preenchido", () => {
    render(<HomeSections {...home} site={{ ...site, tiktok: "https://www.tiktok.com/@ristau" }} />);
    expect(social().getByRole("link", { name: "TikTok" })).toHaveAttribute("href", "https://www.tiktok.com/@ristau");
  });
});

describe("HomeSections · catálogo", () => {
  it("lista as capas com nome, descrição e preço, sem a personalizada", () => {
    const custom = { ...products[0], id: CUSTOM_ID, name: "Crie do seu jeito", price: undefined };
    render(<HomeSections {...home} site={site} products={[...products, custom]} />);
    const catalog = within(screen.getByRole("region", { name: "Todas as capas" }));
    expect(catalog.getAllByRole("listitem")).toHaveLength(products.length);
    expect(catalog.getByRole("heading", { name: products[0].name })).toBeInTheDocument();
    expect(catalog.getByText(products[0].description)).toBeInTheDocument();
    expect(catalog.queryByText("Crie do seu jeito")).not.toBeInTheDocument();
    expect(catalog.getByRole("link", { name: `Quero essa: capa ${products[0].name}` }).getAttribute("href")).toContain(
      encodeURIComponent(products[0].name),
    );
  });

  it("não mostra o catálogo sem capas", () => {
    render(<HomeSections {...home} site={site} />);
    expect(screen.queryByRole("region", { name: "Todas as capas" })).not.toBeInTheDocument();
  });
});

describe("HomeSections · depoimentos e dúvidas", () => {
  it("mostra os depoimentos, com foto só quando houver", () => {
    render(<HomeSections {...home} site={site} />);
    const section = within(screen.getByRole("region", { name: home.testimonials.title }));
    expect(section.getByText("“Amei demais!”")).toBeInTheDocument();
    expect(section.getAllByRole("img")).toHaveLength(1);
  });

  it("deixa as respostas no HTML mesmo fechadas", () => {
    render(<HomeSections {...home} site={site} />);
    const section = within(screen.getByRole("region", { name: home.faq.title }));
    expect(section.getByText("Serve no meu Kindle?")).toBeInTheDocument();
    expect(section.getByText("Sim, em todos os modelos.")).toBeInTheDocument();
  });
});
