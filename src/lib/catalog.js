// Server-side catalog fetch (Astro SSR, ambient Wix auth). Do NOT import from client code.
import { menus, sections, items, itemVariants, itemModifiers, itemModifierGroups, operations } from '@wix/restaurants';

const entId = (x) => x && (x._id ?? x.id);

// Presentation metadata keyed by the real menu-item name (from pizzalouise.co.il).
const PIZZA_META = {
  'מרגריטה 1889': { slug: 'margherita-1889', image: '/assets/pizza-margherita.jpg' },
  'שרומיז': { slug: 'shroomiz', image: '/assets/pizza-shroomiz.jpg' },
  'ברנרד': { slug: 'bernard', image: null },
  'ולואיז': { slug: 'velouise', image: null },
  'החמאה של גרייבר': { slug: 'graiber-butter', image: '/assets/pizza-tomato-butter.jpg' },
  'המתעתעת': { slug: 'mitatat', image: '/assets/pizza-mitatat.jpg' },
  'הים תיכונית': { slug: 'mediterranean', image: '/assets/pizza-mediterranean.jpg' },
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

const slugify = (name, i) =>
  PIZZA_META[name]?.slug || 'pizza-' + i;

// Fallback so a fetch failure still renders a coherent (non-orderable) menu.
const FALLBACK = {
  live: false,
  wix: { operationId: null, menuId: null, sectionId: null, groupId: null },
  pizzas: [
    { name: 'מרגריטה 1889', desc: "רוטב עגבניות שלנו, מוצרלה, פרמז'ן, בזיליקום, שמן זית", priceM: 55, priceL: 75 },
    { name: 'שרומיז', desc: "רוטב עגבניות שלנו, פטריות חיות, ראגו פטריות, פרמז'ן", priceM: 65, priceL: 85 },
    { name: 'ברנרד', desc: "קרם תירס, מוצרלה, בצל ירוק, פרמז'ן", priceM: 65, priceL: 85 },
    { name: 'ולואיז', desc: "קרם פטריות כמהין, פטריות חיות, ראגו פטריות (שיטאקי, שמפיניון, מחית כמהין), מוצרלה, שמן כמהין לבן, פרמז'ן", priceM: 65, priceL: 85 },
    { name: 'החמאה של גרייבר', desc: "חמאת עגבניות, שום קונפי, בצל סגול, מוצרלה, פרמז'ן וגרידת לימון", priceM: 65, priceL: 85 },
    { name: 'המתעתעת', desc: "רוטב עגבניות שלנו, עגבניות קונפי, צ'ילי קונפי, מוצרלה, פרמז'ן, שמן זית", priceM: 65, priceL: 85 },
    { name: 'הים תיכונית', desc: 'רוטב עגבניות שלנו, מוצרלה, זיתי קלמטה, בצל סגול, פלפל חריף, פטה, זילוף דבש', priceM: 65, priceL: 85 },
  ].map((p, i) => ({ ...p, slug: slugify(p.name, i), image: PIZZA_META[p.name]?.image || null, itemId: null, variantMId: null, variantLId: null })),
  toppings: [
    { name: 'פטריות טריות', price: 6 }, { name: 'זיתים שחורים', price: 4 }, { name: 'בצל סגול', price: 3 },
    { name: 'עגבניות שרי', price: 4 }, { name: 'בזיליקום טרי', price: 3 }, { name: 'גבינה בולגרית', price: 7 }, { name: 'פלפל חריף', price: 3 },
  ].map((t) => ({ ...t, art: TOPPING_META[t.name]?.art || 'olive', desc: TOPPING_META[t.name]?.desc || '', uiId: TOPPING_META[t.name]?.art, modifierId: null })),
};

let _cache = null;

export async function getCatalog() {
  if (_cache) return _cache;
  try {
    const [menusRes, sectionsRes, itemsRes, variantsRes, modifiersRes, groupsRes, opsRes] = await Promise.all([
      menus.listMenus(), sections.listSections(), items.listItems(),
      itemVariants.listVariants(), itemModifiers.listModifiers(),
      itemModifierGroups.listModifierGroups(), operations.listOperations(),
    ]);

    const menu = (menusRes.menus || []).find((m) => m.visible) || (menusRes.menus || [])[0];
    if (!menu) throw new Error('no menu');
    const section = (sectionsRes.sections || []).find((s) => (menu.sectionIds || []).includes(entId(s)));
    if (!section) throw new Error('no section');

    const itemById = Object.fromEntries((itemsRes.items || []).map((it) => [entId(it), it]));
    const variantById = Object.fromEntries((variantsRes.variants || []).map((v) => [entId(v), v]));
    const modifierNameById = Object.fromEntries((modifiersRes.modifiers || []).map((m) => [entId(m), m.name]));
    const op = (opsRes.operations || []).find((o) => o.onlineOrderingStatus === 'ENABLED')
      ?? (opsRes.operations || []).find((o) => o.default) ?? (opsRes.operations || [])[0];

    const pizzas = (section.itemIds || []).map((id) => itemById[id]).filter(Boolean).map((it, i) => {
      let vM = null, vL = null;
      for (const v of it.priceVariants?.variants || []) {
        const name = variantById[v.variantId]?.name || '';
        const entry = { id: v.variantId, price: Number(v.priceInfo?.price ?? v.price ?? 0) };
        if (name.includes('אישי')) vM = entry;
        else if (name.includes('משפחתי')) vL = entry;
      }
      return {
        name: it.name, desc: it.description || '',
        priceM: vM?.price ?? 0, priceL: vL?.price ?? vM?.price ?? 0,
        slug: slugify(it.name, i), image: PIZZA_META[it.name]?.image || null,
        itemId: entId(it), variantMId: vM?.id || null, variantLId: vL?.id || null,
      };
    });
    if (!pizzas.length) throw new Error('empty menu');

    const groupId = pizzas.map((p) => entId(itemById[p.itemId]?.modifierGroups?.[0])).find(Boolean);
    const group = (groupsRes.modifierGroups || []).find((g) => entId(g) === groupId);
    const toppings = (group?.modifiers || []).map((m, i) => {
      const name = modifierNameById[entId(m)] || 'תוספת';
      return {
        name, price: Number(m.additionalChargeInfo?.additionalCharge ?? m.additionalCharge ?? 0),
        art: TOPPING_META[name]?.art || 'olive', desc: TOPPING_META[name]?.desc || '',
        uiId: TOPPING_META[name]?.art || 'tp-' + i, modifierId: entId(m),
      };
    });

    _cache = {
      live: Boolean(entId(op) && entId(menu) && entId(section)),
      wix: { operationId: entId(op), menuId: entId(menu), sectionId: entId(section), groupId: groupId || null },
      pizzas,
      toppings: toppings.length ? toppings : FALLBACK.toppings,
    };
    return _cache;
  } catch (err) {
    console.warn('[pizza-louise] catalog fetch failed, using fallback:', err && err.message);
    return FALLBACK;
  }
}

export function findPizza(catalog, slug) {
  return catalog.pizzas.find((p) => p.slug === slug) || null;
}
