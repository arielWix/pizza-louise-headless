// @ts-check
import { defineConfig } from 'astro/config';
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";

import cloudProviderFetchAdapter from "@wix/cloud-provider-fetch-adapter";
import { PRODUCT_SLUGS } from "./src/lib/menu-paths.js";
const isBuild = process.env.NODE_ENV == "production";

// Register the concrete /pizza/* URLs with Wix's page registry so they appear in
// Wix's auto-generated sitemap. The [slug] route is dynamic (static:false), so Wix
// would otherwise omit every product page — this injects them as static entries.
const productPages = () =>
  PRODUCT_SLUGS.map((slug) => ({
    path: `/pizza/${slug}`,
    srcFilePath: "/src/pages/pizza/[slug].astro",
    static: true,
  }));

// https://astro.build/config
export default defineConfig({
  integrations: [wix(), wixPages({ extendPages: productPages })],
  redirects: { '/about': '/' }, // the story is now the home page; keep old links working
  security: { checkOrigin: false },
  ...(isBuild && { adapter: cloudProviderFetchAdapter({}) }),

  image: {
    domains: ["static.wixstatic.com"],
  },

  output: "server",
});