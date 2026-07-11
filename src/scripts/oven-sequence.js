// Scroll-driven image sequence + text chapters for the "about" story.
// Frames (extracted from the brick-oven video) live in /public/oven/{desktop,mobile}.
// As the user scrolls the tall section, the sticky canvas scrubs the frames AND
// the text "chapters" laid over the dimmed video fade in/out by scroll position.
// Frames lazy-load on approach; degrades to a static frame + all chapters shown
// under prefers-reduced-motion or when canvas is unavailable.

const FRAME_COUNT = 90;
const PAD = (n) => String(n).padStart(4, '0');

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

  const frames = new Array(FRAME_COUNT);
  let current = 0;
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

  const updateChapters = (p) => {
    for (const c of chapters) c.el.classList.toggle('visible', p >= c.show && p < c.hide);
  };

  const tick = () => {
    const p = scrollProgress();
    const targetFrame = p * (FRAME_COUNT - 1);
    current += (targetFrame - current) * 0.12; // LERP for a weighted feel
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
    updateChapters(scrollProgress());
    tick();
    for (let i = 0; i < FRAME_COUNT; i++) if (!frames[i]) loadFrame(i);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { begin(); obs.disconnect(); } });
  }, { rootMargin: '600px 0px' });
  io.observe(section);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}
