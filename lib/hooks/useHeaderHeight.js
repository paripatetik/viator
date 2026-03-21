import { useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Read --header-h CSS variable as pixels (fallback: 64) */
function readCssHeaderH() {
  if (typeof window === 'undefined') return 64;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--header-h')
    .trim(); // "4rem" or "80px"
  if (raw.endsWith('rem')) return parseFloat(raw) * 16;
  if (raw.endsWith('px'))  return parseFloat(raw);
  return 64;
}

export function useHeaderHeight(selector = '#site-header', extraOffset = 16) {
  // Initialise from CSS variable — correct on first paint, no flash
  const [headerH, setHeaderH] = useState(readCssHeaderH);

 useIsomorphicLayoutEffect(() => {
  const el = document.querySelector(selector);
  const handler = () => {
    const h = el?.offsetHeight ?? readCssHeaderH();
    console.log('[header] measured offsetHeight:', h, 'css var was:', readCssHeaderH());
    setHeaderH(h);
    document.documentElement.style.setProperty('--header-offset', `${h + extraOffset}px`);
  };
  handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [selector, extraOffset]);

  return headerH;
}