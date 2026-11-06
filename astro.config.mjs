// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react(), keystatic()],
  redirects: { '/admin': '/keystatic' },

  vite: {
    plugins: [tailwindcss()]
  }
});
