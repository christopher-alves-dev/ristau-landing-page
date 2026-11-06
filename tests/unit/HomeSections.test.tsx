import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeSections from "../../src/components/HomeSections";
import type { Home } from "../../src/data/home";
import { site } from "./fixtures/hero";

const home: Home = {
  features: { eyebrow: "A", title: "B", cards: [] },
  steps: { eyebrow: "C", title: "D", items: [], cta: "Pedir", ctaMessage: "Oi" },
};

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
