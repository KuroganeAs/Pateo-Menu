import React from 'react';

export default function GradualBlur({
  height = '6rem',
  opacity = 1,
  position = 'bottom',
  strength = 1,
}) {
  return (
    <div
      className="pointer-events-none absolute left-0 w-full z-10"
      style={{
        [position]: 0,
        height,
        backdropFilter: `blur(${8 * strength}px)`,
        WebkitBackdropFilter: `blur(${8 * strength}px)`,
        maskImage: 'linear-gradient(to bottom, transparent, black 80%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 80%)',
        opacity,
      }}
    />
  );
}
