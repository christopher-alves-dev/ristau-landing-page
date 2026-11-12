import { describe, expect, it } from "vitest";
import { contrast, readableButton } from "../../src/data/color";

describe("readableButton", () => {
  it.each(["#e8579a", "#37867c", "#3d8a72", "#ef7d1a", "#c8553d", "#fff", "#000000"])("%s atinge contraste AA", (accent) => {
    const { backgroundColor, color } = readableButton(accent);
    expect(contrast(backgroundColor, color)).toBeGreaterThanOrEqual(4.5);
  });

  it("mantém a cor original quando o texto já é legível", () => {
    expect(readableButton("#ef7d1a")).toEqual({ backgroundColor: "#ef7d1a", color: "#2b1d17" });
  });

  it("devolve a cor intacta se não for hex", () => {
    expect(readableButton("rebeccapurple").backgroundColor).toBe("rebeccapurple");
  });
});
