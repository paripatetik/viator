"use client";

import { useEffect } from "react";
import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";
import { clearArticleNavigation, scrollToArticleTarget } from "@/lib/postContent/navigation";
import { TocCard } from "./TocCard";

export function PostTableOfContents({ toc }) {
  useHeaderHeight();
  useEffect(() => clearArticleNavigation, []);

  const scrollToHeading = (id) => {
    const target = document.getElementById(id);
    if (target) scrollToArticleTarget(target);
  };

  return <TocCard toc={toc} onSelect={scrollToHeading} />;
}
