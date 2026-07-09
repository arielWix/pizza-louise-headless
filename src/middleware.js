// Edge-cache the SSR HTML for a short window (the markup is identical for every
// visitor — the cart label is filled in client-side). Kept intentionally short:
// each release ships freshly-hashed CSS/JS and purges the previous build's files,
// so HTML that lingers in cache would point at assets that no longer exist and
// render unstyled. A 60s window bounds that post-deploy risk while still giving
// repeat visitors a cached, fast response. Non-HTML (sitemap, redirects) untouched.
export async function onRequest(context, next) {
  const res = await next();
  const ct = res.headers.get('content-type') || '';
  if (context.request.method === 'GET' && ct.includes('text/html') && res.status === 200) {
    res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=60');
  }
  return res;
}
