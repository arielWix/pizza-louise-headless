// Scroll-driven image sequence + text chapters for the "about" story.
// Frames (extracted from the brick-oven video) live in /public/oven/{desktop,mobile}.
// As the user scrolls the tall section, the sticky canvas scrubs the frames AND
// the text "chapters" over the dimmed video swap by scroll position.
//
// Pacing uses the animated-website skill's scroll-DWELL engine: a Gaussian
// density peaks at each chapter's center, so the scroll "almost stops" while a
// chapter is on screen (time to read) and speeds up through the gaps. Both the
// frame index and chapter visibility are driven by the same remapped progress.
//
// Degrades to a static frame + all chapters stacked under prefers-reduced-motion
// or when canvas is unavailable. Frames lazy-load as the section approaches.

const FRAME_COUNT = 90;
const PAD = (n) => String(n).padStart(4, '0');

// Chapter centers in EFFECTIVE progress space (midpoints of the show/hide ranges
// in index.astro). The dwell engine slows the scroll around these.
const DWELL_CENTERS = [0.095, 0.3, 0.5, 0.7, 0.91];
const DWELL_WIDTH = 0.05;   // how wide each slow zone is
const DWELL_PEAK = 3.0;     // how much slower the scroll feels inside a zone
const REMAP_N = 800;        // LUT resolution

// Build the forward cumulative integral of the density, then invert it so
// raw scroll progress maps to effective progress (frames + chapters).
function buildRemap() {
  const F = [0];
  for (let i = 1; i <= REMAP_N; i++) {
    const x = i / REMAP_N;
    let d = 1;
    for (const c of DWELL_CENTERS) d += DWELL_PEAK * Math.exp(-(((x - c) / DWELL_WIDTH) ** 2));
    F.push(F[i - 1] + d);
  }
  const total = F[REMAP_N];
  return (raw) => {
    const t = Math.max(0, Math.min(1, raw)) * total;
    let lo = 0, hi = REMAP_N;
    while (lo < hi) { const m = (lo + hi) >> 1; if (F[m] < t) lo = m + 1; else hi = m; }
    const i = Math.max(1, lo);
    const frac = (t - F[i - 1]) / ((F[i] - F[i - 1]) || 1);
    return ((i - 1) + frac) / REMAP_N;
  };
}

export function initOvenSequence() {
  const section = document.getElementById('oven');
  const canvas = document.getElementById('oven-canvas');
  if (!section || !canvas) return;

  const chapters = [...section.querySelectorAll('.oven-chapter')].map((el) => ({
    el,
    show: parseFloat(el.dataset.show),
    hide: parseFloat(el.dataset.hide),
  }));

  const ctx = canvas.getContext && canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 720px)').matches;
  const dir = isMobile ? 'mobile' : 'desktop';
  const W = isMobile ? 720 : 1280;
  const H = isMobile ? 405 : 720;
  canvas.width = W;
  canvas.height = H;

  const remap = buildRemap();
  const frames = new Array(FRAME_COUNT);
  let current = 0;
  let activeIdx = -1;
  let raf = 0;

  const drawFrame = (i) => {
    i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(i)));
    let img = frames[i];
    if (!img || !img.complete) {
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[i - d] && frames[i - d].complete) { img = frames[i - d]; break; }
        if (frames[i + d] && frames[i + d].complete) { img = frames[i + d]; break; }
      }
    }
    if (img && img.complete) ctx.drawImage(img, 0, 0, W, H);
  };

  const loadFrame = (i) => new Promise((res) => {
    if (frames[i]) return res();
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => res();
    img.onerror = () => res();
    img.src = `/oven/${dir}/frame-${PAD(i + 1)}.webp`;
    frames[i] = img;
  });

  const scrollProgress = () => {
    const r = section.getBoundingClientRect();
    const denom = r.height - window.innerHeight;
    if (denom <= 0) return 0;
    return Math.max(0, Math.min(1, -r.top / denom));
  };

  // Exactly one chapter may be active; exits are handled by CSS (faster fade-out).
  const updateChapters = (p) => {
    let next = -1;
    for (let i = 0; i < chapters.length; i++) {
      if (p >= chapters[i].show && p < chapters[i].hide) { next = i; break; }
    }
    if (next === activeIdx) return;
    if (activeIdx >= 0) chapters[activeIdx].el.classList.remove('visible');
    if (next >= 0) chapters[next].el.classList.add('visible');
    activeIdx = next;
  };

  const tick = () => {
    const p = remap(scrollProgress());   // dwell-paced effective progress
    const targetFrame = p * (FRAME_COUNT - 1);
    current += (targetFrame - current) * 0.14;
    if (Math.abs(targetFrame - current) < 0.01) current = targetFrame;
    drawFrame(current);
    updateChapters(p);
    raf = requestAnimationFrame(tick);
  };

  // ---- static / reduced-motion: single frame, all chapters shown, no scrub ----
  const renderStatic = async () => {
    section.classList.add('oven-static');
    chapters.forEach((c) => c.el.classList.add('visible'));
    await loadFrame(Math.floor(FRAME_COUNT / 2));
    drawFrame(Math.floor(FRAME_COUNT / 2));
  };

  if (reduce || !ctx) { renderStatic(); return; }

  // ---- enhanced: lazy-load when the section nears, then drive on scroll ----
  let started = false;
  const begin = async () => {
    if (started) return;
    started = true;
    section.classList.add('oven-ready');
    const critical = [0, 22, 45, 67, 89];
    await Promise.all(critical.map(loadFrame));
    drawFrame(0);
    updateChapters(remap(scrollProgress()));
    tick();
    for (let i = 0; i < FRAME_COUNT; i++) if (!frames[i]) loadFrame(i);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { begin(); obs.disconnect(); } });
  }, { rootMargin: '600px 0px' });
  io.observe(section);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}
