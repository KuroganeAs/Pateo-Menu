// Slow, eased programmatic scrolling for category jumps.
// Native scrollIntoView({ behavior: 'smooth' }) is quick and not tunable,
// so this animates scrollTop with an ease-in-out curve instead.
// The animation yields immediately if the user scrolls (wheel/touch).

let active = null;

// True while a category-click animation is scrolling the feed.
// The scroll-spy checks this so the active pill doesn't "walk" through
// every intermediate category during the glide — it resumes on user
// scroll automatically because wheel/touch input cancels the animation.
export function isAutoScrolling() {
  return active !== null;
}

function stop() {
  if (!active) return;
  cancelAnimationFrame(active.raf);
  active.cleanup();
  active = null;
}

export function smoothScrollTo(container, targetTop, duration) {
  stop();

  const start = container.scrollTop;
  const maxTop = container.scrollHeight - container.clientHeight;
  const end = Math.max(0, Math.min(targetTop, maxTop));
  const distance = end - start;
  if (Math.abs(distance) < 1) return;

  // Slow and steady: scale with distance, between 0.8s and 1.6s
  const ms = duration ?? Math.min(1600, Math.max(800, Math.abs(distance) * 0.5));
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const t0 = performance.now();

  const onUserInput = () => stop();
  container.addEventListener('wheel', onUserInput, { passive: true });
  container.addEventListener('touchstart', onUserInput, { passive: true });
  const cleanup = () => {
    container.removeEventListener('wheel', onUserInput);
    container.removeEventListener('touchstart', onUserInput);
  };

  const step = (now) => {
    const progress = Math.min(1, (now - t0) / ms);
    container.scrollTop = start + distance * easeInOutCubic(progress);
    if (progress < 1 && active) {
      active.raf = requestAnimationFrame(step);
    } else {
      cleanup();
      active = null;
    }
  };

  active = { raf: requestAnimationFrame(step), cleanup };
}
