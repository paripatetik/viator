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

  return null;
}

export default function App({ Component, pageProps }) {
  useHomeScrollRestoration();
  return (
    <Layout>
      <RouteDebug />
      <Component {...pageProps} />
    </Layout>
  );
}