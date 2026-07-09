import { getCatalog } from '../lib/catalog.js';

// SSR sitemap — absolute URLs derived from the live origin, pizza routes from the catalog.
export async function GET({ url }) {
  const origin = url.origin;
  const catalog = await getCatalog();
  const paths = ['/', '/about', ...catalog.pizzas.map((p) => `/pizza/${p.slug}`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
