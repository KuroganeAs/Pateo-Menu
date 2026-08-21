import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { art, VIEW_BOX, LEAF_GRADIENT } from '../data/vineHeartArt';
import logo from '../assets/logo.png';

// Storyboarded preloader: a silver vine grows from a stalk into an ornate
// twin-braid heart (stems, woven companion strands, tendrils, grape leaves,
// berry clusters), pulses, then a high-polish flash swaps in the blue Páteo
// logo before the wordmark fades in. Artwork lives in data/vineHeartArt.js.

// Choreography (seconds). Grouped by storyboard beat — tune to taste.
const T = {
  stalk: 0.05,
  halves: 0.3,
  companions: 0.5,
  sideTendrils: 1.05,
  topScrolls: 1.35,
  leaves: [1.0, 1.15, 1.3, 1.45],
  berryStems: 1.5,
  berries: 1.55,
  pulse: 1.95,
  crossfade: 2.3
};
// Nudges the logo down so its heart sits where the vine heart formed.
const LOGO_Y_OFFSET = '8%';
// Sequence considered finished here (setTimeout-driven, immune to
// backgrounded tabs freezing animation frames).
const ANIM_DONE_MS = 3300;
// Never hang the splash past this, even if 'load' stalls.
const MAX_WAIT_MS = 6000;

// Per-element animation, keyed off the labels in vineHeartArt.js
function timingFor(label) {
  if (label === 'stalk') return { kind: 'draw', delay: T.stalk, duration: 0.3 };
  if (label === 'halfR' || label === 'halfL') return { kind: 'draw', delay: T.halves, duration: 1.1 };
  if (label.startsWith('companion')) return { kind: 'draw', delay: T.companions, duration: 1.1 };
  if (label === 'tendrilR' || label === 'tendrilL') return { kind: 'draw', delay: T.sideTendrils, duration: 0.5 };
  if (label.startsWith('scroll')) return { kind: 'draw', delay: T.topScrolls, duration: 0.4 };
  if (label.startsWith('berryStem')) return { kind: 'draw', delay: T.berryStems, duration: 0.3 };
  if (label.startsWith('leafStem')) {
    const i = parseInt(label.slice(8), 10) - 1;
    return { kind: 'draw', delay: T.leaves[i] - 0.1, duration: 0.25 };
  }
  if (label.startsWith('leaf')) {
    const i = parseInt(label.slice(4), 10) - 1;
    return { kind: 'pop', delay: T.leaves[i], duration: 0.35 };
  }
  if (label.startsWith('vein')) {
    const i = parseInt(label.slice(4), 10) - 1;
    return { kind: 'fade', delay: T.leaves[i] + 0.2, duration: 0.25 };
  }
  if (label.startsWith('berry')) {
    const i = parseInt(label.slice(5), 10) - 1;
    return { kind: 'pop', delay: T.berries + (i % 6) * 0.04, duration: 0.25 };
  }
  return { kind: 'fade', delay: 0, duration: 0.3 };
}

function VineElement({ el }) {
  const { kind, delay, duration } = timingFor(el.label);

  if (el.tag === 'circle') {
    return (
      <motion.circle
        cx={el.cx}
        cy={el.cy}
        r={el.r}
        fill={el.fill}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration, ease: 'easeOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    );
  }

  if (kind === 'pop') {
    return (
      <motion.path
        d={el.d}
        fill={el.fill}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration, ease: [0.34, 1.4, 0.64, 1] }}
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
        opacity={el.opacity}
        initial={{ opacity: 0 }}
        animate={{ opacity: el.opacity ?? 1 }}
        transition={{ delay, duration, ease: 'easeOut' }}
      />
    );
  }

  // draw
  return (
    <motion.path
      d={el.d}
      fill="none"
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay, duration, ease: 'easeInOut' }}
    />
  );
}

function VineHeartSequence() {
  return (
    <div className="relative w-[min(70vw,340px)] aspect-square">
      {/* Final logo (heart + wordmark): one simple fade-in as the vines fade
          out, shifted down so its heart matches the vine heart's position */}
      <motion.img
        src={logo}
        alt="Páteo"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ y: LOGO_Y_OFFSET }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.crossfade, duration: 0.5, ease: 'easeInOut' }}
      />

      {/* The vine heart: grows, pulses once formed, then yields to the logo */}
      <motion.svg
        viewBox={VIEW_BOX}
        className="absolute inset-0 w-full h-full"
        animate={{ scale: [1, 1.05, 1], opacity: 0 }}
        transition={{
          scale: { delay: T.pulse, duration: 0.4, times: [0, 0.5, 1], ease: 'easeInOut' },
          opacity: { delay: T.crossfade, duration: 0.5, ease: 'easeInOut' }
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={LEAF_GRADIENT.id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={LEAF_GRADIENT.from} />
            <stop offset="1" stopColor={LEAF_GRADIENT.to} />
          </linearGradient>
        </defs>
        {art.map((el) => (
          <VineElement key={el.label} el={el} />
        ))}
      </motion.svg>
    </div>
  );
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

export default function SplashScreen() {
  const pageReady = usePageReady();
  const [animDone, setAnimDone] = useState(false);
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const timer = setTimeout(() => setAnimDone(true), reduceMotion ? 400 : ANIM_DONE_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const show = !(animDone && pageReady);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {reduceMotion ? (
            <img src={logo} alt="Páteo" className="w-56 aspect-square object-contain" />
          ) : (
            <VineHeartSequence />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
