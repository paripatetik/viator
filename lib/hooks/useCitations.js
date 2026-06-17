// lib/hooks/useCitations.js
import { useEffect } from "react";

/**
 * What this hook does:
 * - Finds the "Джерела" list (OL/UL) after the heading (not only nextElementSibling).
 * - Converts [N] and [N, ...] into <sup> links.
 * - Works even when WP splits the bracketed citation across multiple text nodes.
 * - Tooltip shows: Work title + locator (no URL).
 * - Backlink ↑ in Sources jumps to the last clicked citation for that source.
 */

// includes: nbsp, narrow nbsp, thin space, hair space, figure space, word joiner, zero-width space
const WEIRD_SPACES_RE = /[\u00A0\u202F\u2009\u200A\u2007\u2060\u200B]/g;

function normalizeForMatching(s = "") {
  // IMPORTANT: keep string length identical (good for regex indices slicing)
  return String(s).replace(WEIRD_SPACES_RE, " ");
}

function normalizeSpaces(s = "") {
  return normalizeForMatching(s).replace(/\s+/g, " ").trim();
}

function extractWorkTitle(li) {
  const el = li.querySelector?.("cite, em, i");
  if (el?.textContent?.trim()) return el.textContent.trim();

  const clone = li.cloneNode(true);

  // remove our backlink
  clone.querySelectorAll?.("a[data-back]").forEach((a) => a.remove());

  // strip links (keep visible text only)
  clone.querySelectorAll?.("a").forEach((a) => {
    a.replaceWith(document.createTextNode(a.textContent || ""));
  });

  let t = normalizeSpaces(clone.textContent || "");
  t = normalizeSpaces(t.replace(/https?:\/\/\S+/gi, ""));

  // heuristic: if "Author — Title", keep right part
  if (t.includes("—")) {
    const parts = t
      .split("—")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) t = parts[parts.length - 1];
  }

  if (t.length > 140) t = t.slice(0, 140).trim() + "…";
  return t;
}

function findSourcesList(root) {
  // "Джерела" may be h2..h6, sometimes even a paragraph/strong
  const candidates = Array.from(
    root.querySelectorAll("h2,h3,h4,h5,h6,p,strong")
  );

  const heading = candidates.find((el) => {
    const text = (el.textContent || "").trim().toLowerCase();
    return text.startsWith("джерела") || text.startsWith("використані джерела");
  });

  if (!heading) return { heading: null, list: null };

  // Walk forward in DOM order and find first OL/UL after heading
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let passed = false;

  for (let n = walker.currentNode; (n = walker.nextNode()); ) {
    if (n === heading) {
      passed = true;
      continue;
    }
    if (!passed) continue;

    if (n.tagName === "OL" || n.tagName === "UL") return { heading, list: n };

    const inner = n.querySelector?.("ol, ul");
    if (inner) return { heading, list: inner };
  }

  return { heading, list: null };
}

function collectTextNodes(root, list, heading, { requireBracket = true } = {}) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const raw = node.nodeValue || "";
        const text = requireBracket ? normalizeForMatching(raw) : raw;

        if (requireBracket && !text.includes("[")) return NodeFilter.FILTER_REJECT;

        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;

        // don't touch already-created citations
        if (p.closest("sup[data-cite]")) return NodeFilter.FILTER_REJECT;

        // don't touch the Sources section itself
        if (list && p.closest("ol, ul") === list) return NodeFilter.FILTER_REJECT;
        if (heading && p.closest("h2,h3,h4,h5,h6,p,strong") === heading)
          return NodeFilter.FILTER_REJECT;

        // don't touch code-ish areas
        if (p.closest("pre, code, script, style")) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodes = [];
  for (let n; (n = walker.nextNode()); ) nodes.push(n);
  return nodes;
}

/**
 * Robust parser:
 * - takes anything inside brackets, finds the first number N
 * - everything after it (after optional separators) is locator
 * Works regardless of weird spaces, commas, semicolons, etc.
 */
function parseBracketContent(content) {
  const raw = normalizeForMatching(content || "");
  const m = raw.match(/^\s*(\d+)\s*([\s\S]*)\s*$/);
  if (!m) return null;

  const idx = Number(m[1]);
  let rest = (m[2] || "").trim();

  // remove first separator if present
  rest = rest.replace(/^([,;:\-—–])\s*/, "");

  const locator = normalizeSpaces(rest);
  return { idx, locator };
}

export default function useCitations(ref, html) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // prevent double-processing on same DOM snapshot


    const { heading, list } = findSourcesList(root);
    if (!list) return;

    const items = Array.from(list.children).filter((el) => el?.tagName === "LI");
    if (!items.length) return;

    // Prep sources list
    const titles = items.map((li, i) => {
      const idx = i + 1;
      li.id = `ref-${idx}`;
      li.style.scrollMarginTop = "var(--header-offset, 88px)";

      let back = li.querySelector("a[data-back]");
      if (!back) {
        back = document.createElement("a");
        back.dataset.back = "true";
        back.textContent = "↑";
        back.className = "ml-1 text-gray-400 hover:text-gray-700";
        li.appendChild(back);
      }

      // will be updated later to first occurrence
      back.href = `#cite-${idx}`;

      return extractWorkTitle(li);
    });

    // unique ids per occurrence
    const occ = new Map(); // idx -> count
    const firstCiteId = new Map(); // idx -> first cite id we created

    function makeSup(idx, locator, citeId) {
      const sup = document.createElement("sup");
      sup.dataset.cite = "true";
      sup.id = citeId;
      sup.className = "relative mx-0.5 align-top select-none group";
      sup.style.scrollMarginTop = "var(--header-offset, 88px)";

      const a = document.createElement("a");
      a.href = `#ref-${idx}`;
      a.className =
        "inline-flex h-5 w-5 items-center justify-center rounded-sm bg-gray-800 text-[11px] font-bold text-white";
      a.textContent = String(idx);
      a.dataset.ref = String(idx);
      a.dataset.citeid = citeId;
      sup.appendChild(a);

      const tip = document.createElement("span");
      tip.className =
        "absolute left-1/2 top-full z-20 mt-1 hidden w-64 -translate-x-1/2 rounded border bg-white p-2 text-xs text-gray-800 shadow-lg " +
        "group-hover:block group-focus-within:block";

      const title = titles[idx - 1] || "";
      tip.textContent = locator ? `${title}, ${locator}` : title;
      sup.appendChild(tip);

      return sup;
    }

    function addCitation(idx, locator) {
      const c = (occ.get(idx) || 0) + 1;
      occ.set(idx, c);

      const citeId = c === 1 ? `cite-${idx}` : `cite-${idx}-${c}`;
      if (!firstCiteId.has(idx)) firstCiteId.set(idx, citeId);

      return makeSup(idx, locator, citeId);
    }

    // 1) Inline replace (single text node)
    // match ANY [ ... ] where the start is a number; locator parsing is delegated to parseBracketContent
    const INLINE_RE = /\[\s*(\d+)([\s\S]*?)\]/g;

    const inlineNodes = collectTextNodes(root, list, heading, { requireBracket: true });

    inlineNodes.forEach((node) => {
      const raw = node.nodeValue || "";
      const matchText = normalizeForMatching(raw);

      if (!INLINE_RE.test(matchText)) return;
      INLINE_RE.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      let m;

      while ((m = INLINE_RE.exec(matchText))) {
        const before = raw.slice(last, m.index);
        if (before) frag.appendChild(document.createTextNode(before));

        // Rebuild bracket-inner content for robust parse
        const parsed = parseBracketContent((m[1] || "") + (m[2] || ""));

        if (
          parsed &&
          Number.isFinite(parsed.idx) &&
          parsed.idx >= 1 &&
          parsed.idx <= items.length
        ) {
          frag.appendChild(addCitation(parsed.idx, parsed.locator));
        } else {
          // keep original slice from RAW (not normalized)
          frag.appendChild(document.createTextNode(raw.slice(m.index, INLINE_RE.lastIndex)));
        }

        last = INLINE_RE.lastIndex;
      }

      const after = raw.slice(last);
      if (after) frag.appendChild(document.createTextNode(after));

      node.replaceWith(frag);
    });

    // 2) Glue replace (brackets split across text nodes)
    let changed = true;
    while (changed) {
      changed = false;

      const nodes = collectTextNodes(root, list, heading, { requireBracket: false });

      for (let i = 0; i < nodes.length; i++) {
        const n0 = nodes[i];
        const t0 = n0.nodeValue || "";

        const openPos = t0.indexOf("[");
        if (openPos === -1) continue;

        // if ']' is in same node, inline pass should have handled it
        const closeSame = t0.indexOf("]", openPos);
        if (closeSame !== -1) continue;

        let endNode = null;
        let endOffset = -1;

        let acc = t0.slice(openPos); // starts with '['

        for (let j = i + 1; j < nodes.length; j++) {
          const tj = nodes[j].nodeValue || "";
          const k = tj.indexOf("]");

          if (k !== -1) {
            endNode = nodes[j];
            endOffset = k;
            acc += tj.slice(0, k + 1); // include ']'
            break;
          }

          acc += tj;

          // safety: stop if it runs away
          if (acc.length > 400) break;
        }

        if (!endNode) continue;

        const inside = acc.slice(1, -1);
        const parsed = parseBracketContent(inside);
        if (!parsed) continue;

        const { idx, locator } = parsed;
        if (!Number.isFinite(idx) || idx < 1 || idx > items.length) continue;

        const sup = addCitation(idx, locator);

        const range = document.createRange();
        range.setStart(n0, openPos);
        range.setEnd(endNode, endOffset + 1);
        range.deleteContents();
        range.insertNode(sup);

        changed = true;
        break; // DOM changed -> restart scan
      }
    }

    // Default ↑ goes to first cite occurrence (until user clicks a later one)
    items.forEach((li, i) => {
      const idx = i + 1;
      const back = li.querySelector("a[data-back]");
      const first = firstCiteId.get(idx) || `cite-${idx}`;
      if (back) back.href = `#${first}`;
    });

    // Update ↑ to jump to the last-clicked citation for that source
    const onClick = (e) => {
      const target = e.target instanceof Element ? e.target : e.target?.parentElement;
      const a = target?.closest?.("sup[data-cite] > a");
      if (!a) return;

      const idx = Number(a.dataset.ref || a.textContent);
      const citeId = a.dataset.citeid || a.closest("sup")?.id;
      if (!idx || !citeId) return;

      const li = root.querySelector(`#ref-${idx}`);
      const back = li?.querySelector("a[data-back]");
      if (back) back.href = `#${citeId}`;
    };

    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [ref, html]);
}
