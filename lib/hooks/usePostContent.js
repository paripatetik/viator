import { useEffect, useState } from "react";

import { initPostContentDomHandlers } from "@/lib/hooks/postContentDom";
import { buildPostContent } from "@/lib/hooks/postContentTransform";

export function usePostContent(rawHtml = "") {
  const [html, setHtml] = useState("");
  const [toc, setToc] = useState([]);
  const [readingTime, setReadingTime] = useState("");

  useEffect(() => {
    if (!rawHtml) return;

    initPostContentDomHandlers();

    const nextContent = buildPostContent(rawHtml);
    setHtml(nextContent.html);
    setToc(nextContent.toc);
    setReadingTime(nextContent.readingTime);
  }, [rawHtml]);

  return { html, toc, readingTime };
}
