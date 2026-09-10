import { useEffect, useState } from "react";

export function useScrollProgress(targetId) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(targetId);
    if (!article) return;

    let frame = 0;
    const calculate = () => {
      frame = 0;
      const top = article.getBoundingClientRect().top + window.scrollY;
      const viewed = window.scrollY + window.innerHeight - top;
      const fraction = article.scrollHeight > 0 ? viewed / article.scrollHeight : 0;
      setProgress(Math.round(Math.min(Math.max(fraction, 0), 1) * 100));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(calculate);
    };

    calculate();
    // Images and fonts can change article height after the initial render.
    const observer = new ResizeObserver(schedule);
    observer.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return progress;
}
