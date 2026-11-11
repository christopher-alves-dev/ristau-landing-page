// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Domínio principal: ristau.com.br redireciona para o www na Vercel.
  site: 'https://www.ristau.com.br',
  adapter: vercel(),
  integrations: [react(), keystatic(), sitemap({ filter: (page) => !/\/(preview|keystatic|admin)/.test(page) })],
  redirects: { '/admin': '/keystatic' },

  vite: {
    plugins: [tailwindcss()]
  }
});
