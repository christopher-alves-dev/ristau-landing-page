import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_MB, uploadError } from "../../src/data/uploads";

const file = (extension: string, mb: number) => ({ extension, data: new Uint8Array(Math.round(mb * 1024 * 1024)) });

describe("uploadError", () => {
  it("aceita PNG e WebP dentro do limite", () => {
    expect(uploadError(file("png", 1))).toBeNull();
    expect(uploadError(file("WEBP", MAX_UPLOAD_MB))).toBeNull();
  });

  it("ignora campo vazio (a obrigatoriedade é validada pelo Keystatic)", () => {
    expect(uploadError(null)).toBeNull();
  });

  it("recusa formatos que escaparam da conversão para WebP", () => {
    for (const ext of ["jpg", "jpeg", "heic", "gif"]) expect(uploadError(file(ext, 0.1))).toMatch(/não foi otimizada/);
  });

  it("recusa fotos acima do limite", () => {
    expect(uploadError(file("png", MAX_UPLOAD_MB + 0.5))).toMatch(/não foi otimizada/);
  });
});
