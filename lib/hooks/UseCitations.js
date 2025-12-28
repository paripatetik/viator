// lib/hooks/useCitations.js
import { useEffect } from "react";

export default function useCitations(ref, html) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    /* -------- locate the “Джерела” list -------- */
    const heading = Array.from(root.querySelectorAll("h2")).find((h) =>
      h.textContent.trim().toLowerCase().startsWith("джерела")
    );
    const list =
      heading && heading.nextElementSibling?.tagName === "OL"
        ? heading.nextElementSibling
        : null;
    if (!list) return;

    /* clear any previous run (if the hook fires again) */
    root.querySelectorAll("sup[data-cite]").forEach((n) => n.remove());

    /* cache refs + add ↑ backlinks */
    const refs = Array.from(list.children).map((li, i) => {
      li.id = `ref-${i + 1}`;
      if (!li.querySelector("a[data-back]")) {
        const back = document.createElement("a");
        back.href = `#cite-${i + 1}`;
        back.textContent = "↑";
        back.dataset.back = true;
        back.className = "ml-1 text-gray-400 hover:text-gray-700";
        li.appendChild(back);
      }
      return li.textContent.replace("↑", "").trim();
    });

    /* walk text nodes and swap “[n]” */
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n; (n = walker.nextNode()); ) nodes.push(n);

    nodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\[\d+])/);
      if (parts.length === 1) return;

      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        const m = part.match(/^\[(\d+)]$/);
        if (!m) return frag.appendChild(document.createTextNode(part));

        const idx = +m[1];
        const sup = document.createElement("sup");
        sup.dataset.cite = true;
        sup.id = `cite-${idx}`;
        sup.className = "relative mx-0.5 align-top select-none group";

        const link = document.createElement("a");
        link.href = `#ref-${idx}`;
        link.className =
          "inline-flex h-4 w-4 items-center justify-center rounded-sm bg-gray-800 text-[10px] font-bold text-white";
        link.textContent = idx;
        sup.appendChild(link);

        const tip = document.createElement("span");
        tip.className =
          "absolute left-1/2 top-full z-20 mt-1 hidden w-56 -translate-x-1/2 rounded border bg-white p-2 text-xs text-gray-800 shadow-lg group-hover:block group-focus:block";
        tip.textContent = refs[idx - 1] || "";
        sup.appendChild(tip);

        frag.appendChild(sup);
      });

      node.replaceWith(frag);
    });
  }, [ref, html]);          // ← run again whenever “html” updates
}