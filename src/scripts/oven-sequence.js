// Scroll-driven image-sequence player for the "brick oven" section.
// Frames were extracted from the source video into /public/oven/{desktop,mobile}.
// As the user scrolls through the tall section, the sticky canvas plays the
// frames. Frames are loaded lazily (only when the section nears the viewport)
// to keep the initial page light, and the whole thing degrades to a single
// static frame under prefers-reduced-motion or when canvas is unavailable.

const FRAME_COUNT = 90;
const PAD = (n) => String(n).padStart(4, '0');

export function initOvenSequence() {
  const section = document.getElementById('oven');
  const canvas = document.getElementById('oven-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext && canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 720px)').matches;
  const dir = isMobile ? 'mobile' : 'desktop';
  const W = isMobile ? 720 : 1280;
  const H = isMobile ? 405 : 720;
  canvas.width = W;
  canvas.height = H;

  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let current = 0;
  let target = 0;
  let raf = 0;

  const drawFrame = (i) => {
    i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(i)));
    let img = frames[i];
    // nearest-loaded fallback so we never flash a blank frame
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
    img.onload = () => { loadedCount++; res(); };
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

  const tick = () => {
    target = scrollProgress() * (FRAME_COUNT - 1);
    current += (target - current) * 0.12; // LERP for a weighted, smooth feel
    if (Math.abs(target - current) < 0.01) current = target;
    drawFrame(current);
    raf = requestAnimationFrame(tick);
  };

  // ---- static / reduced-motion path: one representative frame, no scroll drive ----
  const renderStatic = async () => {
    section.classList.add('oven-static');
    await loadFrame(Math.floor(FRAME_COUNT / 2));
    drawFrame(Math.floor(FRAME_COUNT / 2));
  };

  if (reduce || !ctx) { renderStatic(); return; }

  // ---- enhanced path: lazy-load frames when the section approaches, then drive on scroll ----
  let started = false;
  const begin = async () => {
    if (started) return;
    started = true;
    section.classList.add('oven-ready');
    // load a few evenly-spaced "critical" frames first so scrubbing works early
    const critical = [0, 22, 45, 67, 89];
    await Promise.all(critical.map(loadFrame));
    drawFrame(0);
    tick();
    // then backfill the rest in the background
    for (let i = 0; i < FRAME_COUNT; i++) if (!frames[i]) loadFrame(i);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { begin(); obs.disconnect(); } });
  }, { rootMargin: '400px 0px' }); // start loading ~400px before it enters view
  io.observe(section);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}
