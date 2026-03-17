import { useSyncExternalStore } from 'react';

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 960,
  content: 1100
};

function subscribeToViewport(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('resize', callback);
  window.addEventListener('orientationchange', callback);

  return () => {
    window.removeEventListener('resize', callback);
    window.removeEventListener('orientationchange', callback);
  };
}

function getViewportWidth() {
  if (typeof window === 'undefined') {
    return BREAKPOINTS.content;
  }

  return window.innerWidth;
}

export function useViewportWidth() {
  return useSyncExternalStore(
    subscribeToViewport,
    getViewportWidth,
    () => BREAKPOINTS.content
  );
}

export function useResponsiveLayout() {
  const width = useViewportWidth();

  return {
    width,
    isMobile: width <= BREAKPOINTS.mobile,
    isTablet: width <= BREAKPOINTS.tablet,
    isCompact: width <= BREAKPOINTS.content
  };
}
