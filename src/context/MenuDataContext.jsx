import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchMenu, onReconnect } from '../integration/liveData';
import { adaptMenu } from '../integration/adaptMenu';
import { categories as localCategories, menuItems as localItems } from '../data/menu';

// How long the menu shows loading skeletons before falling back to the
// bundled copy. The live menu still replaces it whenever it arrives.
const FALLBACK_AFTER_MS = 3500;

// Serves the menu to the whole app. While the admin-edited menu loads from
// Supabase, `isLoading` is true and the screens show skeletons. If it fails,
// or takes too long, the bundled data (works offline) is shown instead.
// Re-fetches whenever the browser comes back online.
const MenuDataContext = createContext({
  categories: localCategories,
  menuItems: localItems,
  isLive: false,
  isLoading: false,
});

export function MenuDataProvider({ children }) {
  const [data, setData] = useState({
    categories: localCategories,
    menuItems: localItems,
    isLive: false,
    isLoading: true,
  });
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    const stopWaiting = () => setData((d) => (d.isLoading ? { ...d, isLoading: false } : d));
    const fallbackTimer = setTimeout(stopWaiting, FALLBACK_AFTER_MS);

    const refresh = async () => {
      const res = await fetchMenu();
      if (!aliveRef.current) return;
      if (res.ok && res.data?.categories?.length) {
        const adapted = adaptMenu(res.data);
        // A live menu with zero visible items would blank the site; keep the
        // bundled data in that case rather than rendering nothing.
        if (adapted.menuItems.length > 0) {
          setData({ ...adapted, isLive: true, isLoading: false });
          return;
        }
      }
      // On failure: keep whatever we have (live data from a previous fetch,
      // or the bundled fallback) — never regress to an empty state.
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

  return <MenuDataContext.Provider value={data}>{children}</MenuDataContext.Provider>;
}

export function useMenuData() {
  return useContext(MenuDataContext);
}
