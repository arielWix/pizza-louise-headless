import { createClient, OAuthStrategy } from '@wix/sdk';
import { currentCart } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { money } from '../lib/art.js';

// Public OAuth client id (= wix.config appId). Public, not a secret.
const CLIENT_ID = '9dc483b9-3994-49a1-a93a-04149ea702ec';

let _client;
export function getClient() {
  if (!_client) {
    _client = createClient({
      modules: { currentCart, redirects },
      auth: OAuthStrategy({ clientId: CLIENT_ID }),
    });
  }
  return _client;
}
export { currentCart };

export function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// Set once something was actually added, so fresh visitors don't hit the
// carts/current endpoint (which 404s when no cart exists and pollutes the console).
const CART_FLAG = 'pl-cart';
export function markCartActive() {
  try { localStorage.setItem(CART_FLAG, '1'); } catch { /* private mode */ }
}
function cartMaybeExists() {
  try { return localStorage.getItem(CART_FLAG) === '1'; } catch { return true; }
}

export async function refreshCartLabel() {
  const el = document.getElementById('cart-label');
  if (!el) return;
  if (!cartMaybeExists()) { el.textContent = 'סל · ריק'; return; }
  try {
    const cart = await getClient().currentCart.getCurrentCart();
    const lis = cart?.lineItems || [];
    const count = lis.reduce((n, li) => n + (li.quantity || 0), 0);
    const total = lis.reduce((s, li) => s + Number(li.price?.amount || 0) * (li.quantity || 0), 0);
    el.textContent = count === 0 ? 'סל · ריק' : `סל · ${count} · ${money(total)}`;
  } catch {
    el.textContent = 'סל · ריק';
  }
}

export async function goCheckout() {
  try {
    const c = getClient();
    const checkout = await c.currentCart.createCheckoutFromCurrentCart({
      channelType: currentCart.ChannelType?.WEB ?? 'WEB',
    });
    const origin = window.location.origin;
    const session = await c.redirects.createRedirectSession({
      ecomCheckout: { checkoutId: checkout.checkoutId },
      callbacks: { postFlowUrl: origin + '/', thankYouPageUrl: origin + '/' },
    });
    window.location.href = session.redirectSession.fullUrl;
  } catch (err) {
    console.warn('[pizza-louise] checkout failed', err);
    toast('הסל ריק — הוסיפו מגש כדי להזמין');
  }
}

export function initCart() {
  const pill = document.getElementById('cart-pill');
  if (pill) pill.addEventListener('click', goCheckout);
  refreshCartLabel();
}
