import type { APIRoute } from "astro";
import { loadHome, loadProducts, loadSite } from "../data/content";
import { llmsText } from "../data/seo";

export const GET: APIRoute = async ({ site }) => {
  const [products, siteData, home] = await Promise.all([loadProducts(), loadSite(), loadHome()]);
  return new Response(llmsText({ site: siteData, products, home, url: new URL("/", site) }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
