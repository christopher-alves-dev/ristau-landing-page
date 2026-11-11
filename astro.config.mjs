// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

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
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'DM Sans',
      cssVariable: '--font-dm-sans',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
      options: { experimental: { variableAxis: { opsz: [['9', '40']] } } },
    },
    {
      provider: fontProviders.google(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      weights: ['600 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['serif'],
      options: { experimental: { variableAxis: { opsz: [['9', '144']] } } },
    },
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
