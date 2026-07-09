// Do NOT edge-cache the SSR HTML. Each release ships freshly-hashed CSS/JS and
// purges the previous build's files, so any HTML served from cache can reference
// assets that no longer exist → the page renders unstyled until it revalidates
// (the "first load broken, second load fine" symptom that stale-while-revalidate
// makes routine). Always revalidate HTML so it points at the current assets; the
// hashed assets under /_astro and /assets stay long-cached by Wix, which is where
// the real performance comes from anyway. Non-HTML responses are left untouched.
export async function onRequest(context, next) {
  const res = await next();
  const ct = res.headers.get('content-type') || '';
  if (context.request.method === 'GET' && ct.includes('text/html') && res.status === 200) {
    res.headers.set('Cache-Control', 'no-cache');
  }
  return res;
}
