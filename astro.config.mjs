import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Su GitHub Pages il sito è su /Recomp360/, su Netlify sulla root /
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  output: 'static',
  site: isGitHubActions
    ? 'https://micheler2d.github.io'
    : 'https://www.recomp360.it',
  base: isGitHubActions ? '/Recomp360/' : '/',
  integrations: [
    sitemap({
      // Escludi le pagine noindex (privacy, grazie) e il 404
      filter: (page) =>
        !/\/(privacy|grazie)\/?$/.test(page),
    }),
  ],
});
