import { expect, test, type Page } from "@playwright/test";

type Capa = { name: string };
let first: Capa, second: Capa, last: Capa, total: number;

const hero = (page: Page) => page.getByRole("region", { name: "Capas de Kindle em crochê" });
const heading = (page: Page) => hero(page).getByRole("heading", { level: 2 });

test.beforeEach(async ({ page }) => {
  // Os scripts do Vercel Analytics e do Speed Insights só existem no deploy da Vercel.
  await page.route(/\/_vercel\/(insights|speed-insights)\//, (route) =>
    route.fulfill({ contentType: "text/javascript", body: "" }),
  );
  await page.goto("/");
  await expect(page.locator("astro-island")).not.toHaveAttribute("ssr");
  const names = await page.getByRole("tab").evaluateAll((tabs) => tabs.map((t) => t.getAttribute("aria-label")!));
  total = names.length;
  [first, second] = names.map((name) => ({ name }));
  last = { name: names.at(-1)! };
});

test("carrega a página com título e primeira capa", async ({ page }) => {
  await expect(page).toHaveTitle(/Capas de Kindle em crochê/);
  await expect(heading(page)).toHaveText(first.name);
  await expect(hero(page).getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` })).toBeVisible();
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
  expect(total).toBeGreaterThan(1);
  await expect(thumbs).toHaveCount(total);
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
  await expect(page.getByRole("heading", { name: "Seu Kindle protegido e de roupa nova." })).toBeAttached();
  await expect(page.locator("#como-encomendar h2")).toBeAttached();
  await expect(page.getByRole("link", { name: "Pedir a minha pelo WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
});

test("a página traz catálogo, depoimentos e dúvidas no HTML", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Capas de Kindle em crochê/);
  const catalog = page.getByRole("region", { name: "Todas as capas" });
  await expect(catalog.getByRole("listitem")).toHaveCount(total - 1);
  await expect(page.getByRole("region", { name: "Quem recebe, se apaixona." }).locator("blockquote").first()).toBeAttached();
  await expect(page.getByRole("region", { name: "Perguntas frequentes" }).getByText("Qual é o prazo de produção?")).toBeAttached();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "interações de teclado, mouse e menu só existem no desktop");

  test("navega pelas setas do teclado", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(heading(page)).toHaveText(second.name);
    await page.keyboard.press("ArrowLeft");
    await expect(heading(page)).toHaveText(first.name);
  });

  test("o scroll vertical rola a página sem trocar de capa", async ({ page }) => {
    const box = (await hero(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(heading(page)).toHaveText(first.name);
  });

  test("o swipe horizontal troca de capa", async ({ page }) => {
    const box = (await hero(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await page.mouse.wheel(120, 0);
    await expect(heading(page)).toHaveText(second.name);
  });

  test("o menu leva às seções da página", async ({ page }) => {
    await page.getByRole("link", { name: "Como encomendar" }).click();
    await expect(page).toHaveURL(/#como-encomendar$/);
    await expect(page.locator("#como-encomendar h2")).toBeInViewport();
  });
});

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "gesto de arrastar só no celular");

  test("arrastar a capa para o lado troca de capa", async ({ page }) => {
    const img = hero(page).getByRole("img", { name: `Capa de Kindle em crochê ${first.name}` });
    const box = (await img.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x - 100, y, { steps: 10 });
    await page.mouse.up();
    await expect(heading(page)).toHaveText(second.name);
  });
});
