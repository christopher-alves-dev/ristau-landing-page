// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Trocar pelo domínio próprio quando ele for registrado.
  site: 'https://ristau-landing-page.vercel.app',
  adapter: vercel(),
  integrations: [react(), keystatic(), sitemap({ filter: (page) => !/\/(preview|keystatic|admin)/.test(page) })],
  redirects: { '/admin': '/keystatic' },

  vite: {
    plugins: [tailwindcss()]
  }
});
