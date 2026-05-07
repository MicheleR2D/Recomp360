import { defineConfig } from 'astro/config';

// Su GitHub Pages il sito è su /Recomp360/, su Netlify sulla root /
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  output: 'static',
  site: isGitHubActions
    ? 'https://micheler2d.github.io'
    : 'https://recomp360.netlify.app',
  base: isGitHubActions ? '/Recomp360' : '/',
});
