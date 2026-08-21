import { useEffect, useRef, useState } from 'react';
import { apiClient, API_BASE, subscribeBackendStatus } from '../integration/apiClient';
import { promos as fallbackPromos } from '../data/promotions';

const resolveImage = (url) =>
  url && url.startsWith('/uploads/') ? `${API_BASE}${url}` : url;

// Live promos from the admin panel (GET /api/promos), falling back to the
// bundled images in src/assets/promos/ while loading, when the backend is
// down, or when no active posters exist.
export function usePromos() {
  const [promos, setPromos] = useState(fallbackPromos);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    const refresh = async () => {
      const res = await apiClient.get('/api/promos');
      if (!aliveRef.current) return;
      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setPromos(
          res.data.map((p) => ({
            src: resolveImage(p.image_url),
            caption: p.caption || '',
          }))
        );
      }
      // Failure or an empty poster list: keep what we have
    };

    refresh();
    const unsubscribe = subscribeBackendStatus((online) => {
      if (online) refresh();
    });

    return () => {
      aliveRef.current = false;
      unsubscribe();
    };
  }, []);

  return promos;
}
