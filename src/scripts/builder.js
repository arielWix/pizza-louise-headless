import { TOPPING_ART, QUADS, QUAD_NAME, scatterFor, money } from '../lib/art.js';
import { getClient, refreshCartLabel, toast } from './cart.js';

const ORDERS_APP_ID = '9a5d83fd-8570-482e-81ab-cfa88942ee60';
const RING_POS = { TL: ['0%', '0%'], TR: ['50%', '0%'], BL: ['0%', '50%'], BR: ['50%', '50%'] };
const RING_RAD = { TL: '100% 0 0 0', TR: '0 100% 0 0', BL: '0 0 0 100%', BR: '0 0 100% 0' };

export function initBuilder() {
  const dataEl = document.getElementById('builder-data');
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const pz = data.pizza;
  const toppings = data.toppings; // [{uiId, art, name, price, modifierId}]
  const wix = data.wix;           // {operationId, menuId, sectionId, groupId, live}
  const byUi = Object.fromEntries(toppings.map((t) => [t.uiId, t]));

  const state = { size: 'L', target: 'whole', quads: { TL: [], TR: [], BL: [], BR: [] } };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const selectedToppings = () => toppings.filter((t) => QUADS.some((q) => state.quads[q].includes(t.uiId)));

  function toggleTopping(uiId) {
    const targets = state.target === 'whole' ? QUADS : [state.target];
    const onAll = targets.every((q) => state.quads[q].includes(uiId));
    for (const q of targets) {
      state.quads[q] = onAll
        ? state.quads[q].filter((t) => t !== uiId)
        : (state.quads[q].includes(uiId) ? state.quads[q] : [...state.quads[q], uiId]);
    }
    render();
  }

  function render() {
    const isWhole = state.target === 'whole';
    const basePrice = state.size === 'M' ? pz.priceM : pz.priceL;
    const chosen = selectedToppings();
    const toppingsTotal = chosen.reduce((s, t) => s + t.price, 0);
    const total = basePrice + toppingsTotal;
    const sizeLabel = state.size === 'M' ? 'אישי' : 'משפחתי';

    $('#sel-price').textContent = money(basePrice);
    $$('.size-btn').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));

    // placed toppings on the visual
    const placed = [];
    for (const q of QUADS) {
      state.quads[q].forEach((uiId) => {
        const ti = toppings.findIndex((t) => t.uiId === uiId);
        const art = byUi[uiId]?.art || 'olive';
        scatterFor(q, ti).forEach(([x, y], j) => {
          const rot = (ti * 61 + j * 133) % 360;
          placed.push(`<div class="pv-topping" style="left:${x}%; top:${y}%;">${TOPPING_ART[art](30, rot)}</div>`);
        });
      });
    }
    $('#pv-toppings').innerHTML = placed.join('');

    // quad highlight + rings
    $$('.pv-quad').forEach((b) => {
      b.style.background = (!isWhole && b.dataset.quad === state.target) ? 'rgba(42,26,18,0.14)' : 'transparent';
    });
    $('#pv-rings').innerHTML = isWhole
      ? '<div class="pv-whole-ring"></div>'
      : `<div class="pv-quad-ring" style="left:${RING_POS[state.target][0]}; top:${RING_POS[state.target][1]}; border-radius:${RING_RAD[state.target]};"></div>`;
    $('#target-label').textContent = isWhole ? 'כל המגש' : QUAD_NAME[state.target];

    const wholeBtn = $('#whole-btn');
    wholeBtn.classList.toggle('active', isWhole);
    $('#whole-label').textContent = isWhole ? 'עורכים את כל המגש' : 'בחרו את כל המגש';

    // toppings list active states
    const targetsNow = isWhole ? QUADS : [state.target];
    $$('.topping-btn').forEach((b) => {
      const active = targetsNow.every((q) => state.quads[q].includes(b.dataset.uiId));
      b.classList.toggle('active', active);
    });

    // summary
    $('#summary-rows').innerHTML = QUADS.map((q) => {
      const names = state.quads[q].map((uiId) => byUi[uiId]?.name).filter(Boolean);
      const empty = names.length === 0;
      const targeted = isWhole || state.target === q;
      return `<div class="summary-row">
        <div class="label" style="color:${targeted ? 'var(--accent)' : 'var(--muted)'};">${QUAD_NAME[q]}</div>
        <div class="text" style="color:${empty ? 'var(--muted)' : 'var(--ink)'};">${empty ? 'ללא תוספות' : names.join(', ')}</div>
      </div>`;
    }).join('');

    $('#size-label').textContent = sizeLabel;
    $('#size-label-2').textContent = sizeLabel;
    $('#base-price').textContent = money(basePrice);
    $('#topping-count').textContent = chosen.length;
    $('#toppings-total').textContent = chosen.length === 0 ? '—' : '+' + money(toppingsTotal);
    $('#total-label').textContent = money(total);
    $('#cart-btn-label').textContent = 'הוסיפו לסל — ' + money(total);
  }

  function placementNote() {
    const chosen = selectedToppings();
    if (!chosen.length) return '';
    return chosen.map((t) => {
      const inQuads = QUADS.filter((q) => state.quads[q].includes(t.uiId));
      const where = inQuads.length === 4 ? 'כל המגש' : inQuads.map((q) => QUAD_NAME[q]).join(', ');
      return `${t.name}: ${where}`;
    }).join(' | ');
  }

  async function addToCart() {
    const btn = $('#add-cart-btn');
    const variantId = state.size === 'M' ? pz.variantMId : pz.variantLId;
    if (!wix.live || !pz.itemId || !wix.operationId || !variantId) {
      toast('ההזמנות אינן זמינות כרגע — נסו שוב עוד רגע');
      return;
    }
    btn.disabled = true;
    try {
      const chosen = selectedToppings().filter((t) => t.modifierId);
      const options = {
        operationId: wix.operationId,
        menuId: wix.menuId,
        sectionId: wix.sectionId,
        priceVariant: { id: variantId },
      };
      if (chosen.length && wix.groupId) {
        options.modifierGroups = [{
          id: wix.groupId,
          modifiers: chosen.map((t) => ({ id: t.modifierId, price: String(t.price) })),
        }];
      }
      const note = placementNote();
      if (note) options.specialRequests = note;

      await getClient().currentCart.addToCurrentCart({
        lineItems: [{ quantity: 1, catalogReference: { catalogItemId: pz.itemId, appId: ORDERS_APP_ID, options } }],
      });
      await refreshCartLabel();
      toast('המגש נוסף לסל 🍕');
      state.quads = { TL: [], TR: [], BL: [], BR: [] };
      state.target = 'whole';
      render();
    } catch (err) {
      console.warn('[pizza-louise] add to cart failed', err);
      toast('משהו השתבש — נסו שוב');
    } finally {
      btn.disabled = false;
    }
  }

  $$('.size-btn').forEach((b) => b.addEventListener('click', () => { state.size = b.dataset.size; render(); }));
  $$('.pv-quad').forEach((b) => b.addEventListener('click', () => { state.target = b.dataset.quad; render(); }));
  $('#whole-btn').addEventListener('click', () => { state.target = 'whole'; render(); });
  $$('.topping-btn').forEach((b) => b.addEventListener('click', () => toggleTopping(b.dataset.uiId)));
  $('#add-cart-btn').addEventListener('click', addToCart);

  render();
}
