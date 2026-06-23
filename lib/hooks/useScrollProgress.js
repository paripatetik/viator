import { useCallback, useEffect, useRef, useState } from 'react';

export function useScrollProgress(targetRef) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);
  const progressRef = useRef(0);

  const calc = useCallback(() => {
    if (!targetRef.current) return;
    const artTop = targetRef.current.getBoundingClientRect().top + window.scrollY;
    const artHeight = targetRef.current.scrollHeight;
    const viewed = window.scrollY + window.innerHeight - artTop;
    const pct = Math.min(Math.max(viewed / artHeight, 0), 1);
    const nextProgress = Math.round(pct * 100);

    if (nextProgress !== progressRef.current) {
      progressRef.current = nextProgress;
      setProgress(nextProgress);
    }
  }, [targetRef]);

  useEffect(() => {
    const scheduleCalc = () => {
      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        calc();
      });
    };

    calc();
    window.addEventListener('scroll', scheduleCalc, { passive: true });
    window.addEventListener('resize', scheduleCalc);
    return () => {
      window.removeEventListener('scroll', scheduleCalc);
      window.removeEventListener('resize', scheduleCalc);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [calc]);

  return progress; // 0–100
}
