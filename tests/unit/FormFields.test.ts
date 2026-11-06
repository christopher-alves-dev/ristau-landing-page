import { describe, expect, it } from "vitest";
import { previewValue } from "../../src/admin/FormFields";

describe("previewValue", () => {
  it("monta o valor de objetos e listas aninhados", () => {
    const leaf = (value: string) => ({ value, schema: { kind: "form" } });
    const props = {
      fields: {
        title: leaf("Título"),
        cards: { elements: [{ key: "a", fields: { title: leaf("Card"), items: { elements: [leaf("x"), leaf("y")] } } }] },
      },
    };
    expect(previewValue(props)).toEqual({ title: "Título", cards: [{ title: "Card", items: ["x", "y"] }] });
  });
});
