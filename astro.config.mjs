// @ts-check
import { defineConfig } from 'astro/config';

// The one place the site URL lives. When a custom domain is bought,
// change this line and add public/CNAME (see README, "Change the domain").
const SITE_URL = 'https://ramisalahhh.github.io';

export default defineConfig({
  site: SITE_URL,
  // Plain static output: dist/ works on GitHub Pages today
  // and on S3 + CloudFront later without changes.
  output: 'static',
  build: { format: 'directory' },
});
