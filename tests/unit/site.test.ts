import { describe, expect, it } from "vitest";
import { whatsappLink } from "../../src/data/site";

describe("whatsappLink", () => {
  it("aponta para o número informado", () => {
    expect(whatsappLink("5511999999999", "oi")).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/);
  });

  it("codifica a mensagem na URL", () => {
    const message = "Olá! Quero a capa Caramelo & cia?";
    const url = new URL(whatsappLink("5511999999999", message));
    expect(url.searchParams.get("text")).toBe(message);
    expect(url.search).not.toContain(" ");
  });
});
