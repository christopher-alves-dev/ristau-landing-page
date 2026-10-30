import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "../../src/data/products";

const HEX = /^#[0-9a-f]{6}$/i;

describe("products", () => {
  it("não está vazio", () => {
    expect(products.length).toBeGreaterThan(0);
  });

  it("tem ids únicos", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(products)("$id", (product) => {
    it("tem todos os textos preenchidos", () => {
      for (const field of ["name", "word", "tagline", "description"] as const) {
        expect(product[field].trim()).not.toBe("");
      }
    });

    it("tem preço em reais", () => {
      expect(product.price).toMatch(/^R\$ \d+(,\d{2})?$/);
    });

    it("tem cores em hexadecimal", () => {
      for (const color of Object.values(product.colors)) expect(color).toMatch(HEX);
    });

    it("usa uma imagem webp que existe em public/", () => {
      expect(product.image).toMatch(/^\/capas\/fotos\/[\w-]+\.webp$/);
      expect(existsSync(join(process.cwd(), "public", product.image))).toBe(true);
    });
  });
});
