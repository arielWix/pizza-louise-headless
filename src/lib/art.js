// Pure SVG/markup helpers for topping art — NO Wix SDK imports, safe on server and client.

export const money = (n) => {
  const v = Number(n);
  return '₪' + (Number.isInteger(v) ? v : v.toFixed(2));
};

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Placed-on-pizza art (larger, rotatable). `s` = size px, `rot` = degrees.
export const TOPPING_ART = {
  mush: (s = 30) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 30 30"><path d="M4 14 C4 7 9 3.5 15 3.5 C21 3.5 26 7 26 14 C26 15.6 24.8 16.4 23 16.4 L7 16.4 C5.2 16.4 4 15.6 4 14 Z" fill="#E8DCC4" stroke="#B9A67F" stroke-width="1.4"></path><path d="M11.5 16.4 L11 24 C11 25.6 12.5 26.6 15 26.6 C17.5 26.6 19 25.6 19 24 L18.5 16.4 Z" fill="#D9C9A6" stroke="#B9A67F" stroke-width="1.4"></path></svg>`,
  olive: () =>
    `<div style="width:20px; height:20px; border-radius:50%; background:#2A2226; border:5px solid #3E3038; box-shadow:inset 0 0 3px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.35);"></div>`,
  onion: () =>
    `<div style="width:26px; height:26px; border-radius:50%; border:4px solid #A465A8; background:transparent; box-shadow:0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(230,190,235,0.5);"></div>`,
  cherry: () =>
    `<div style="width:22px; height:22px; border-radius:50%; background:radial-gradient(circle at 36% 32%, #E86A4A 0%, #C13A22 65%, #9E2C16 100%); box-shadow:inset 0 -2px 4px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.3);"></div>`,
  basil: (s = 30, rot = 0) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 30 30" style="transform:rotate(${rot}deg);"><path d="M15 2 C22 6 25 13 23 21 C21.5 26 17 28 15 28 C13 28 8.5 26 7 21 C5 13 8 6 15 2 Z" fill="#5E8A3E" stroke="#3F6428" stroke-width="1.4"></path><path d="M15 5 L15 25" stroke="#3F6428" stroke-width="1.2"></path></svg>`,
  feta: (s = 30, rot = 0) =>
    `<div style="width:18px; height:16px; background:linear-gradient(160deg, #F5EFE0 0%, #E3D9C2 100%); border-radius:3px; transform:rotate(${rot}deg); box-shadow:0 1px 3px rgba(0,0,0,0.35);"></div>`,
  hot: (s = 26, rot = 0) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 30 30" style="transform:rotate(${rot}deg);"><path d="M8 6 C6 10 6 16 9 21 C11 24 15 26 19 24 C23 22 25 17 24 12 C23.4 9 21 6.5 18 6 C14.5 5.4 10 4.5 8 6 Z" fill="#C93A28" stroke="#8E2416" stroke-width="1.4"></path><path d="M8 6 C7 4 8 2.5 10 2.5" fill="none" stroke="#4E7A32" stroke-width="2.2" stroke-linecap="round"></path></svg>`,
};

// Small list-icon art (fixed size, no rotation).
export const ICON_ART = {
  mush: () => TOPPING_ART.mush(24),
  olive: () => `<div style="width:18px; height:18px; border-radius:50%; background:#2A2226; border:5px solid #4A3A44;"></div>`,
  onion: () => `<div style="width:22px; height:22px; border-radius:50%; border:4px solid #A465A8;"></div>`,
  cherry: () => `<div style="width:18px; height:18px; border-radius:50%; background:radial-gradient(circle at 36% 32%, #E86A4A 0%, #C13A22 65%, #9E2C16 100%);"></div>`,
  basil: () => TOPPING_ART.basil(22, 0),
  feta: () => `<div style="width:17px; height:15px; background:linear-gradient(160deg, #F5EFE0 0%, #E3D9C2 100%); border-radius:3px; transform:rotate(-8deg);"></div>`,
  hot: () => TOPPING_ART.hot(22, 0),
};

export const QUADS = ['TL', 'TR', 'BL', 'BR'];
export const QUAD_CENTER = { TL: [31, 31], TR: [69, 31], BL: [31, 69], BR: [69, 69] };
export const QUAD_NAME = { TL: 'רבע שמאלי עליון', TR: 'רבע ימני עליון', BL: 'רבע שמאלי תחתון', BR: 'רבע ימני תחתון' };

export function scatterFor(quad, toppingIdx) {
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
