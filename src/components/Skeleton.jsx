import React from 'react';
import { cn } from '../lib/cn';

// Placeholder block shown while something loads: the page's tint colour with
// a soft band of light sweeping across it (no sweep under reduced motion).
export default function Skeleton({ className, style }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-lg', className)} style={style} />;
}
