import { cleanSpaces, escapeHtml } from "@/lib/hooks/postContentText";

const REF_HEADING_PREFIXES = [
  "використані джерела",
  "джерела",
  "посилання",
  "key scientific references",
  "references",
  "bibliography",
];

const extractYear = (refText = "") => {
  const t = cleanSpaces(refText);
  const m = t.match(/\(([^)]*?\b(19\d{2}|20\d{2})([a-z])?\b[^)]*?)\)/i);
  if (m?.[2]) return `${m[2]}${m[3] || ""}`;

  const m2 = t.match(/\b(19\d{2}|20\d{2})([a-z])?\b/i);
  return m2 ? `${m2[1]}${m2[2] || ""}` : "";
};

const extractAuthorShort = (refText = "") => {
  const t = cleanSpaces(refText);
  const beforeParen = t.includes("(") ? t.split("(")[0].trim() : "";
  const beforeDotSpace = t.split(". ")[0].trim();
  const authorsBlock = beforeParen || beforeDotSpace || t;

  const normalizeSurname = (s = "") =>
    String(s)
      .trim()
      .replace(/^(?:&|and|і)\s+/i, "")
      .trim();

  const surnameMatches = [
    ...authorsBlock.matchAll(/([^,\d][^,]*?),\s*[A-ZА-ЯЇІЄҐ]/g),
  ];

  let surnames = surnameMatches
    .map((mm) => normalizeSurname(mm[1]))
    .filter(Boolean);

  if (!surnames.length) {
    const first = normalizeSurname(
      authorsBlock.split(/,|&| and | і /i)[0]?.trim()
    );
    if (first) surnames = [first];
  }

  if (!surnames.length) return "";
  if (surnames.length === 1) return surnames[0];
  if (surnames.length === 2) return `${surnames[0]} & ${surnames[1]}`;
  return `${surnames[0]} et al.`;
};

const pickWorkTitleFromText = (refText = "", year = "") => {
  const t = cleanSpaces(refText);

  if (year) {
    const yrEsc = year.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\(${yrEsc}\\)\\.\\s*([^\\.]+)\\.`, "i");
    const m = t.match(re);
    if (m?.[1]) return m[1].trim();
  }

  const initialRe = /^[A-ZА-ЯЇІЄҐ]\.\s*/;
  let start = 0;
  let cut = -1;

  while (true) {
    const pos = t.indexOf(". ", start);
    if (pos === -1) break;

    const after = t.slice(pos + 2).trimStart();
    if (initialRe.test(after)) {
      start = pos + 2;
      continue;
    }

    cut = pos + 2;
    break;
  }

  if (cut !== -1) {
    const rest = t.slice(cut).trim();
    const end = rest.indexOf(".");
    if (end !== -1) return rest.slice(0, end).trim();
    return rest.trim();
  }

  return "";
};

const normalizeLocator = (locRaw = "") => {
  let loc = cleanSpaces(locRaw);
  if (!loc) return "";

  loc = loc.replace(/^[,;:.\s]+/, "");

  if (/^\d+([–—-]\d+)?$/.test(loc)) return `p. ${loc}`;

  const m = loc.match(/^(pp?|p|c|с)\.?\s*(.+)$/i);
  if (m?.[1] && m?.[2]) {
    const prefix = m[1].toLowerCase();
    return `${prefix}. ${m[2].trim()}`;
  }

  if (/\d/.test(loc)) return `p. ${loc}`;
  return "";
};

const buildTooltipText = (refMeta, locatorRaw = "") => {
  const author = refMeta?.author || "";
  const title = refMeta?.title || "";
  const year = refMeta?.year || "";
  const page = normalizeLocator(locatorRaw);
  const parts = [];

  if (author) parts.push(author);
  if (title) parts.push(title);
  if (year) parts.push(year);
  if (page) parts.push(page);

  return parts.join(" · ");
};

const findRefsHeading = (doc) => {
  const all = Array.from(doc.querySelectorAll("h2, h3, h4, h5, h6"));

  return all
    .slice()
    .reverse()
    .find((h) =>
      REF_HEADING_PREFIXES.some((n) =>
        (h.textContent || "").trim().toLowerCase().startsWith(n)
      )
    );
};

const findRefsList = (heading) => {
  const sibling = heading?.nextElementSibling;
  if (sibling && ["OL", "UL"].includes(sibling.tagName)) return sibling;

  return (
    heading?.parentElement?.querySelector(":scope > ol, :scope > ul") ||
    heading?.parentElement?.querySelector(":scope ~ ol, :scope ~ ul") ||
    null
  );
};

const buildRefsMeta = (items) =>
  items.map((li, i) => {
    li.id = `ref-${i + 1}`;
    li.style.scrollMarginTop = "80px";

    const rawText = cleanSpaces(li.textContent || "");
    const year = extractYear(rawText);
    const author = extractAuthorShort(rawText);
    const titleFromText = pickWorkTitleFromText(rawText, year);
    const citeTitle = li.querySelector?.("cite")?.textContent?.trim() || "";
    const italicFallback =
      li.querySelector?.("em, i")?.textContent?.trim() || "";
    const title = titleFromText || citeTitle || italicFallback || "";

    return { rawText, author, title, year };
  });

const renderCitation = (_match, refs, num, loc = "", space = "", punct = "") => {
  const idx = Number(num);
  const refMeta = refs[idx - 1];
  if (!refMeta) return _match;

  const tipText = buildTooltipText(refMeta, loc);
  const tip = escapeHtml(tipText).replace(/"/g, "&quot;");
  const trailing = punct || space || " ";

  return `<sup id="cite-${idx}" data-cite="1" class="viator-cite" data-tip="${tip}"
                     style="scroll-margin-top:var(--header-offset, 88px)">
          <a href="#ref-${idx}"
             onclick="return window.__viatorGoToRef(${idx})"
             class="viator-cite-badge">${idx}</a>
        </sup>${trailing}`;
};

const styleRefsList = (listEl) => {
  const items = Array.from(listEl.children);

  listEl.className = "space-y-4 my-6 pl-0";
  listEl.style.listStyle = "none";

  items.forEach((li, i) => {
    const idx = i + 1;
    li.id = `ref-${idx}`;
    li.style.scrollMarginTop = "80px";

    const firstLink = li.querySelector("a[href]");
    const href = firstLink?.getAttribute("href") || null;

    const clone = li.cloneNode(true);
    clone.querySelectorAll("a[href]").forEach((a) => a.remove());
    let citationHTMLInner = clone.innerHTML.trim();

    citationHTMLInner = citationHTMLInner.replace(
      /^([^<(]+?)\s*\((\d{4}[a-z]?)([^)]*)\)/i,
      (_m, a, y, rest) => `<strong>${a.trim()}</strong> (${y}${rest})`
    );

    const btnHTML = href
      ? `<div class="mt-3">
                   <a href="${href}" target="_blank" rel="noopener"
                      class="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold
                             rounded-md border border-slate-300 bg-white
                             transition-[box-shadow,transform] hover:shadow-lg hover:-translate-y-0.5">
                     <span>Посилання</span>
                     <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" class="opacity-80">
                       <path fill="currentColor"
                         d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/>
                     </svg>
                   </a>
                 </div>`
      : "";

    li.innerHTML = `
              <div class="rounded-2xl mt-5 bg-slate-50 ring-1 ring-slate-300 p-4 sm:p-5
                          transition-[box-shadow,transform] hover:shadow-2xl hover:-translate-y-0.5">
                <div class="flex items-start gap-3">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full
                               text-[12px] font-bold bg-slate-300 text-slate-800 select-none">
                    ${idx}
                  </span>
                  <div class="flex-1 text-[15px] sm:text-[16px] leading-relaxed">
                    ${citationHTMLInner}
                    ${btnHTML}
                  </div>
                </div>
              </div>
            `;

    li.querySelectorAll("a[href]").forEach((a) => {
      a.classList.add(
        "transition-[box-shadow,transform]",
        "hover:shadow-lg",
        "hover:-translate-y-0.5",
        "inline-block"
      );
    });
  });
};

export function applyCitationTransforms(doc) {
  let heading = findRefsHeading(doc);
  if (!heading) return;

  const listForRefs = findRefsList(heading);
  const tempItems = listForRefs ? Array.from(listForRefs.children) : [];
  const refs = buildRefsMeta(tempItems);

  doc.body.innerHTML = doc.body.innerHTML.replace(
    /\[\s*(\d+)\s*(?:[,，;:]\s*([^\]]+?))?\s*](\s*)([.,;:!?…»”")\]])?/g,
    (_all, n, loc, space, punct) =>
      renderCitation("", refs, n, loc || "", space || "", punct || "")
  );

  heading = findRefsHeading(doc);
  if (!heading) return;

  const listEl = findRefsList(heading);
  if (listEl) styleRefsList(listEl);
}
