// Edge-cache the SSR HTML: the markup is identical for every visitor (the cart
// label is filled in client-side), and the menu changes rarely — so let the CDN
// serve it while revalidating in the background. Dashboard edits appear within
// s-maxage. Non-HTML (sitemap, redirects) is left untouched.
export async function onRequest(context, next) {
  const res = await next();
  const ct = res.headers.get('content-type') || '';
  if (context.request.method === 'GET' && ct.includes('text/html') && res.status === 200) {
    res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=86400');
  }
  return res;
}
