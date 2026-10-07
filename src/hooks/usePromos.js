import { useEffect, useRef, useState } from 'react';
import { fetchPromos, onReconnect } from '../integration/liveData';
import { promos as fallbackPromos } from '../data/promotions';

// How long the poster deck shows a loading skeleton before falling back to
// the bundled posters. The live posters still replace them when they arrive.
const FALLBACK_AFTER_MS = 3500;

// Live promos from the admin panel (Supabase). While they load, `isLoading`
// is true and the deck shows a skeleton; when offline, when loading fails or
// takes too long, or when no visible posters exist, the bundled images in
// src/assets/promos/ are shown instead.
export function usePromos() {
  const [state, setState] = useState({ promos: fallbackPromos, isLoading: true });
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    const stopWaiting = () => setState((s) => (s.isLoading ? { ...s, isLoading: false } : s));
    const fallbackTimer = setTimeout(stopWaiting, FALLBACK_AFTER_MS);

    const refresh = async () => {
      const res = await fetchPromos();
      if (!aliveRef.current) return;
      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setState({
          promos: res.data.map((p) => ({
            src: p.image_url,
            caption: p.caption || '',
          })),
          isLoading: false,
        });
        return;
      }
      // Failure or an empty poster list: keep what we have
      stopWaiting();
    };

    refresh();
    const unsubscribe = onReconnect(refresh);

    return () => {
      aliveRef.current = false;
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  return state;
}
