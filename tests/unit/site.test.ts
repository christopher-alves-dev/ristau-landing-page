import { describe, expect, it } from "vitest";
import { site, whatsappLink } from "../../src/data/site";

describe("whatsappLink", () => {
  it("aponta para o número da loja", () => {
    expect(whatsappLink("oi")).toMatch(new RegExp(`^https://wa\\.me/${site.whatsapp}\\?text=`));
  });

  it("codifica a mensagem na URL", () => {
    const message = "Olá! Quero a capa Caramelo & cia?";
    const url = new URL(whatsappLink(message));
    expect(url.searchParams.get("text")).toBe(message);
    expect(url.search).not.toContain(" ");
  });
});
