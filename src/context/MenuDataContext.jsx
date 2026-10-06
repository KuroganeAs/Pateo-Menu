import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchMenu, onReconnect } from '../integration/liveData';
import { adaptMenu } from '../integration/adaptMenu';
import { categories as localCategories, menuItems as localItems } from '../data/menu';

// Serves the menu to the whole app: starts from the bundled data (instant,
// works offline) and swaps in the admin-edited menu from Supabase once it
// responds. Re-fetches whenever the browser comes back online.
const MenuDataContext = createContext({
  categories: localCategories,
  menuItems: localItems,
  isLive: false,
});

export function MenuDataProvider({ children }) {
  const [data, setData] = useState({
    categories: localCategories,
    menuItems: localItems,
    isLive: false,
  });
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    const refresh = async () => {
      const res = await fetchMenu();
      if (!aliveRef.current) return;
      if (res.ok && res.data?.categories?.length) {
        const adapted = adaptMenu(res.data);
        // A live menu with zero visible items would blank the site; keep the
        // bundled data in that case rather than rendering nothing.
        if (adapted.menuItems.length > 0) {
          setData({ ...adapted, isLive: true });
        }
      }
      // On failure: keep whatever we have (live data from a previous fetch,
      // or the bundled fallback) — never regress to an empty state.
    };

    refresh();
    const unsubscribe = onReconnect(refresh);

    return () => {
      aliveRef.current = false;
      unsubscribe();
    };
  }, []);

  return <MenuDataContext.Provider value={data}>{children}</MenuDataContext.Provider>;
}

export function useMenuData() {
  return useContext(MenuDataContext);
}
