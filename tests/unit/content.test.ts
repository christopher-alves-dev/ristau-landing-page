import { readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { createReader } from "@keystatic/core/reader";
import { describe, expect, it } from "vitest";
import keystaticConfig from "../../keystatic.config";
import { MAX_UPLOAD_MB, UPLOAD_FORMATS } from "../../src/data/uploads";

const reader = createReader(process.cwd(), keystaticConfig);
const capas = await reader.collections.capas.all();
const CAPAS_DIR = join(process.cwd(), "src/content/capas");

describe("conteúdo do Keystatic", () => {
  it("tem capas", () => {
    expect(capas.length).toBeGreaterThan(0);
  });

  it("não repete a posição no carrossel", async () => {
    const { capas: order } = await reader.singletons.carrossel.readOrThrow();
    expect(new Set(order).size).toBe(order.length);
  });

  it("tem a capa personalizada com a foto ao lado do arquivo", async () => {
    const custom = await reader.singletons.personalizada.readOrThrow();
    expect(custom.image).toBe("./image.webp");
  });

  it("tem as informações do site e as seções da página", async () => {
    expect(await reader.singletons.site.readOrThrow()).toBeTruthy();
    expect(await reader.singletons.home.readOrThrow()).toBeTruthy();
  });

  describe.each(capas)("$slug", ({ slug, entry }) => {
    it("só tem fotos em formato aceito e dentro do limite", () => {
      const files = readdirSync(join(CAPAS_DIR, slug)).filter((f) => f !== "index.yaml");
      expect(files).toHaveLength(1);
      expect(entry.image).toBe(`../${slug}/${files[0]}`);
      for (const file of files) {
        expect(UPLOAD_FORMATS).toContain(extname(file).slice(1).toLowerCase());
        expect(statSync(join(CAPAS_DIR, slug, file)).size).toBeLessThanOrEqual(MAX_UPLOAD_MB * 1024 * 1024);
      }
    });
  });
});
