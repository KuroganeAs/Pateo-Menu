import { useEffect } from 'react';

// Subscribe to the menu feed's native scroll. Replaces the old Lenis
// instance-threading: any component can react to feed scrolling without
// the scroll container being its ancestor.
// `handler` receives the scroll container element; memoize it with
// useCallback so the listener isn't re-attached every render.
export function useFeedScroll(handler) {
  useEffect(() => {
    const container = document.getElementById('menu-scroll-container');
    if (!container) return;
    const onScroll = () => handler(container);
    onScroll(); // initialize state from the current position
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [handler]);
}
