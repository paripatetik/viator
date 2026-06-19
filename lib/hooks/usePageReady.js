"use client";

import { useEffect, useState } from "react";

export default function usePageReady(delayMs = 180) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let delayId = 0;
    let fontTimeoutId = 0;
    let frameOne = 0;
    let frameTwo = 0;

    const waitForFonts = () => {
      if (!document.fonts?.ready) return Promise.resolve();

      return Promise.race([
        document.fonts.ready.catch(() => undefined),
        new Promise((resolve) => {
          fontTimeoutId = window.setTimeout(resolve, 900);
        }),
      ]);
    };

    const finishAfterLayoutSettles = () => {
      waitForFonts().then(() => {
        if (!active) return;

        frameOne = window.requestAnimationFrame(() => {
          frameTwo = window.requestAnimationFrame(() => {
            delayId = window.setTimeout(() => {
              if (active) setReady(true);
            }, delayMs);
          });
        });
      });
    };

    if (document.readyState === "complete") {
      finishAfterLayoutSettles();
    } else {
      window.addEventListener("load", finishAfterLayoutSettles, { once: true });
    }

    return () => {
      active = false;
      window.removeEventListener("load", finishAfterLayoutSettles);
      window.clearTimeout(delayId);
      window.clearTimeout(fontTimeoutId);
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);
    };
  }, [delayMs]);

  return ready;
}
