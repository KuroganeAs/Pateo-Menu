import { useSyncExternalStore } from 'react';

function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches
  );
}

export function useViewport() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // For tablet landscape vs portrait (if height < width it's landscape)
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return {
    isMobile,
    isTablet,
    isTabletPortrait: isTablet && !isLandscape,
    isTabletLandscape: isTablet && isLandscape,
    isDesktop,
  };
}
