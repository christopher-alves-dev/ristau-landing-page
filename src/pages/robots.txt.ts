import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /keystatic
Disallow: /api/keystatic
Disallow: /admin
Disallow: /preview

Sitemap: ${new URL("/sitemap-index.xml", site)}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
