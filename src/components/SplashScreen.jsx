import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { art, VIEW_BOX, LEAF_GRADIENT } from '../data/vineHeartArt';
import { EASE_OUT } from '../lib/motion';
import logoHeart from '../assets/logo-heart.png';

// Storyboarded preloader: a silver vine climbs up from the bottom edge of the
// screen; once it reaches the centre its tail is drawn up after it while it
// forms an ornate twin-braid heart (stems, woven companion strands, tendrils,
// grape leaves). The blue Páteo heart (the logo without its wordmark) then
// appears inside it. On hand-over the blue heart flies onto the heart of the
// logo in the landing header while the silver heart and the white backdrop
// fade and the page rises in behind. Shown once per browser session.
// Heart artwork lives in data/vineHeartArt.js; the climbing stem is drawn here
// because its length depends on the screen.

// Choreography in seconds, [delay, duration], grouped by storyboard beat.
const T = {
  stemGrow: [0.05, 0.9], // climbs from the bottom edge to the heart's tip...
  stemRetract: 0.8, // ...then its tail follows it up into the heart
  strandLag: 0.07, // the thin strand twisting round the stem trails a little
  halves: [0.92, 0.95],
  companions: [1.08, 0.95],
  sideTendrils: [1.72, 0.4],
  topScrolls: [1.86, 0.35],
  leaves: [1.78, 1.88, 1.98, 2.08],
  pulse: 2.45,
  logo: [2.45, 0.5]
};
// The finished heart with the logo holds briefly, then hands over. Timer
// driven, so it is immune to backgrounded tabs freezing animation frames.
const ANIM_DONE_MS = 3450;
const HANDOFF_S = 0.65;
// Never hang the splash past this, even if 'load' stalls.
const MAX_WAIT_MS = 7000;
const SEEN_KEY = 'pateo-splash-seen';

// The heart without the artwork's own short stalk (replaced by the climbing
// stem) and without the berry clusters.
const HEART = art.filter((el) => el.label !== 'stalk' && !el.label.startsWith('berry'));
// Bottom tip of the heart, where the climbing stem arrives (artwork units).
const TIP = { x: 100, y: 173.48 };
// The blue heart nearly fills the silver one, its edges meeting the vine
// (artwork units; 341×305 image; size set on the design canvas).
const MARK = { cx: 100, cy: 90.8, width: 140.7, aspect: 341 / 305 };
const MARK_HEIGHT = MARK.width / MARK.aspect;
const markBoxStyle = {
  left: `${(MARK.cx - MARK.width / 2) / 2}%`,
  top: `${(MARK.cy - MARK_HEIGHT / 2) / 2}%`,
  width: `${MARK.width / 2}%`,
  height: `${MARK_HEIGHT / 2}%`
};
// Where the heart sits inside the full logo image (assets/logo.png), as
// fractions of its width and height: the hand-over lands exactly on it.
const HEART_IN_LOGO = { u0: 0.1816, u1: 0.8251, v0: 0.0558, v1: 0.6295 };

// The climbing stem and the thin strand twisting around it, from `bottom`
// (artwork units, below the heart's 200-unit box) up to the heart's tip.
function stemPaths(bottom) {
  const span = bottom - TIP.y;
  const y = (f) => (bottom - f * span).toFixed(1);
  const b = bottom.toFixed(1);
  return {
    stem: `M 96 ${b} C 96 ${y(0.141)} 108 ${y(0.258)} 104 ${y(0.399)} C 100 ${y(0.532)} 92 ${y(0.632)} 96 ${y(0.757)} C 99 ${y(0.857)} 101 ${y(0.931)} ${TIP.x} ${TIP.y}`,
    strand: `M 101 ${b} C 110 ${y(0.091)} 88 ${y(0.175)} 101 ${y(0.266)} C 113 ${y(0.349)} 91 ${y(0.441)} 103 ${y(0.524)} C 113 ${y(0.599)} 92 ${y(0.682)} 99 ${y(0.765)} C 104 ${y(0.832)} 98 ${y(0.906)} ${TIP.x} ${TIP.y}`
  };
}

// Per-element animation, keyed off the labels in vineHeartArt.js
function timingFor(label) {
  const timing = (kind, [delay, duration]) => ({ kind, delay, duration });
  if (label === 'halfR' || label === 'halfL') return timing('draw', T.halves);
  if (label.startsWith('companion')) return timing('draw', T.companions);
  if (label === 'tendrilR' || label === 'tendrilL') return timing('draw', T.sideTendrils);
  if (label.startsWith('scroll')) return timing('draw', T.topScrolls);
  if (label.startsWith('leafStem')) {
    const i = parseInt(label.slice(8), 10) - 1;
    return timing('draw', [T.leaves[i] - 0.1, 0.2]);
  }
  if (label.startsWith('leaf')) {
    const i = parseInt(label.slice(4), 10) - 1;
    return timing('pop', [T.leaves[i], 0.32]);
  }
  if (label.startsWith('vein')) {
    const i = parseInt(label.slice(4), 10) - 1;
    return timing('fade', [T.leaves[i] + 0.15, 0.25]);
  }
  return timing('fade', [0, 0.3]);
}

// A stroke that draws itself in. It stays fully hidden until its turn:
// a round-capped line with zero length would otherwise show as a stray dot.
// `still` shows it finished straight away (reduced motion).
function DrawPath({ d, stroke, strokeWidth, delay, duration, still }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={still ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { delay, duration, ease: 'easeInOut' }, opacity: { delay, duration: 0.01 } }}
    />
  );
}

// The stem grows up from the bottom edge, then its tail rises after it into
// the heart's tip, so only the heart is left.
function ClimbingStem({ d, stroke, strokeWidth, delay }) {
  const total = T.stemGrow[1] + T.stemRetract;
  const segment = {
    delay,
    duration: total,
    times: [0, T.stemGrow[1] / total, 1],
    ease: [[0.45, 0, 0.25, 1], [0.4, 0, 0.2, 1]]
  };
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 0], pathOffset: [0, 0, 1], opacity: [0, 1, 1, 0] }}
      transition={{
        pathLength: segment,
        pathOffset: segment,
        opacity: { delay, duration: total, times: [0, 0.01, 0.97, 1] }
      }}
    />
  );
}

function VineElement({ el, still }) {
  const { kind, delay, duration } = timingFor(el.label);

  if (kind === 'pop') {
    return (
      <motion.path
        d={el.d}
        fill={el.fill}
        initial={still ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration, ease: EASE_OUT }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    );
  }

  if (kind === 'fade') {
    return (
      <motion.path
        d={el.d}
        fill="none"
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        strokeLinecap="round"
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: el.opacity ?? 1 }}
        transition={{ delay, duration, ease: 'easeOut' }}
      />
    );
  }

  return (
    <DrawPath d={el.d} stroke={el.stroke} strokeWidth={el.strokeWidth} delay={delay} duration={duration} still={still} />
  );
}

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { delay: T.logo[0], duration: T.logo[1], ease: EASE_OUT } },
  // Fly onto the heart of the landing header's logo, measured just before closing
  exit: (handoff) =>
    handoff
      ? { x: handoff.x, y: handoff.y, scale: handoff.scale, transition: { duration: HANDOFF_S, ease: EASE_OUT } }
      : { opacity: 0, transition: { duration: 0.3 } }
};

// Where the blue heart has to travel to land on the heart of the logo in the
// landing header.
function measureHandoff(markBox) {
  const target = document.querySelector('[data-brand-logo] img');
  if (!markBox || !target) return null;
  const m = markBox.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  if (!m.width || !t.width) return null;
  const { u0, u1, v0, v1 } = HEART_IN_LOGO;
  return {
    x: t.left + t.width * ((u0 + u1) / 2) - (m.left + m.width / 2),
    y: t.top + t.height * ((v0 + v1) / 2) - (m.top + m.height / 2),
    scale: (t.width * (u1 - u0)) / m.width
  };
}

// Flips true when the page has actually finished loading (or the failsafe fires).
function usePageReady() {
  const [ready, setReady] = useState(() => document.readyState === 'complete');

  useEffect(() => {
    if (ready) return;
    const onLoad = () => setReady(true);
    window.addEventListener('load', onLoad);
    const failsafe = setTimeout(onLoad, MAX_WAIT_MS);
    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(failsafe);
    };
  }, [ready]);

  return ready;
}

const alreadySeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

// `onDone` fires as the splash starts handing over, so the landing page can
// rise in behind it.
export default function SplashScreen({ onDone }) {
  const [skip] = useState(alreadySeen);
  const pageReady = usePageReady();
  const [animDone, setAnimDone] = useState(skip);
  const [handoff, setHandoff] = useState(undefined);
  const [closing, setClosing] = useState(skip);
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [stemBottom, setStemBottom] = useState(400);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (skip) return;
    const timer = setTimeout(() => setAnimDone(true), reduceMotion ? 900 : ANIM_DONE_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion, skip]);

  // How far below the heart's box the screen ends, in artwork units, so the
  // stem starts exactly at the bottom edge (measured before the first paint).
  useLayoutEffect(() => {
    if (skip) return undefined;
    const measure = () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;
      const r = root.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      if (!s.width) return;
      setStemBottom(200 + (r.bottom - s.bottom) * (200 / s.width) + 6);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [skip]);

  // Measure first (one render), then close (next render), so the exiting
  // logo already carries the measured target as its `custom` prop.
  useEffect(() => {
    if (closing || !animDone || !pageReady || handoff !== undefined) return;
    setHandoff(reduceMotion ? null : measureHandoff(logoRef.current));
  }, [animDone, pageReady, closing, handoff, reduceMotion]);

  useEffect(() => {
    if (handoff === undefined || closing) return;
    setClosing(true);
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Storage blocked: the splash just plays again next time
    }
  }, [handoff, closing]);

  useEffect(() => {
    if (closing) onDone?.();
  }, [closing, onDone]);

  const { stem, strand } = stemPaths(stemBottom);

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          key="splash"
          ref={rootRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0, transition: { delay: HANDOFF_S - 0.12, duration: 0.18, ease: 'easeOut' } }}
        >
          <motion.div
            className="absolute inset-0 bg-white"
            exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
            aria-hidden="true"
          />
          <div ref={stageRef} className="relative w-[min(70vw,340px)] aspect-square">
            {/* The stem climbing up from the bottom edge. Same coordinates as
                the heart, but allowed to draw outside the box, down to the
                screen edge */}
            {!reduceMotion && (
              <svg viewBox={VIEW_BOX} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
                <ClimbingStem d={stem} stroke="#8E939B" strokeWidth={5.5} delay={T.stemGrow[0]} />
                <ClimbingStem d={strand} stroke="#C6CAD2" strokeWidth={2} delay={T.stemGrow[0] + T.strandLag} />
              </svg>
            )}

            {/* The silver vine heart: grows from the stem's tip, pulses once
                formed and stays around the logo until the hand-over */}
            <motion.svg
              viewBox={VIEW_BOX}
              className="absolute inset-0 w-full h-full"
              initial={{ scale: 1 }}
              animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.04, 1] }}
              transition={{ delay: T.pulse, duration: 0.4, times: [0, 0.5, 1], ease: 'easeInOut' }}
              exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={LEAF_GRADIENT.id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={LEAF_GRADIENT.from} />
                  <stop offset="1" stopColor={LEAF_GRADIENT.to} />
                </linearGradient>
              </defs>
              {HEART.map((el) => (
                <VineElement key={el.label} el={el} still={reduceMotion} />
              ))}
            </motion.svg>

            {/* The blue Páteo heart, inside the silver one */}
            <motion.div
              ref={logoRef}
              className="absolute"
              style={markBoxStyle}
              variants={logoVariants}
              initial={reduceMotion ? 'visible' : 'hidden'}
              animate="visible"
              exit="exit"
              custom={handoff}
            >
              <img src={logoHeart} alt="Páteo" className="w-full h-full object-contain" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
