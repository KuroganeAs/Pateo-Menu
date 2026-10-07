import React from 'react';

// Hand-drawn category icons, each based on what Páteo actually serves in that
// section. One 24px grid, rounded 1.75 strokes and a light tint inside the main
// shape, so they sit calmly in the blue heading tiles.
const tint = { fill: 'currentColor', fillOpacity: 0.16 };

const ICONS = {
  // A filled bread roll: bola, cereal, rustic, rye and milk bread
  roll: (
    <>
      <path d="M4 12.2C4 8.3 7.6 5.5 12 5.5s8 2.8 8 6.7z" {...tint} />
      <path d="M9.2 8.4l1.4 1.3M13.4 7.9l1.4 1.3" />
      <path d="M3.6 14.6c1.1 0 1.1.9 2.2.9s1.1-.9 2.2-.9 1.1.9 2.2.9 1.1-.9 2.2-.9 1.1.9 2.2.9 1.1-.9 2.2-.9 1.1.9 2.2.9" />
      <path d="M4.6 17.4h14.8c0 1.6-1.3 2.8-2.9 2.8H7.5c-1.6 0-2.9-1.2-2.9-2.8z" {...tint} />
    </>
  ),
  // A grilled slice: tostas, bifana and the cutlet sandwiches
  toast: (
    <>
      <path d="M6.5 20.5v-9C4.8 10.9 4 9.6 4 8.2 4 5.7 7.6 3.8 12 3.8s8 1.9 8 4.4c0 1.4-.8 2.7-2.5 3.3v9z" {...tint} />
      <path d="M9 10.8l6 6M12.8 10.8l2.2 2.2M9 14.8l2.2 2.2" />
    </>
  ),
  // The espresso cup on its saucer
  cup: (
    <>
      <path d="M5.5 9.5h10.5v3.8a4.6 4.6 0 0 1-4.6 4.6h-1.3a4.6 4.6 0 0 1-4.6-4.6z" {...tint} />
      <path d="M16 10.8h1.1a2.3 2.3 0 0 1 0 4.6h-1.5" />
      <path d="M3.6 20.2c.9.7 3.9 1.1 7.4 1.1s6.5-.4 7.4-1.1" />
      <path d="M9 2.8c-.8 1 .8 1.8 0 2.9M12.6 2.8c-.8 1 .8 1.8 0 2.9" />
    </>
  ),
  // A layered croissant
  croissant: (
    <>
      <path d="M2.8 15.2c.5-5.7 4.3-9.2 9.2-9.2s8.7 3.5 9.2 9.2c-1.5 1-3.1.8-4.2-.1-.9 2.2-2.8 3.6-5 3.6s-4.1-1.4-5-3.6c-1.1.9-2.7 1.1-4.2.1z" {...tint} />
      <path d="M9.2 6.6l1.2 11.2M14.8 6.6l-1.2 11.2" />
    </>
  ),
  // A crimped rissol, for the folhados, samosas and panikes too
  rissol: (
    <>
      <path d="M3 16.5a9 9 0 0 1 18 0z" {...tint} />
      <path d="M4.2 12l1.6.9M7.5 8.7l.9 1.6M12 7.5v1.8M16.5 8.7l-.9 1.6M19.8 12l-1.6.9" />
    </>
  ),
  // The pastel de nata, with its caramelised top
  nata: (
    <>
      <path d="M3.5 10.5l1.6 6.6c.4 1.7 3.3 2.9 6.9 2.9s6.5-1.2 6.9-2.9l1.6-6.6" {...tint} />
      <ellipse cx="12" cy="10.5" rx="8.5" ry="3.3" />
      <ellipse cx="10" cy="10.3" rx="1.2" ry="0.6" fill="currentColor" stroke="none" />
      <ellipse cx="14.3" cy="11" rx="1" ry="0.5" fill="currentColor" stroke="none" />
      <path d="M7.3 14.4l.5 3.2M12 14.8v3.6M16.7 14.4l-.5 3.2" />
    </>
  ),
  // The copa glass with lime: gin & tonic, Aperol, Porto tónico
  glass: (
    <>
      <path d="M6.5 4.5h11c.4 4.9-1.8 8.6-5.5 8.6s-5.9-3.7-5.5-8.6z" {...tint} />
      <path d="M12 13.1v6.4M8.6 20h6.8M7.2 8h9.6" />
      <circle cx="17.4" cy="4.2" r="2.2" />
    </>
  ),
  // A takeaway bag
  bag: (
    <>
      <path d="M5.5 8.5h13l-1 11.6a1 1 0 0 1-1 .9h-9a1 1 0 0 1-1-.9z" {...tint} />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  )
};

// Bundled category ids first; categories added in the admin panel later get
// an icon from their English name.
const BY_ID = {
  'sandes': 'roll',
  'sandes-especiais': 'toast',
  'barista': 'cup',
  'croissants': 'croissant',
  'pasteis-salgados': 'rissol',
  'bolos-doces': 'nata',
  'bebidas-cocktails': 'glass'
};

const BY_NAME = [
  [/package|pacote|takeaway/i, 'bag'],
  [/toast|tosta/i, 'toast'],
  [/sandwich|sandes|roll/i, 'roll'],
  [/barista|coffee|caf[eé]|tea/i, 'cup'],
  [/croissant/i, 'croissant'],
  [/pastr|savory|salgad/i, 'rissol'],
  [/cake|sweet|bolo|doce/i, 'nata'],
  [/drink|cocktail|bebida|wine/i, 'glass']
];

function iconKeyFor(category) {
  if (!category) return null;
  if (BY_ID[category.id]) return BY_ID[category.id];
  const name = category.title?.en || '';
  return BY_NAME.find(([pattern]) => pattern.test(name))?.[1] ?? null;
}

export default function CategoryIcon({ category, size = 20, className }) {
  const key = iconKeyFor(category);
  if (!key) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[key]}
    </svg>
  );
}
