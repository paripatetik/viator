import { Html, Head, Main, NextScript } from "next/document";
 
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent browser from restoring scroll position on reload.
                // This runs synchronously before any rendering — eliminates
                // the 1-frame flash where scrollY > 0 causes header/banner shift.
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                // On reload: force scroll to top immediately.
                // On back/forward navigation: Next.js router handles scroll.
                try {
                  var nav = performance.getEntriesByType('navigation')[0];
                  if (nav && (nav.type === 'reload' || nav.type === 'navigate')) {
                    window.scrollTo(0, 0);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
 