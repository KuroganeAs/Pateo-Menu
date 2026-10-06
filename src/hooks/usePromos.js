import { useEffect, useRef, useState } from 'react';
import { fetchPromos, onReconnect } from '../integration/liveData';
import { promos as fallbackPromos } from '../data/promotions';

// Live promos from the admin panel (Supabase), falling back to the bundled
// images in src/assets/promos/ while loading, when offline, or when no
// visible posters exist.
export function usePromos() {
  const [promos, setPromos] = useState(fallbackPromos);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    const refresh = async () => {
      const res = await fetchPromos();
      if (!aliveRef.current) return;
      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setPromos(
          res.data.map((p) => ({
            src: p.image_url,
            caption: p.caption || '',
          }))
        );
      }
      // Failure or an empty poster list: keep what we have
    };

    refresh();
    const unsubscribe = onReconnect(refresh);

    return () => {
      aliveRef.current = false;
      unsubscribe();
    };
  }, []);

  return promos;
}
