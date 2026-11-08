import { describe, expect, it } from "vitest";
import { orderSlugs, swapPositions } from "../../src/data/carrossel";

describe("swapPositions", () => {
  it("troca as duas capas de lugar", () => {
    expect(swapPositions(["a", "b", "c", "d"], 3, 0)).toEqual(["d", "b", "c", "a"]);
  });
});

describe("orderSlugs", () => {
  it("mantém a ordem salva", () => {
    expect(orderSlugs(["c", "a", "b"], ["a", "b", "c"])).toEqual(["c", "a", "b"]);
  });

  it("coloca capas novas no fim e ignora as apagadas", () => {
    expect(orderSlugs(["apagada", "b"], ["a", "b"])).toEqual(["b", "a"]);
  });

  it("nunca repete uma capa", () => {
    expect(orderSlugs(["a", "a", "b"], ["a", "b"])).toEqual(["a", "b"]);
  });
});
