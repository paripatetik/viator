"use client";

import useHomeScrollRestoration from "@/lib/hooks/useScrollRestoration";

export default function AppProviders({ children }) {
  useHomeScrollRestoration();
  return children;
}
