import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePromos } from '../hooks/usePromos';
import { useViewport } from '../hooks/useViewport';
import { useLanguage } from '../context/LanguageContext';
import { DURATION, prefersReducedMotion } from '../lib/motion';
import { cn } from '../lib/cn';
import Skeleton from './Skeleton';
import FadeText from './FadeText';

// ---------------------------------------------------------------------------
// Tuning. The posters turn around the vertical axis in one of two shapes:
//   'polygon'  the posters are the sides of one open prism that turns as a
//              whole: 7 posters make a heptagon, 6 a hexagon, 8 an octagon...
//              It tips towards you, so you look down into it and see the
//              back sides (blurred) over the front ones.
//   'ring'     the posters stand apart on a circle and each one eases at its
//              own speed (cable car); the back ones show blurred behind.
const SHAPE = 'polygon';

// Per screen size:
//   sharp     posters kept sharp at the front (odd number, centred)
//   card      share of the carousel's width one poster takes...
//   maxCard   ...capped at this many px...
//   maxCardVh ...and at this share of the screen height
//   radius    ring only: radius in poster widths (tuned for 7 posters; other
//             counts keep the same spacing between neighbours). The polygon's
//             size follows from the poster width and count.
const RING = {
  mobile: { sharp: 1, card: 0.74, maxCard: 340, maxCardVh: 0.46, radius: 1.05 },
  tablet: { sharp: 3, card: 0.36, maxCard: 420, maxCardVh: 0.42, radius: 1.1 },
  desktop: { sharp: 3, card: 0.36, maxCard: 540, maxCardVh: 0.6, radius: 1.2 },
};

// Cable-car motion (ring): every poster's speed depends on where it is,
//   speed = MIN_SPEED + (1 - MIN_SPEED) * (|angle| / maxAngle)^2
// slowest at the centre, full speed from FULL_SPEED_AT positions out.
// A solid polygon can't let its sides move at different speeds, so it eases
// as a whole instead: slow into each stop, fast in between.
const STEP_MS = 500; // one position; longer jumps take a little longer
const MIN_SPEED = 0.35;
const FULL_SPEED_AT = 1.5;

// Posters beyond the sharp ones, per position further out
const BLUR_PER_STEP = 3; // px
const BLUR_MAX = 8; // px
const FADE_PER_STEP = 0.28;
const MIN_OPACITY = 0.35;
const SHRINK_PER_STEP = 0.07; // ring only

// Polygon only
const TILT = 12; // deg the polygon tips towards you
const SIDE_BLUR = 1; // px on the posters either side of the centre one

// Ring only (they would bend a solid polygon out of shape)
const RAISE = 0.06; // the centre poster is this much larger
const TURN = 26; // deg a poster turns at the side of the ring; posters always face forward, never show their backs
const LIFT = 0.38; // poster widths the back of the ring rises, as if seen from slightly above
const PERSPECTIVE = 5; // camera distance in poster widths
const ADVANCE_MS = 5000; // autoplay
// ---------------------------------------------------------------------------

const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
const mod = (n, m) => ((n % m) + m) % m;
const easeInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOut = (t) => Math.sin((Math.PI * t) / 2);

// The cable-car curve as a change of coordinates. W(angle) integrates
// 1 / speed(angle), so moving every poster evenly in W space (and mapping
// back with Winv) makes each one travel at its own position-dependent speed,
// while all of them still land on their next slot at the same moment.
// Closed form: the integral of 1 / (a + b(x/m)^2) is (m / sqrt(ab)) atan(x sqrt(b/a) / m).
function cableCar(maxAngle) {
  const a = MIN_SPEED;
  const b = 1 - MIN_SPEED;
  const k = maxAngle / Math.sqrt(a * b);
  const r = Math.sqrt(b / a);
  const wMax = k * Math.atan(r); // W at maxAngle; constant speed beyond it
  const base = (x) => Math.sign(x) * (Math.abs(x) <= maxAngle
    ? k * Math.atan((Math.abs(x) / maxAngle) * r)
    : wMax + Math.abs(x) - maxAngle);
  const baseInv = (u) => Math.sign(u) * (Math.abs(u) <= wMax
    ? (maxAngle / r) * Math.tan(Math.abs(u) / k)
    : maxAngle + Math.abs(u) - wMax);
  // Angles keep counting past ±180 as the ring turns, so extend periodically
  const half = base(180);
  return {
    W: (deg) => { const n = Math.floor((deg + 180) / 360); return base(deg - 360 * n) + 2 * half * n; },
    Winv: (u) => { const n = Math.floor((u + half) / (2 * half)); return baseInv(u - 2 * half * n) + 360 * n; },
  };
}

// Where a poster sits when it is `angle` degrees round the ring from the
// front (0 = centre, ±180 = straight behind).
function pose(angle, g) {
  const a = Math.abs(angle);
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const behind = Math.max(0, (a - g.sharpEdge) / g.step); // positions past the sharp ones
  const side = g.polygon ? SIDE_BLUR * Math.min(a / g.step, 1) : 0;
  // Half-pixel steps: smooth to the eye, but far fewer re-rasterised frames
  const blur = Math.round(Math.min(side + behind * BLUR_PER_STEP, BLUR_MAX) * 2) / 2;
  const look = {
    opacity: Math.max(1 - behind * FADE_PER_STEP, MIN_OPACITY),
    filter: blur ? `blur(${blur}px)` : 'none',
    zIndex: Math.round(100 * (cos + 1)), // nearer posters paint on top
    hidden: behind > 0.01 || (g.polygon && cos < 0),
  };
  // Polygon: a side of the prism, turned the full angle so the sides meet
  // edge to edge, then the whole prism tipped towards you. A side you see
  // from the inside (the back ones, over the front) is mirrored so its poster
  // still reads the right way round; that happens exactly when it is edge-on
  // to the camera: cos(angle) cos(tilt) (perspective + r) = r.
  if (g.polygon) {
    const inside = cos * Math.cos((TILT * Math.PI) / 180) * (g.perspective + g.radius) < g.radius;
    return {
      ...look,
      transform:
        `translateZ(${-g.radius}px) rotateX(${-TILT}deg) rotateY(${angle}deg) translateZ(${g.radius}px)` +
        (inside ? ' scaleX(-1)' : ''),
    };
  }
  const raise = 1 + RAISE * Math.max(0, 1 - a / g.step);
  return {
    ...look,
    transform:
      `translate3d(${g.radius * sin}px, ${-LIFT * g.card * (1 - cos)}px, ${g.radius * (cos - 1)}px) ` +
      `rotateY(${TURN * sin}deg) scale(${raise * Math.max(1 - behind * SHRINK_PER_STEP, 0.6)})`,
  };
}

// Reduced motion: no ring, the front poster simply fades in
const flatPose = (angle) => {
  const front = Math.abs(angle) < 0.5;
  return { transform: 'none', opacity: front ? 1 : 0, filter: 'none', zIndex: front ? 2 : 1, hidden: !front };
};

function measure(width, mode, count) {
  const c = RING[mode];
  const card = Math.round(Math.min(width * c.card, window.innerHeight * c.maxCardVh, c.maxCard));
  const step = 360 / count;
  const stepRad = (Math.min(step, 90) * Math.PI) / 180;
  const polygon = SHAPE === 'polygon';
  const radius = polygon
    // Distance from the prism's axis to the middle of a side, so neighbouring
    // sides meet edge to edge (two posters: back to back)
    ? (count > 2 ? card / (2 * Math.tan(Math.PI / count)) : 0)
    : (c.radius * card * Math.sin((2 * Math.PI) / 7)) / Math.sin(stepRad);
  const raise = polygon ? 0 : RAISE;
  const perspective = PERSPECTIVE * card;
  const depth = (z) => perspective / (perspective - z);
  // Ring: room above the front poster for the back of the ring to rise into
  const backTop = (2 * LIFT * card + (card / 2) * 0.6) * depth(-2 * radius);
  const headroom = Math.max(0, Math.round(backTop - (card * (1 + raise)) / 2));
  // Polygon: how far above and below the posters' centre line the tipped
  // prism reaches on screen (the back sides rise, the front ones dip)
  let top = -card / 2;
  let bottom = card / 2;
  if (polygon) {
    const t = (TILT * Math.PI) / 180;
    for (let deg = 0; deg < 360; deg += 5) {
      const zOnRing = radius * Math.cos((deg * Math.PI) / 180);
      for (const y of [-card / 2, card / 2]) {
        const yTipped = y * Math.cos(t) + zOnRing * Math.sin(t);
        const zTipped = -y * Math.sin(t) + zOnRing * Math.cos(t) - radius;
        top = Math.min(top, yTipped * depth(zTipped));
        bottom = Math.max(bottom, yTipped * depth(zTipped));
      }
    }
  }
  const cardTop = polygon ? Math.ceil(-top - card / 2) : headroom + Math.round((card * raise) / 2);
  return {
    polygon,
    card,
    step,
    radius,
    perspective,
    sharpEdge: ((c.sharp - 1) / 2) * step,
    // How far a drag must go to move the ring one position
    pxPerStep: Math.max(card * 0.5, radius * Math.sin(stepRad) * depth(radius * (Math.cos(stepRad) - 1))),
    cardTop,
    height: polygon ? Math.ceil(cardTop + card / 2 + bottom) : headroom + Math.round(card * (1 + raise)),
    ...cableCar(FULL_SPEED_AT * step),
  };
}

// A poster that shows a skeleton until its image has arrived, then fades in.
function PosterImage({ src, alt, eager }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // A cached image can finish before React attaches onLoad
  useLayoutEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-300 ease-out',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </>
  );
}

function ArrowButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 rounded-xl border border-line bg-surface text-ink flex items-center justify-center transition-[transform,background-color] duration-150 ease-out hover:bg-background-alt active:scale-95"
    >
      {children}
    </button>
  );
}

const cardShape = 'absolute aspect-square rounded-[18px] md:rounded-[22px]';

export default function PromoCarousel({ className }) {
  const { promos, isLoading } = usePromos();
  const { isMobile, isTablet } = useViewport();
  const mode = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  const count = promos.length;
  const hasSlides = count > 1;
  const { t } = useLanguage();
  const captioned = promos.some((p) => Object.values(p.caption).some(Boolean));

  const [reduced] = useState(prefersReducedMotion);
  const [geo, setGeo] = useState(null);
  const [idx, setIdx] = useState(0);
  // Bumped on every move so the active dot's countdown restarts
  const [moves, setMoves] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);

  const rootRef = useRef(null);
  const slideRefs = useRef([]);
  const geoRef = useRef(null);
  const drag = useRef(null);
  // Each poster's angle, unwrapped (keeps counting past ±180 as the ring
  // turns); `target` is the unwrapped position of the centre poster.
  const ring = useRef({ angles: [], target: 0, raf: 0 });

  const paint = () => {
    const g = geoRef.current;
    if (!g) return;
    ring.current.angles.forEach((angle, i) => {
      const el = slideRefs.current[i];
      if (!el) return;
      const p = reduced ? flatPose(wrap(angle)) : pose(wrap(angle), g);
      el.style.transform = p.transform;
      el.style.opacity = p.opacity;
      el.style.filter = p.filter;
      el.style.zIndex = p.zIndex;
      if (el.hasAttribute('aria-hidden') !== p.hidden) el.toggleAttribute('aria-hidden', p.hidden);
    });
  };

  // Turn the ring until the poster at unwrapped position `target` is centred
  const animateTo = (target) => {
    const r = ring.current;
    const g = geoRef.current;
    if (!g || !hasSlides) return;
    r.target = target;
    setIdx(mod(target, count));
    setMoves((m) => m + 1);

    const from = r.angles.slice();
    const to = from.map((_, i) => (i - target) * g.step);
    const wasMoving = r.raf !== 0;
    cancelAnimationFrame(r.raf);
    r.raf = 0;
    if (reduced) {
      r.angles = to;
      paint();
      return;
    }

    const u0 = from.map(g.W);
    const u1 = to.map(g.W);
    const positions = from.reduce((sum, a, i) => sum + Math.abs(to[i] - a), 0) / from.length / g.step;
    const duration = STEP_MS * (0.6 + 0.4 * positions);
    // Already moving (a click mid-turn): carry on at speed instead of stopping first
    const ease = wasMoving ? easeOut : easeInOut;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const p = ease(t);
      // Ring: each poster at its own cable-car speed. Polygon: every side
      // turns by the same angle so the shape holds together.
      if (t >= 1) r.angles = to;
      else if (g.polygon) r.angles = from.map((a, i) => a + (to[i] - a) * p);
      else r.angles = u0.map((u, i) => g.Winv(u + (u1[i] - u) * p));
      paint();
      r.raf = t < 1 ? requestAnimationFrame(frame) : 0;
    };
    r.raf = requestAnimationFrame(frame);
  };

  const go = (dir) => animateTo(ring.current.target + dir);
  // Dots and side posters: the shortest way round
  const goTo = (i) => {
    let d = mod(i - idx, count);
    if (d > count / 2) d -= count;
    if (d) animateTo(ring.current.target + d);
  };

  // Size the ring from the space it has
  useLayoutEffect(() => {
    const el = rootRef.current;
    const update = () => setGeo(measure(el.clientWidth, mode, Math.max(count, 1)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode, count]);

  // The live fetch can swap in a different set of posters: start over
  useLayoutEffect(() => {
    const r = ring.current;
    cancelAnimationFrame(r.raf);
    r.raf = 0;
    r.target = 0;
    r.angles = promos.map((_, i) => (i * 360) / promos.length);
    setIdx(0);
  }, [promos]);

  useLayoutEffect(() => {
    geoRef.current = geo;
    paint();
  });

  useLayoutEffect(() => () => cancelAnimationFrame(ring.current.raf), []);

  const onPointerDown = (e) => {
    if (!hasSlides || e.button !== 0) return;
    drag.current = { x: e.clientX, lastX: e.clientX, lastT: e.timeStamp, vx: 0, moved: false, base: null, slide: e.target.closest('[data-slide]')?.dataset.slide };
    setHeld(true);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    const g = geoRef.current;
    if (!d || !g) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      // Grab the ring where it is, even mid-turn
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      cancelAnimationFrame(ring.current.raf);
      ring.current.raf = 0;
      d.base = ring.current.angles.slice();
    }
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.vx = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    if (!reduced) {
      ring.current.angles = d.base.map((a) => a + (dx / g.pxPerStep) * g.step);
      paint();
    }
  };

  // `cancelled`: the browser took the touch over (a vertical scroll), so it was no tap
  const onPointerUp = (e, cancelled) => {
    const d = drag.current;
    drag.current = null;
    setHeld(false);
    if (!d) return;
    // A tap on a side poster brings it to the centre
    if (!d.moved) {
      if (d.slide != null && !cancelled) goTo(Number(d.slide));
      return;
    }
    const dx = e.clientX - d.x;
    let steps = Math.round(-dx / geoRef.current.pxPerStep);
    // A short flick still counts as one
    if (!steps && (Math.abs(dx) > 40 || Math.abs(d.vx) > 0.4)) steps = dx < 0 ? 1 : -1;
    animateTo(ring.current.target + steps);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  const autoplay = hasSlides && !reduced && !isLoading;
  const paused = hovered || held;
  const stageStyle = geo && {
    height: geo.height,
    perspective: reduced ? undefined : geo.perspective,
    perspectiveOrigin: `50% ${geo.cardTop + geo.card / 2}px`,
  };
  const cardStyle = geo && { width: geo.card, left: `calc(50% - ${geo.card / 2}px)`, top: geo.cardTop };
  const rowStyle = geo && { width: Math.max(geo.card, 300) };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="This week's specials"
      tabIndex={hasSlides && !isLoading ? 0 : undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn('w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[22px]', className)}
    >
      {geo && isLoading && (
        <div role="status" aria-busy="true">
          <span className="sr-only">Loading this week's specials…</span>
          <div className={cn('relative w-full', mode !== 'desktop' && 'overflow-x-clip')} style={stageStyle}>
            {[-2, -1, 1, 2, 0].map((n) => {
              const { transform, opacity, filter, zIndex } = (reduced ? flatPose : pose)(n * geo.step, geo);
              return <Skeleton key={n} className={cardShape} style={{ ...cardStyle, transform, opacity, filter, zIndex }} />;
            })}
          </div>
          <div className="flex items-center justify-between gap-4 mt-3.5 md:mt-4 mx-auto" style={rowStyle} aria-hidden="true">
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-1 w-24 rounded-full" />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
            <div className="hidden md:flex gap-2">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <Skeleton className="w-11 h-11 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {geo && !isLoading && (
        <>
          <div
            className={cn('relative w-full select-none touch-pan-y', mode !== 'desktop' && 'overflow-x-clip')}
            style={stageStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={(e) => onPointerUp(e, true)}
          >
            {promos.map((promo, i) => (
              <div
                key={`${promo.src}-${i}`}
                ref={(el) => { slideRefs.current[i] = el; }}
                data-slide={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                className={cn(
                  cardShape,
                  'overflow-hidden bg-background-alt shadow-poster',
                  reduced ? 'transition-opacity duration-300 ease-out' : 'will-change-transform',
                  i === idx ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                )}
                style={cardStyle}
              >
                <PosterImage
                  key={promo.src}
                  src={promo.src}
                  alt={`Weekly special, poster ${i + 1} of ${count}`}
                  eager={i <= 1 || i === count - 1}
                />
                <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-line pointer-events-none" aria-hidden="true" />
              </div>
            ))}
          </div>

          {/* The centre poster's caption from the admin panel. Two lines are
              always reserved so the page doesn't jump as captions change. */}
          {captioned && (
            <div className="mt-3 md:mt-4 mx-auto min-h-10 flex items-start justify-center" style={rowStyle}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.text }}
                  className="text-sm md:text-[15px] leading-snug font-medium text-ink text-center line-clamp-2 break-words"
                >
                  <FadeText>{t(promos[idx]?.caption)}</FadeText>
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          {hasSlides && (
            <div className="flex items-center justify-between gap-4 mt-3.5 md:mt-4 mx-auto" style={rowStyle}>
              <div className="flex items-center gap-3.5">
                {/* One dot per poster; the active one fills until the next turn */}
                <div className="flex items-center">
                  {promos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show poster ${i + 1} of ${count}`}
                      aria-current={i === idx ? 'true' : undefined}
                      className="py-2.5 px-0.5 group"
                    >
                      <span
                        className={cn(
                          'relative block h-1 rounded-full overflow-hidden bg-line transition-[width,background-color] duration-300 ease-out group-hover:bg-line-strong',
                          i === idx ? 'w-7' : 'w-2.5'
                        )}
                      >
                        {i === idx && (
                          <span
                            key={moves}
                            className="absolute inset-0 bg-primary origin-left"
                            style={autoplay ? {
                              animation: `promo-progress ${ADVANCE_MS}ms linear`,
                              animationPlayState: paused ? 'paused' : 'running',
                            } : undefined}
                            onAnimationEnd={() => go(1)}
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs md:text-[13px] font-medium text-muted tabular-nums">
                  <FadeText>{idx + 1} / {count}</FadeText>
                </span>
              </div>

              <div className="hidden md:flex gap-2">
                <ArrowButton label="Previous poster" onClick={() => go(-1)}>
                  <ChevronLeft size={18} strokeWidth={2.2} />
                </ArrowButton>
                <ArrowButton label="Next poster" onClick={() => go(1)}>
                  <ChevronRight size={18} strokeWidth={2.2} />
                </ArrowButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
