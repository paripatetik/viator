import { useCallback, useEffect, useState } from 'react';

export function useScrollProgress(targetRef) {
  const [progress, setProgress] = useState(0);

  const calc = useCallback(() => {
    if (!targetRef.current) return;
    const artTop = targetRef.current.getBoundingClientRect().top + window.scrollY;
    const artHeight = targetRef.current.scrollHeight;
    const viewed = window.scrollY + window.innerHeight - artTop;
    const pct = Math.min(Math.max(viewed / artHeight, 0), 1);
    setProgress(Math.round(pct * 100));
  }, [targetRef]);

  useEffect(() => {
    calc();
    window.addEventListener('scroll', calc);
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('scroll', calc);
      window.removeEventListener('resize', calc);
    };
  }, [calc]);

  return progress; // 0–100
}