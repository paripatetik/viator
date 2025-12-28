import { useEffect, useState } from 'react';

export function useHeaderHeight(selector = '#site-header', extraOffset = 16) {
  const [headerH, setHeaderH] = useState(0);
  useEffect(() => {
    const el = document.querySelector(selector);
    const handler = () => {
      const h = el?.offsetHeight ?? 0;
      setHeaderH(h);
      // expose a css var used by scroll-margin + hero slices
      document.documentElement.style.setProperty('--header-offset', `${h + extraOffset}px`);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [selector, extraOffset]);
  return headerH;
}