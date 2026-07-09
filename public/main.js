import { createClient, OAuthStrategy } from 'https://esm.sh/@wix/sdk@1';
import { menus, sections, items, itemVariants, itemModifiers, itemModifierGroups, operations } from 'https://esm.sh/@wix/restaurants';
import { currentCart } from 'https://esm.sh/@wix/ecom';
import { redirects } from 'https://esm.sh/@wix/redirects';

const CLIENT_ID = '9dc483b9-3994-49a1-a93a-04149ea702ec';
const ORDERS_APP_ID = '9a5d83fd-8570-482e-81ab-cfa88942ee60';

const client = createClient({
  modules: { menus, sections, items, itemVariants, itemModifiers, itemModifierGroups, operations, currentCart, redirects },
  auth: OAuthStrategy({ clientId: CLIENT_ID }),
});

// ---- design data (presentation metadata; prices/ids come live from Wix) ----
const QUADS = ['TL', 'TR', 'BL', 'BR'];
const QUAD_CENTER = { TL: [31, 31], TR: [69, 31], BL: [31, 69], BR: [69, 69] };
const QUAD_NAME = { TL: 'רבע שמאלי עליון', TR: 'רבע ימני עליון', BL: 'רבע שמאלי תחתון', BR: 'רבע ימני תחתון' };
const RING_POS = { TL: ['0%', '0%'], TR: ['50%', '0%'], BL: ['0%', '50%'], BR: ['50%', '50%'] };
const RING_RAD = { TL: '100% 0 0 0', TR: '0 100% 0 0', BL: '0 0 0 100%', BR: '0 0 100% 0' };

const PIZZA_META = {
  'מרגריטה 1889': { key: 'margherita-1889', image: 'assets/pizza-margherita.jpg', placeholder: 'מרגריטה 1889' },
  'שרומיז': { key: 'shroomiz', image: 'assets/pizza-shroomiz.jpg', placeholder: 'שרומיז' },
  'ברנרד': { key: 'bernard', image: 'assets/bernard.png', placeholder: 'ברנרד' },
  'ולואיז': { key: 'velouise', image: 'assets/velouise.png', placeholder: 'ולואיז' },
  'החמאה של גרייבר': { key: 'graiber-butter', image: 'assets/pizza-tomato-butter.jpg', placeholder: 'החמאה של גרייבר' },
  'המתעתעת': { key: 'mitatat', image: 'assets/pizza-mitatat.jpg', placeholder: 'המתעתעת' },
  'הים תיכונית': { key: 'mediterranean', image: 'assets/pizza-mediterranean.jpg', placeholder: 'הים תיכונית' },
};

const TOPPING_META = {
  'פטריות טריות': { art: 'mush', desc: 'שמפיניון פרוס דק' },
  'זיתים שחורים': { art: 'olive', desc: 'קלמטה פרוס' },
  'בצל סגול': { art: 'onion', desc: 'טבעות דקות' },
  'עגבניות שרי': { art: 'cherry', desc: 'חצויות, מתוקות' },
  'בזיליקום טרי': { art: 'basil', desc: 'עלים קרועים ביד' },
  'גבינה בולגרית': { art: 'feta', desc: 'קוביות מלוחות' },
  'פלפל חריף': { art: 'hot', desc: 'ירוק חריף פרוס' },
};

// Static fallback so the page never blanks if the live queries fail.
const PIZZA_FALLBACK = [
  { name: 'מרגריטה 1889', desc: 'רוטב עגבניות שלנו, מוצרלה, פרמז\'ן, בזיליקום, שמן זית', priceM: 55, priceL: 75 },
  { name: 'שרומיז', desc: 'רוטב עגבניות שלנו, פטריות חיות, ראגו פטריות, פרמז\'ן', priceM: 65, priceL: 85 },
  { name: 'ברנרד', desc: 'קרם תירס, מוצרלה, בצל ירוק, פרמז\'ן', priceM: 65, priceL: 85 },
  { name: 'ולואיז', desc: 'קרם פטריות כמהין, פטריות חיות, ראגו פטריות (שיטאקי, שמפיניון, מחית כמהין), מוצרלה, שמן כמהין לבן, פרמז\'ן', priceM: 65, priceL: 85 },
  { name: 'החמאה של גרייבר', desc: 'חמאת עגבניות, שום קונפי, בצל סגול, מוצרלה, פרמז\'ן וגרידת לימון', priceM: 65, priceL: 85 },
  { name: 'המתעתעת', desc: 'רוטב עגבניות שלנו, עגבניות קונפי, צ\'ילי קונפי, מוצרלה, פרמז\'ן, שמן זית', priceM: 65, priceL: 85 },
  { name: 'הים תיכונית', desc: 'רוטב עגבניות שלנו, מוצרלה, זיתי קלמטה, בצל סגול, פלפל חריף, פטה, זילוף דבש', priceM: 65, priceL: 85 },
];

const TOPPING_FALLBACK = [
  { name: 'פטריות טריות', price: 6 },
  { name: 'זיתים שחורים', price: 4 },
  { name: 'בצל סגול', price: 3 },
  { name: 'עגבניות שרי', price: 4 },
  { name: 'בזיליקום טרי', price: 3 },
  { name: 'גבינה בולגרית', price: 7 },
  { name: 'פלפל חריף', price: 3 },
];

const TOPPING_ART = {
  mush: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 30 30"><path d="M4 14 C4 7 9 3.5 15 3.5 C21 3.5 26 7 26 14 C26 15.6 24.8 16.4 23 16.4 L7 16.4 C5.2 16.4 4 15.6 4 14 Z" fill="#E8DCC4" stroke="#B9A67F" stroke-width="1.4"></path><path d="M11.5 16.4 L11 24 C11 25.6 12.5 26.6 15 26.6 C17.5 26.6 19 25.6 19 24 L18.5 16.4 Z" fill="#D9C9A6" stroke="#B9A67F" stroke-width="1.4"></path></svg>`,
  olive: () => `<div style="width:20px; height:20px; border-radius:50%; background:#2A2226; border:5px solid #3E3038; box-shadow:inset 0 0 3px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.35);"></div>`,
  onion: () => `<div style="width:26px; height:26px; border-radius:50%; border:4px solid #A465A8; background:transparent; box-shadow:0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(230,190,235,0.5);"></div>`,
  cherry: () => `<div style="width:22px; height:22px; border-radius:50%; background:radial-gradient(circle at 36% 32%, #E86A4A 0%, #C13A22 65%, #9E2C16 100%); box-shadow:inset 0 -2px 4px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.3);"></div>`,
  basil: (s, rot) => `<svg width="${s}" height="${s}" viewBox="0 0 30 30" style="transform:rotate(${rot}deg);"><path d="M15 2 C22 6 25 13 23 21 C21.5 26 17 28 15 28 C13 28 8.5 26 7 21 C5 13 8 6 15 2 Z" fill="#5E8A3E" stroke="#3F6428" stroke-width="1.4"></path><path d="M15 5 L15 25" stroke="#3F6428" stroke-width="1.2"></path></svg>`,
  feta: (s, rot) => `<div style="width:18px; height:16px; background:linear-gradient(160deg, #F5EFE0 0%, #E3D9C2 100%); border-radius:3px; transform:rotate(${rot}deg); box-shadow:0 1px 3px rgba(0,0,0,0.35);"></div>`,
  hot: (s, rot) => `<svg width="${s === 30 ? 26 : s}" height="${s === 30 ? 26 : s}" viewBox="0 0 30 30" style="transform:rotate(${rot}deg);"><path d="M8 6 C6 10 6 16 9 21 C11 24 15 26 19 24 C23 22 25 17 24 12 C23.4 9 21 6.5 18 6 C14.5 5.4 10 4.5 8 6 Z" fill="#C93A28" stroke="#8E2416" stroke-width="1.4"></path><path d="M8 6 C7 4 8 2.5 10 2.5" fill="none" stroke="#4E7A32" stroke-width="2.2" stroke-linecap="round"></path></svg>`,
};

const ICON_ART = {
  mush: () => TOPPING_ART.mush(24),
  olive: () => `<div style="width:18px; height:18px; border-radius:50%; background:#2A2226; border:5px solid #4A3A44;"></div>`,
  onion: () => `<div style="width:22px; height:22px; border-radius:50%; border:4px solid #A465A8;"></div>`,
  cherry: () => `<div style="width:18px; height:18px; border-radius:50%; background:radial-gradient(circle at 36% 32%, #E86A4A 0%, #C13A22 65%, #9E2C16 100%);"></div>`,
  basil: () => TOPPING_ART.basil(22, 0),
  feta: () => `<div style="width:17px; height:15px; background:linear-gradient(160deg, #F5EFE0 0%, #E3D9C2 100%); border-radius:3px; transform:rotate(-8deg);"></div>`,
  hot: () => TOPPING_ART.hot(22, 0),
};

function scatterFor(quad, toppingIdx) {
  const [cx, cy] = QUAD_CENTER[quad];
  const qOff = QUADS.indexOf(quad) * 37;
  const pts = [];
  for (let j = 0; j < 3; j++) {
    const angle = ((toppingIdx * 73 + j * 121 + qOff) % 360) * Math.PI / 180;
    const r = 5.5 + ((toppingIdx * 31 + j * 47 + qOff) % 70) / 10;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return pts;
}

const money = (n) => '₪' + (Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const buildPizza = (p, i) => ({
  ...p,
  key: PIZZA_META[p.name]?.key || 'pizza-' + i,
  image: PIZZA_META[p.name]?.image || null,
  placeholder: PIZZA_META[p.name]?.placeholder || p.name,
  itemId: p.itemId || null,
  variantM: p.variantM || null,
  variantL: p.variantL || null,
});
const buildTopping = (t, i) => ({
  ...t,
  art: TOPPING_META[t.name]?.art || 'olive',
  desc: TOPPING_META[t.name]?.desc || '',
  modifierId: t.modifierId || null,
  uiId: TOPPING_META[t.name]?.art || 'tp-' + i,
});

// ---- app state ----
const state = {
  view: 'home', // 'home' | 'product'
  pizzas: PIZZA_FALLBACK.map(buildPizza),
  toppings: TOPPING_FALLBACK.map(buildTopping),
  wix: { operationId: null, menuId: null, sectionId: null, modifierGroupId: null },
  live: false,
  sel: null,
  size: 'L',
  target: 'whole',
  quads: { TL: [], TR: [], BL: [], BR: [] }, // arrays of topping uiIds
  adding: false,
};

// ---- Wix data loading (all live: menu → section → items + variants + modifier group) ----
async function loadCatalog() {
  try {
    const [menusRes, sectionsRes, itemsRes, variantsRes, modifiersRes, groupsRes, opsRes] = await Promise.all([
      client.menus.listMenus(),
      client.sections.listSections(),
      client.items.listItems(),
      client.itemVariants.listVariants(),
      client.itemModifiers.listModifiers(),
      client.itemModifierGroups.listModifierGroups(),
      client.operations.listOperations(),
    ]);

    const entId = (x) => x?._id ?? x?.id;
    const menu = (menusRes.menus || []).find((m) => m.visible) || (menusRes.menus || [])[0];
    if (!menu) throw new Error('no menu');
    const menuSections = (sectionsRes.sections || []).filter((s) => (menu.sectionIds || []).includes(entId(s)));
    const section = menuSections[0];
    if (!section) throw new Error('no section');

    const itemById = Object.fromEntries((itemsRes.items || []).map((it) => [entId(it), it]));
    const variantById = Object.fromEntries((variantsRes.variants || []).map((v) => [entId(v), v]));
    const modifierNameById = Object.fromEntries((modifiersRes.modifiers || []).map((m) => [entId(m), m.name]));

    const op = (opsRes.operations || []).find((o) => o.onlineOrderingStatus === 'ENABLED')
      ?? (opsRes.operations || []).find((o) => o.default)
      ?? (opsRes.operations || [])[0];

    const pizzas = (section.itemIds || [])
      .map((id) => itemById[id])
      .filter(Boolean)
      .map((it, i) => {
        let variantM = null, variantL = null;
        for (const v of it.priceVariants?.variants || []) {
          const name = variantById[v.variantId]?.name || '';
          const entry = { id: v.variantId, price: Number(v.priceInfo?.price ?? v.price ?? 0) };
          if (name.includes('אישי')) variantM = entry;
          else if (name.includes('משפחתי')) variantL = entry;
        }
        return buildPizza({
          name: it.name,
          desc: it.description || '',
          priceM: variantM?.price ?? 0,
          priceL: variantL?.price ?? variantM?.price ?? 0,
          itemId: entId(it),
          variantM,
          variantL,
        }, i);
      });

    // the toppings group: taken off the first item that carries one (all share it)
    const refId = (x) => x?.id ?? x?._id;
    const groupId = pizzas.map((p) => refId(itemById[p.itemId]?.modifierGroups?.[0])).find(Boolean);
    const group = (groupsRes.modifierGroups || []).find((g) => entId(g) === groupId);
    const toppings = (group?.modifiers || []).map((m, i) => buildTopping({
      name: modifierNameById[refId(m)] || 'תוספת',
      price: Number(m.additionalChargeInfo?.additionalCharge ?? m.additionalCharge ?? 0),
      modifierId: refId(m),
    }, i));

    if (!pizzas.length) throw new Error('empty menu');
    state.pizzas = pizzas;
    if (toppings.length) state.toppings = toppings;
    state.wix = { operationId: entId(op) || null, menuId: entId(menu), sectionId: entId(section), modifierGroupId: groupId || null };
    state.live = Boolean(entId(op) && entId(menu) && entId(section));
  } catch (err) {
    console.warn('[pizza-louise] live menu unavailable, using fallback', err);
    state.live = false;
  }
}

async function refreshCartLabel() {
  const el = document.getElementById('cart-label');
  try {
    const cart = await client.currentCart.getCurrentCart();
    const lis = cart?.lineItems || [];
    const count = lis.reduce((n, li) => n + (li.quantity || 0), 0);
    const total = lis.reduce((sum, li) => sum + Number(li.price?.amount || 0) * (li.quantity || 0), 0);
    el.textContent = count === 0 ? 'סל · ריק' : `סל · ${count} · ${money(total)}`;
  } catch {
    el.textContent = 'סל · ריק';
  }
}

async function goCheckout() {
  try {
    const checkout = await client.currentCart.createCheckoutFromCurrentCart({
      channelType: currentCart.ChannelType?.WEB ?? 'WEB',
    });
    const origin = window.location.origin;
    const session = await client.redirects.createRedirectSession({
      ecomCheckout: { checkoutId: checkout.checkoutId },
      callbacks: { postFlowUrl: `${origin}/`, thankYouPageUrl: `${origin}/` },
    });
    window.location.href = session.redirectSession.fullUrl;
  } catch (err) {
    console.warn('[pizza-louise] checkout failed', err);
    toast('הסל ריק — הוסיפו מגש כדי להזמין');
  }
}

// ---- rendering ----
const app = document.getElementById('app');

function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function cardImage(pz) {
  if (pz.image) return `<img src="${pz.image}" alt="${esc(pz.name)}" loading="lazy">`;
  return `<div class="img-placeholder">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path></svg>
    <span>תמונה: ${esc(pz.placeholder)}</span>
  </div>`;
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-inner">
        <div class="hero-badge">כשר חלבי · ניו יורק סטייל</div>
        <h1>הטעם האמיתי של <em>ניו יורק</em></h1>
        <p>משולשים ענקיים ברוח מנהטן, בצק על בסיס ביגה שתופח 72 שעות, ותנור לוהט שנותן את הקראנץ' המושלם. בחרו מגש — ותרכיבו אותו בדיוק כמו שאתם אוהבים.</p>
      </div>
    </section>
    <div class="checker"></div>
    <section class="menu-section">
      <div class="menu-grid">
        ${state.pizzas.map((pz, i) => `
          <div class="pizza-card" data-key="${esc(pz.key)}" style="animation-delay:${i * 0.06}s">
            <div class="img-wrap">${cardImage(pz)}</div>
            <div class="card-body">
              <div class="card-title-row">
                <div class="name">${esc(pz.name)}</div>
                <div class="from-price">החל מ־${money(pz.priceM)}</div>
              </div>
              <p class="desc">${esc(pz.desc)}</p>
              <div class="card-cta">
                להרכבת המגש
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:scaleX(-1);"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <div class="gallery">
        <img src="assets/fotter-1.jpg" alt="קינוחים מהתנור" loading="lazy">
        <img src="assets/fotter-2.jpg" alt="מאפה שוקולד" loading="lazy">
        <img src="assets/fotter-3.jpg" alt="הבר שלנו" loading="lazy">
      </div>
    </section>`;

  app.querySelectorAll('.pizza-card').forEach((card) => {
    card.addEventListener('click', () => openPizza(card.dataset.key));
  });
}

function renderAbout() {
  const check = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;
  app.innerHTML = `
    <section class="about-section">
      <div class="about-block">
        <div>
          <div class="about-kicker">Fast Delivery</div>
          <h2>הפיצה הטובה ביותר <em>בדרך אליכם!</em></h2>
          <p>אנחנו מבינים שכשרוצים פיצה אמיתית – רוצים אותה מהר! לכן פיתחנו מערכת משלוחים מתקדמת שמבטיחה שהפיצה שלכם תגיע אליכם חמה, טרייה וטעימה בדיוק כמו ברגע שיצאה מהתנור.</p>
          <div class="about-bullets">
            <div class="about-bullet">${check} משלוח עד הבית (ראשל"צ בלבד)</div>
            <div class="about-bullet">${check} משלוח תוך 60 דקות</div>
          </div>
        </div>
        <div class="about-features">
          <div class="about-feature">
            <div class="f-title">בצק טרי יום יום</div>
            <div class="f-desc">נילושה בבוקר ומתפחת במשך 24 שעות למרקם מושלם</div>
          </div>
          <div class="about-feature">
            <div class="f-title">רוטב עגבניות ביתי</div>
            <div class="f-desc">מבושל לאט עם תבלינים איטלקיים אותנטיים</div>
          </div>
          <div class="about-feature">
            <div class="f-title">גבינת מוצרלה פרימיום</div>
            <div class="f-desc">טרייה מדי יום עם המסה מושלמת</div>
          </div>
        </div>
      </div>
      <div class="about-block">
        <div>
          <div class="about-kicker">Made with Love</div>
          <h2>אנחנו מכינים את הפיצה <em>הטובה ביותר בעיר</em></h2>
          <p>פיצה לואיז נוסדה מתוך אהבה אמיתית לפיצה ניו יורקית ורצון להביא לישראל את הטעמים האותנטיים של מנהטן וברוקלין. כל פיצה מוכנת בקפדנות מקסימלית, מהעיסה שנילושה בבוקר ועד לתוספות הטריות שמגיעות מידי יום.</p>
        </div>
        <img class="about-img" src="assets/fotter-2.jpg" alt="פיצה לואיז" loading="lazy">
      </div>
      <div class="about-stats">
        <div class="about-stat"><div class="num">12</div><div class="lbl">אנשי צוות לשירותכם</div></div>
        <div class="about-stat"><div class="num">35</div><div class="lbl">הזמנות בשעה</div></div>
        <div class="about-stat"><div class="num">25</div><div class="lbl">סוגי פיצה</div></div>
        <div class="about-stat"><div class="num">15,000</div><div class="lbl">לקוחות מרוצים</div></div>
      </div>
    </section>`;
}

function productImage(pz) {
  if (pz.image) return `<img src="${pz.image}" alt="${esc(pz.name)}">`;
  return `<div class="img-placeholder" style="border-radius:20px;">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path></svg>
    <span>תמונה: ${esc(pz.placeholder)}</span>
  </div>`;
}

function renderProduct() {
  const pz = state.sel;
  if (!pz) return renderHomeRoute();
  app.innerHTML = `
    <section class="product-section">
      <div class="breadcrumb">
        <a href="#/" data-action="home">תפריט</a>
        <span>/</span>
        <span class="current">${esc(pz.name)}</span>
      </div>
      <div class="product-grid">
        <div class="product-img-wrap">${productImage(pz)}</div>
        <div class="product-info">
          <h1>${esc(pz.name)}</h1>
          <div class="product-price" id="sel-price"></div>
          <p class="product-desc">${esc(pz.desc)}</p>
          <div class="size-label">גודל מגש</div>
          <div class="size-row">
            <button class="size-btn" data-size="M">
              <div class="size-name">M · אישי</div>
              <div class="size-price" id="price-m"></div>
            </button>
            <button class="size-btn" data-size="L">
              <div class="size-name">L · משפחתי</div>
              <div class="size-price" id="price-l"></div>
            </button>
          </div>
          <div class="product-features">
            <div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ביגה · 72 שעות התפחה
            </div>
            <div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
              תנור אבן לוהט
            </div>
          </div>
          <p class="dough-note">הבצק שלנו מורכב מ-3 סוגי קמחים, על בסיס ביגה (מחמצת איטלקית) שנח לו 72 שעות בטמפרטורה מבוקרת.</p>
        </div>
      </div>
    </section>
    <section class="builder-section">
      <div class="builder-inner">
        <div class="builder-head">
          <h2>רוצים תוספות?</h2>
          <p>בחרו רבע — או את כל המגש — והוסיפו תוספות בדיוק איפה שבא לכם.</p>
        </div>
        <div class="builder-grid">
          <div class="pizza-visual-col">
            <div class="pizza-visual">
              <div class="pv-glow"></div>
              <div class="pv-crust"></div>
              <div class="pv-sauce"></div>
              <div class="pv-cheese"></div>
              <div class="pv-toppings" id="pv-toppings"></div>
              <div class="pv-line-v"></div>
              <div class="pv-line-h"></div>
              <div class="pv-quads">
                <button class="pv-quad tl" data-quad="TL" aria-label="רבע שמאלי עליון"></button>
                <button class="pv-quad tr" data-quad="TR" aria-label="רבע ימני עליון"></button>
                <button class="pv-quad bl" data-quad="BL" aria-label="רבע שמאלי תחתון"></button>
                <button class="pv-quad br" data-quad="BR" aria-label="רבע ימני תחתון"></button>
              </div>
              <div id="pv-rings"></div>
              <div class="pv-target-badge">עריכה: <span id="target-label"></span></div>
            </div>
            <button class="whole-btn" id="whole-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>
              <span id="whole-label"></span>
            </button>
          </div>
          <div class="toppings-col">
            <div class="toppings-label">תוספות <span class="muted">· מחיר לפי תוספת, לכל המגש</span></div>
            <div class="toppings-list" id="toppings-list">
              ${state.toppings.map((t) => `
                <button class="topping-btn" data-topping="${esc(t.uiId)}">
                  <div class="topping-icon">${ICON_ART[t.art]()}</div>
                  <div class="topping-text">
                    <div class="t-name">${esc(t.name)}</div>
                    <div class="t-desc">${esc(t.desc)}</div>
                  </div>
                  <div class="topping-price">+${money(t.price)}</div>
                  <div class="topping-check">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14100D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  </div>
                </button>`).join('')}
            </div>
          </div>
          <aside class="summary-aside">
            <div class="summary-head">
              <div class="title">המגש שלך</div>
              <div class="sub">${esc(pz.name)} · <span id="size-label"></span></div>
            </div>
            <div class="summary-rows" id="summary-rows"></div>
            <div class="summary-totals">
              <div class="summary-line"><span>${esc(pz.name)} (<span id="size-label-2"></span>)</span><span id="base-price"></span></div>
              <div class="summary-line"><span>תוספות × <span id="topping-count"></span></span><span id="toppings-total"></span></div>
              <div class="summary-total"><span class="lbl">סה"כ</span><span class="val" id="total-label"></span></div>
            </div>
            <button class="add-cart-btn" id="add-cart-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
              <span id="cart-btn-label"></span>
            </button>
            <div class="summary-note">מוכן תוך ~20 דקות · משלוח או איסוף עצמי</div>
          </aside>
        </div>
      </div>
    </section>`;

  app.querySelectorAll('.size-btn').forEach((b) => b.addEventListener('click', () => { state.size = b.dataset.size; updateProduct(); }));
  app.querySelectorAll('.pv-quad').forEach((b) => b.addEventListener('click', () => { state.target = b.dataset.quad; updateProduct(); }));
  document.getElementById('whole-btn').addEventListener('click', () => { state.target = 'whole'; updateProduct(); });
  app.querySelectorAll('.topping-btn').forEach((b) => b.addEventListener('click', () => toggleTopping(b.dataset.topping)));
  document.getElementById('add-cart-btn').addEventListener('click', addToCart);
  app.querySelector('[data-action="home"]').addEventListener('click', (e) => { e.preventDefault(); goHome(); });

  updateProduct();
}

function toggleTopping(uiId) {
  const targets = state.target === 'whole' ? QUADS : [state.target];
  const onAll = targets.every((q) => state.quads[q].includes(uiId));
  for (const q of targets) {
    state.quads[q] = onAll
      ? state.quads[q].filter((t) => t !== uiId)
      : (state.quads[q].includes(uiId) ? state.quads[q] : [...state.quads[q], uiId]);
  }
  updateProduct();
}

const selectedToppings = () => state.toppings.filter((t) => QUADS.some((q) => state.quads[q].includes(t.uiId)));

function updateProduct() {
  const pz = state.sel;
  const { size, target, quads } = state;
  const isWhole = target === 'whole';
  const basePrice = size === 'M' ? pz.priceM : pz.priceL;
  const chosen = selectedToppings();
  const toppingsTotal = chosen.reduce((s, t) => s + t.price, 0);
  const total = basePrice + toppingsTotal;
  const sizeLabel = size === 'M' ? 'אישי' : 'משפחתי';

  document.getElementById('sel-price').textContent = money(basePrice);
  document.getElementById('price-m').textContent = money(pz.priceM);
  document.getElementById('price-l').textContent = money(pz.priceL);
  app.querySelectorAll('.size-btn').forEach((b) => b.classList.toggle('active', b.dataset.size === size));

  // placed toppings
  const placed = [];
  for (const q of QUADS) {
    quads[q].forEach((uiId) => {
      const ti = state.toppings.findIndex((t) => t.uiId === uiId);
      const art = state.toppings[ti]?.art || 'olive';
      scatterFor(q, ti).forEach(([x, y], j) => {
        const rot = (ti * 61 + j * 133) % 360;
        placed.push(`<div class="pv-topping" style="left:${x}%; top:${y}%;">${TOPPING_ART[art](30, rot)}</div>`);
      });
    });
  }
  document.getElementById('pv-toppings').innerHTML = placed.join('');

  // quadrant highlight + rings
  app.querySelectorAll('.pv-quad').forEach((b) => {
    b.style.background = (!isWhole && b.dataset.quad === target) ? 'rgba(240,231,216,0.1)' : 'transparent';
  });
  document.getElementById('pv-rings').innerHTML = isWhole
    ? `<div class="pv-whole-ring"></div>`
    : `<div class="pv-quad-ring" style="left:${RING_POS[target][0]}; top:${RING_POS[target][1]}; border-radius:${RING_RAD[target]};"></div>`;
  document.getElementById('target-label').textContent = isWhole ? 'כל המגש' : QUAD_NAME[target];

  const wholeBtn = document.getElementById('whole-btn');
  wholeBtn.classList.toggle('active', isWhole);
  document.getElementById('whole-label').textContent = isWhole ? 'עורכים את כל המגש' : 'בחרו את כל המגש';

  // toppings list active state (active = on ALL current targets)
  const targetsNow = isWhole ? QUADS : [target];
  app.querySelectorAll('.topping-btn').forEach((b) => {
    const active = targetsNow.every((q) => quads[q].includes(b.dataset.topping));
    b.classList.toggle('active', active);
  });

  // summary
  document.getElementById('summary-rows').innerHTML = QUADS.map((q) => {
    const names = quads[q].map((uiId) => state.toppings.find((t) => t.uiId === uiId)?.name).filter(Boolean);
    const empty = names.length === 0;
    const targeted = isWhole || target === q;
    return `<div class="summary-row">
      <div class="label" style="color:${targeted ? 'var(--accent)' : '#8F8270'};">${QUAD_NAME[q]}</div>
      <div class="text" style="color:${empty ? '#5E5546' : '#F0E7D8'};">${empty ? 'ללא תוספות' : names.map(esc).join(', ')}</div>
    </div>`;
  }).join('');

  document.getElementById('size-label').textContent = sizeLabel;
  document.getElementById('size-label-2').textContent = sizeLabel;
  document.getElementById('base-price').textContent = money(basePrice);
  document.getElementById('topping-count').textContent = chosen.length;
  document.getElementById('toppings-total').textContent = chosen.length === 0 ? '—' : '+' + money(toppingsTotal);
  document.getElementById('total-label').textContent = money(total);
  document.getElementById('cart-btn-label').textContent = 'הוסיפו לסל — ' + money(total);
}

function placementNote() {
  const { quads } = state;
  const chosen = selectedToppings();
  if (!chosen.length) return '';
  const lines = chosen.map((t) => {
    const inQuads = QUADS.filter((q) => quads[q].includes(t.uiId));
    const where = inQuads.length === 4 ? 'כל המגש' : inQuads.map((q) => QUAD_NAME[q]).join(', ');
    return `${t.name}: ${where}`;
  });
  return lines.join(' | ');
}

async function addToCart() {
  const pz = state.sel;
  const btn = document.getElementById('add-cart-btn');
  const { operationId, menuId, sectionId, modifierGroupId } = state.wix;

  if (!state.live || !pz.itemId || !operationId) {
    toast('ההזמנות אינן זמינות כרגע — נסו שוב עוד רגע');
    return;
  }
  const variant = state.size === 'M' ? pz.variantM : pz.variantL;
  if (!variant) {
    toast('משהו השתבש — נסו שוב');
    return;
  }
  state.adding = true;
  btn.disabled = true;
  try {
    const chosen = selectedToppings().filter((t) => t.modifierId);
    const options = {
      operationId,
      menuId,
      sectionId,
      priceVariant: { id: variant.id },
    };
    if (chosen.length && modifierGroupId) {
      options.modifierGroups = [{
        id: modifierGroupId,
        modifiers: chosen.map((t) => ({ id: t.modifierId, price: String(t.price) })),
      }];
    }
    const note = placementNote();
    if (note) options.specialRequests = note;

    await client.currentCart.addToCurrentCart({
      lineItems: [{
        quantity: 1,
        catalogReference: { catalogItemId: pz.itemId, appId: ORDERS_APP_ID, options },
      }],
    });
    await refreshCartLabel();
    toast('המגש נוסף לסל 🍕');
    state.quads = { TL: [], TR: [], BL: [], BR: [] };
    state.target = 'whole';
    updateProduct();
  } catch (err) {
    console.warn('[pizza-louise] add to cart failed', err);
    toast('משהו השתבש — נסו שוב');
  } finally {
    state.adding = false;
    btn.disabled = false;
  }
}

// ---- routing ----
function openPizza(key) {
  const pz = state.pizzas.find((p) => p.key === key);
  if (!pz) return;
  state.sel = pz;
  state.size = 'L';
  state.target = 'whole';
  state.quads = { TL: [], TR: [], BL: [], BR: [] };
  state.view = 'product';
  window.location.hash = '#/pizza/' + encodeURIComponent(key);
  window.scrollTo(0, 0);
  renderProduct();
}

function goHome() {
  state.view = 'home';
  state.sel = null;
  if (window.location.hash && window.location.hash !== '#/') window.location.hash = '#/';
  window.scrollTo(0, 0);
  renderHome();
}

function renderHomeRoute() {
  state.view = 'home';
  renderHome();
}

function goAbout() {
  state.view = 'about';
  state.sel = null;
  if (window.location.hash !== '#/about') window.location.hash = '#/about';
  window.scrollTo(0, 0);
  renderAbout();
}

function routeFromHash() {
  if (window.location.hash === '#/about') {
    if (state.view !== 'about') { state.view = 'about'; state.sel = null; renderAbout(); }
    return;
  }
  const m = window.location.hash.match(/^#\/pizza\/(.+)$/);
  if (m) {
    const key = decodeURIComponent(m[1]);
    const pz = state.pizzas.find((p) => p.key === key);
    if (pz) {
      if (state.sel !== pz || state.view !== 'product') {
        state.sel = pz; state.size = 'L'; state.target = 'whole';
        state.quads = { TL: [], TR: [], BL: [], BR: [] };
        state.view = 'product';
        renderProduct();
      }
      return;
    }
  }
  if (state.view !== 'home') renderHomeRoute();
}

// ---- boot ----
document.querySelector('.nav-brand').addEventListener('click', goHome);
document.querySelector('.nav-links a[data-action="home"]').addEventListener('click', (e) => { e.preventDefault(); goHome(); });
document.querySelector('.nav-links a[data-action="about"]').addEventListener('click', (e) => { e.preventDefault(); goAbout(); });
document.getElementById('cart-pill').addEventListener('click', goCheckout);
window.addEventListener('hashchange', routeFromHash);

// paint immediately (fallback data fills in once loaded)
if (window.location.hash === '#/about') { state.view = 'about'; renderAbout(); }
else renderHome();
loadCatalog().then(() => {
  routeFromHash();
  if (state.view === 'home') renderHome();
  else if (state.view === 'product') updateProduct();
  refreshCartLabel();
});
