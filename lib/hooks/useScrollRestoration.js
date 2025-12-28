import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * Saves scroll {x,y} when you leave `/` and restores it when you return.
 * Nothing else is affected.
 */
export default function useHomeScrollRestoration() {
  const router = useRouter();
  const shouldRestore = useRef(false);

  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    history.scrollRestoration = 'manual';

    const key = 'home-scroll-pos';

    /* save when navigating AWAY from / */
    const handleStart = (url) => {
      if (router.pathname === '/') {
        sessionStorage.setItem(
          key,
          JSON.stringify({ x: scrollX, y: scrollY })
        );
      }
    };

    /* restore when navigating TO / */
    const handleComplete = (url) => {
      if (url === '/') {
        const pos = JSON.parse(sessionStorage.getItem(key) || 'null');
        if (pos) window.scrollTo(pos.x, pos.y);
      }
    };

    /* popstate (back/forward) */
    router.beforePopState(({ url }) => {
      shouldRestore.current = url === '/'; // only restore if landing on /
      return true;
    });

    const maybeRestore = (url) => {
      if (shouldRestore.current && url === '/') {
        handleComplete('/');
        shouldRestore.current = false;
      }
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', maybeRestore);
    router.events.on('routeChangeError', maybeRestore);

    return () => {
  history.scrollRestoration = 'auto';   // ← put native SR back
  router.events.off('routeChangeStart', handleStart);
  router.events.off('routeChangeComplete', maybeRestore);
  router.events.off('routeChangeError',  maybeRestore);
  router.beforePopState(() => true);
};
  }, [router]);
}
