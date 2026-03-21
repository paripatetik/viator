import { Html, Head, Main, NextScript } from "next/document";
 
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        {/*
          Runs synchronously before React hydrates.
          Prevents the browser from restoring scroll position before Next.js
          is ready — this is what causes the isSticky flash in the header.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration = 'manual';`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
 <script
  dangerouslySetInnerHTML={{
    __html: `
      history.scrollRestoration = 'manual';
      window.__scrollDebug = {
        scrollYAtScript: window.scrollY,
        timestamp: performance.now()
      };
    `,
  }}
/>