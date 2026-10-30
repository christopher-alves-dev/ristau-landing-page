import { expect, test, type Page } from "@playwright/test";
import { products } from "../../src/data/products";

const [first, second] = products;
const last = products.at(-1)!;

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const hero = (page: Page) => page.getByRole("region", { name: "Capas de Kindle em crochê" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("astro-island")).not.toHaveAttribute("ssr");
});

test("carrega a página com título e primeira capa", async ({ page }) => {
  await expect(page).toHaveTitle(/Capas de Kindle em crochê/);
  await expect(heading(page)).toHaveText(first.name);
  await expect(page.getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` })).toBeVisible();
});

test("não gera erros no console", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  await page.reload();
  await expect(heading(page)).toHaveText(first.name);
  expect(errors).toEqual([]);
});

test("todas as fotos das capas carregam", async ({ page }) => {
  const thumbs = page.getByRole("tab").locator("img");
  await expect(thumbs).toHaveCount(products.length);
  for (const img of await thumbs.all()) {
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("avança, volta e dá a volta no carrossel pelos botões", async ({ page }) => {
  await page.getByRole("button", { name: "Próxima capa" }).click();
  await expect(heading(page)).toHaveText(second.name);

  await page.getByRole("button", { name: "Capa anterior" }).click();
  await expect(heading(page)).toHaveText(first.name);

  await page.getByRole("button", { name: "Capa anterior" }).click();
  await expect(heading(page)).toHaveText(last.name);
});

test("seleciona uma capa pela miniatura", async ({ page }) => {
  const tab = page.getByRole("tab", { name: last.name });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(heading(page)).toHaveText(last.name);
  await expect(page.getByRole("img", { name: `Capa de Kindle em crochê ${last.name}` })).toBeVisible();
});

test("o botão de compra leva ao WhatsApp com a capa escolhida", async ({ page }) => {
  await page.getByRole("button", { name: "Próxima capa" }).click();
  await expect(heading(page)).toHaveText(second.name);

  const cta = page.getByRole("link", { name: "Quero a minha" });
  await expect(cta).toHaveAttribute("target", "_blank");
  const href = await cta.getAttribute("href");
  expect(new URL(href!).searchParams.get("text")).toContain(second.name);
});

test("mostra as seções e o link final do WhatsApp", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Um abraço quentinho para o seu Kindle." })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Três passos e pronto." })).toBeAttached();
  await expect(page.getByRole("link", { name: "Pedir a minha pelo WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
});

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "interações de teclado, mouse e menu só existem no desktop");

  test("navega pelas setas do teclado", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(heading(page)).toHaveText(second.name);
    await page.keyboard.press("ArrowLeft");
    await expect(heading(page)).toHaveText(first.name);
  });

  test("o scroll troca de capa e libera a página na última", async ({ page }) => {
    const box = (await hero(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await page.mouse.wheel(0, 120);
    await expect(heading(page)).toHaveText(second.name);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.getByRole("tab", { name: last.name }).click();
    await expect(heading(page)).toHaveText(last.name);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(heading(page)).toHaveText(last.name);
  });

  test("o menu leva às seções da página", async ({ page }) => {
    await page.getByRole("link", { name: "Como encomendar" }).click();
    await expect(page).toHaveURL(/#como-encomendar$/);
    await expect(page.getByRole("heading", { name: "Três passos e pronto." })).toBeInViewport();
  });
});

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "gesto de arrastar só no celular");

  test("arrastar a capa para o lado troca de capa", async ({ page }) => {
    const img = page.getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` });
    const box = (await img.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x - 100, y, { steps: 10 });
    await page.mouse.up();
    await expect(heading(page)).toHaveText(second.name);
  });
});
