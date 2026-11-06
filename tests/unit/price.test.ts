import { describe, expect, it } from "vitest";
import { centsToPrice, formatPriceInput, maskPrice, PRICE_REGEX, priceToCents } from "../../src/data/price";

describe("preço", () => {
  it("lê os formatos salvos", () => {
    expect(priceToCents("R$ 92")).toBe(9200);
    expect(priceToCents("R$ 89,90")).toBe(8990);
    expect(priceToCents("R$ 1.250,05")).toBe(125005);
    expect(priceToCents("qualquer coisa")).toBe(0);
  });

  it("mostra sempre os centavos no campo", () => {
    expect(formatPriceInput(9200)).toBe("R$ 92,00");
    expect(formatPriceInput(5)).toBe("R$ 0,05");
    expect(formatPriceInput(125005)).toBe("R$ 1.250,05");
  });

  it("salva valores redondos sem ,00", () => {
    expect(centsToPrice(9200)).toBe("R$ 92");
    expect(centsToPrice(9290)).toBe("R$ 92,90");
  });

  it("aplica a máscara a partir dos centavos", () => {
    expect(maskPrice("9")).toBe("R$ 0,09");
    expect(maskPrice("9290")).toBe("R$ 92,90");
    expect(maskPrice("R$ 92,005")).toBe("R$ 920,05");
    expect(maskPrice("R$ 92,0")).toBe("R$ 9,20");
    expect(maskPrice("R$ 0,0")).toBe("");
    expect(maskPrice("abc")).toBe("");
  });

  it("tudo o que a máscara gera passa na validação", () => {
    for (const typed of ["1", "99", "9200", "125005", "9999999999"]) expect(maskPrice(typed)).toMatch(PRICE_REGEX);
    expect("R$ 1250").not.toMatch(PRICE_REGEX);
  });
});
