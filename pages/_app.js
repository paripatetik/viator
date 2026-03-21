import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import "@/styles/globals.css";

import useHomeScrollRestoration from "@/lib/hooks/useScrollRestoration";


function RouteDebug() {
  const router = useRouter();

  useEffect(() => {
    const handler = (err, url) =>
      console.error("routeChangeError →", url, "\n", err);
    router.events.on("routeChangeError", handler);
    return () => router.events.off("routeChangeError", handler);
  }, [router]);

  useEffect(() => {
  new PerformanceObserver((list) => {
    list.getEntries().forEach((e) => {
      console.log('shift:', e.value.toFixed(4),
        e.sources?.map(s => s.node?.id || s.node?.className?.toString().slice(0,50))
      );
    });
  }).observe({ type: 'layout-shift', buffered: true });
}, []);

  return null;
}

export default function App({ Component, pageProps }) {
  useHomeScrollRestoration();

  useEffect(() => {
    const d = window.__scrollDebug;
    console.log('[scroll] Y at inline script:', d?.scrollYAtScript);
    console.log('[scroll] Y at hydration:', window.scrollY);

    const start = performance.now();
    const poll = () => {
      if (performance.now() - start < 2000) {
        if (window.scrollY !== 0) {
          console.warn('[scroll] Y changed AFTER hydration:', window.scrollY, 'at', performance.now() - start, 'ms');
        }
        requestAnimationFrame(poll);
      }
    };
    requestAnimationFrame(poll);
  }, []);

  return (
    <Layout>
      <RouteDebug />
      <Component {...pageProps} />
    </Layout>
  );
}