"use client";

import { useEffect } from "react";
import { initPostContentDomHandlers } from "@/lib/postContent/dom";
import { ArticleProgressCircle } from "./ProgressCircle";

export function PostInteractions({ articleId }) {
  useEffect(() => initPostContentDomHandlers(), [articleId]);

  return <ArticleProgressCircle targetId={articleId} />;
}
