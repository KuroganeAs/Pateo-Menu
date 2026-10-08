import React, { useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { prefersReducedMotion } from '../lib/motion';

// The text sits on the faces of a triangular prism (a Toblerone bar) that
// rolls upward: the old text tips up and fades away while the new text comes
// up from below, faint at first, and settles slowly into place. Every text on
// screen turns together with the same timing. Off-screen text just swaps.
const SPIN = { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' };

function Prism({ from, to, className, onDone }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el.getBoundingClientRect();
    const onScreen = box.width > 0 && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
    if (!onScreen) {
      onDone();
      return undefined;
    }
    // The prism's faces are as tall as the text; its axis sits behind them
    const depth = box.height / (2 * Math.tan(Math.PI / 3));
    el.style.setProperty('--prism-depth', `${depth}px`);
    const prism = el.firstChild;
    const [oldFace, newFace] = prism.children;
    const animations = [
      prism.animate(
        [{ transform: `translateZ(${-depth}px) rotateX(0deg)` }, { transform: `translateZ(${-depth}px) rotateX(120deg)` }],
        SPIN
      ),
      oldFace.animate([{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], SPIN),
      newFace.animate([{ opacity: 0 }, { opacity: 0.2, offset: 0.3 }, { opacity: 1 }], SPIN)
    ];
    let alive = true;
    animations[0].finished.then(() => alive && onDone(), () => {});
    return () => {
      alive = false;
      animations.forEach((a) => a.cancel());
    };
    // Runs once per spin; the parent remounts this for each switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Both faces share one grid cell, so each keeps its natural width and
  // wrapping and the line doesn't reflow while it turns
  const face = '[grid-area:1/1] [backface-visibility:hidden]';
  return (
    <span ref={ref} className={`${className ?? ''} inline-block [perspective:600px]`}>
      <span className="inline-grid [transform-style:preserve-3d]">
        <span aria-hidden="true" className={face} style={{ transform: 'rotateX(0deg) translateZ(var(--prism-depth))' }}>
          {from}
        </span>
        <span className={face} style={{ transform: 'rotateX(-120deg) translateZ(var(--prism-depth))' }}>
          {to}
        </span>
      </span>
    </span>
  );
}

// Text that takes part in the language switch: it rolls over on a prism when
// the language changes, even when the words themselves stay the same.
// Reduced motion swaps it instantly.
export default function FadeText({ children, className }) {
  const { language } = useLanguage();
  const [spin, setSpin] = useState(null);
  const lastLanguage = useRef(language);
  const lastChildren = useRef(children);

  // Before paint, so the new text never flashes in place first. Runs before
  // the effect below, so lastChildren still holds the old text here.
  useLayoutEffect(() => {
    if (lastLanguage.current === language) return;
    lastLanguage.current = language;
    if (!prefersReducedMotion()) setSpin({ language, from: lastChildren.current });
  }, [language]);
  useLayoutEffect(() => {
    lastChildren.current = children;
  });

  if (spin?.language === language) {
    return <Prism key={language} from={spin.from} to={children} className={className} onDone={() => setSpin(null)} />;
  }
  return <span className={className}>{children}</span>;
}
