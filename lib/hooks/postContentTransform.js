import { playfair } from "@/lib/fonts";
import { applyCitationTransforms } from "@/lib/hooks/postContentCitations";
import { injectPostContentStyles } from "@/lib/hooks/postContentStyles";
import { slugify } from "@/lib/hooks/postContentText";

const extractReadingTime = (doc) => {
  const rt = doc.querySelector(".rt-reading-time");
  if (!rt) return "";

  const readingTime = rt.textContent.trim();
  rt.remove();
  return readingTime;
};

const enhanceHeadings = (doc) => {
  const h2s = Array.from(doc.querySelectorAll("h2"));

  const toc = h2s.map((h) => {
    const id = slugify(h.textContent);
    h.id = id;

    h.style.position = "relative";
    h.style.scrollMarginTop = "var(--header-offset, 88px)";
    h.style.display = "block";
    h.style.textAlign = "center";
    h.style.fontWeight = "600";

    h.classList.add(playfair.className);
    h.classList.add("viator-ribbon");

    return { id, text: h.textContent };
  });

  h2s.forEach((h) => {
    let next = h.nextElementSibling;
    while (next && next.tagName !== "P" && next.tagName !== "H2") {
      next = next.nextElementSibling;
    }
    if (next?.tagName === "P" && next.textContent.trim().length > 0) {
      next.classList.add("viator-section-dropcap");
    }
  });

  return toc;
};

const enhanceBlockquotes = (doc) => {
  Array.from(doc.querySelectorAll("blockquote")).forEach((b) => {
    b.classList.add("viator-quote");
    b.classList.add(playfair.className);

    const cite = b.querySelector("cite");
    if (cite) cite.classList.add("viator-quote-cite");
  });
};

const wrapLooseImages = (doc) => {
  Array.from(doc.querySelectorAll("img")).forEach((img) => {
    if (img.closest("figure")) return;

    const figure = doc.createElement("figure");
    figure.classList.add("viator-figure");

    const parent = img.parentNode;
    if (!parent) return;

    parent.insertBefore(figure, img);
    figure.appendChild(img);
  });
};

const enhanceFigures = (doc) => {
  wrapLooseImages(doc);

  Array.from(doc.querySelectorAll("figure")).forEach((figure) => {
    if (!figure.querySelector("img")) return;

    figure.classList.add("viator-figure");

    let caption = figure.querySelector("figcaption");
    const img = figure.querySelector("img");
    const wpFigureWidth = figure.style.width?.trim();
    const wpImageWidth = img?.style.width?.trim();
    const imgAttrWidth = Number.parseInt(img?.getAttribute("width") || "", 10);
    const frameWidth =
      wpFigureWidth ||
      wpImageWidth ||
      (Number.isFinite(imgAttrWidth) && imgAttrWidth > 0
        ? `${imgAttrWidth}px`
        : "");

    if (frameWidth && frameWidth !== "auto") {
      figure.dataset.viatorImgWidth = frameWidth;
      figure.style.setProperty("--viator-img-width", frameWidth);
    }

    const alt = img?.getAttribute("alt")?.trim();
    if (!caption && alt) {
      caption = doc.createElement("figcaption");
      caption.textContent = alt;
      figure.appendChild(caption);
    }

    if (caption) {
      caption.classList.add("viator-caption");
      caption.innerHTML = caption.innerHTML.trim();
      caption.querySelectorAll("a[href]").forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });
    }
  });

  Array.from(doc.querySelectorAll("figure.viator-figure img")).forEach((img) => {
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
  });
};

const transformCardLists = (doc) => {
  const allLists = Array.from(doc.querySelectorAll("ul, ol"));

  allLists.forEach((ul) => {
    const lis = Array.from(ul.children);
    if (!lis.length) return;

    const hasCardFlag = lis.some((li) => li.classList?.contains("card-list"));
    if (!hasCardFlag) return;

    ul.classList.add(
      "grid",
      "gap-2",
      "my-6",
      "pl-0",
      "list-none",
      "md:grid-cols-2"
    );

    const removeFollowingSep = (node) => {
      let next = node?.nextSibling;
      while (
        next &&
        next.nodeType === 3 &&
        /^[\s:–—-]+$/.test(next.textContent)
      ) {
        const rm = next;
        next = next.nextSibling;
        rm.remove();
      }
      if (next && next.nodeType === 1 && next.nodeName === "BR") next.remove();
    };

    lis.forEach((li, idx) => {
      let svg = li.querySelector("svg");
      const hasIcon = !!svg;
      if (svg) {
        svg.setAttribute("width", svg.getAttribute("width") || "24");
        svg.setAttribute("height", svg.getAttribute("height") || "24");
        svg.classList.add("opacity-90");
      }
      const iconHTML = hasIcon ? svg.outerHTML : "";
      if (svg) svg.remove();

      const left = hasIcon
        ? `<div class="shrink-0 mt-0.5 text-viator-deep">${iconHTML}</div>`
        : `<div class="shrink-0">
               <div class="inline-flex text-base h-7 w-7 items-center justify-center rounded-lg
                           border border-viator-sky bg-viator-soft-blue text-viator-dark font-bold">
                 ${idx + 1}
               </div>
             </div>`;

      const spanTitle = li.querySelector("span");
      const title = spanTitle ? spanTitle.textContent.trim() : "";
      if (spanTitle) {
        removeFollowingSep(spanTitle);
        spanTitle.remove();
      }

      const bodyHTML = li.innerHTML.trim();

      li.innerHTML = `
          <div class="h-full rounded-2xl ring-1 ring-slate-200 bg-white p-5
                      transition-[box-shadow,transform] hover:shadow-xl hover:-translate-y-0.5 flex flex-col">
            <div class="flex items-start gap-3">
              ${left}
              <div class="min-w-0">
                ${
                  title
                    ? `<div class="text-base font-semibold leading-6 text-slate-900">${title}</div>`
                    : ""
                }
              </div>
            </div>
            <div class="mt-3 text-[18px] leading-relaxed text-slate-800">
              ${bodyHTML}
            </div>
          </div>
        `;
    });
  });
};

const transformInfoBoxes = (doc) => {
  Array.from(doc.querySelectorAll("p.info-box")).forEach((p) => {
    const titleEl = Array.from(p.childNodes).find((node) => {
      if (node.nodeType === 3) return node.textContent.trim();
      if (node.nodeType !== 1) return false;
      return node.nodeName !== "BR";
    });

    let title = "";
    if (
      titleEl?.nodeType === 1 &&
      ["SPAN", "STRONG", "B"].includes(titleEl.nodeName)
    ) {
      title = titleEl.textContent.trim();
      let next = titleEl.nextSibling;
      while (
        next &&
        ((next.nodeType === 3 && /^[\s:–—-]+$/.test(next.textContent)) ||
          (next.nodeType === 1 && next.nodeName === "BR"))
      ) {
        const rm = next;
        next = next.nextSibling;
        rm.remove();
      }
      titleEl.remove();
    }

    let bodyHTML = p.innerHTML.trim();
    bodyHTML = bodyHTML
      .replace(/^(?:\s|&nbsp;|&#160;|<br\s*\/?>)+/gi, "")
      .replace(/^(?:<p>\s*(?:&nbsp;|&#160;|<br\s*\/?>|\s)*<\/p>\s*)+/gi, "");

    p.innerHTML = `
        <div role="note"
            class="relative my-8 overflow-hidden rounded-lg border-y border-[#94B4C1]/55 bg-[#F1F5F4]/80 px-5 py-5 shadow-[0_14px_34px_rgba(30,42,50,0.045)] ring-1 ring-[#94B4C1]/30 sm:px-6">
          <div class="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[#416472]"></div>
          <div class="min-w-0 pl-3 sm:pl-4">
                ${
                  title
                    ? `<div class="text-[1.35rem] font-bold leading-snug text-[#18242C] sm:text-[1.5rem]">${title}</div>
                       ${
                         bodyHTML
                           ? `<div class="viator-info-box-body mt-1 text-[18px] leading-[1.65] text-[#24313A] sm:text-[19px]">${bodyHTML}</div>`
                           : ""
                       }`
                    : `<div class="viator-info-box-body text-[19px] leading-[1.65] text-[#18242C] sm:text-[21px]">${bodyHTML}</div>`
                }
          </div>
        </div>
      `;

    p.classList.remove("info-box");
    p.classList.add("m-0");
  });
};

const normalizeCitationSpacing = (doc) => {
  Array.from(doc.querySelectorAll("sup.viator-cite")).forEach((sup) => {
    const next = sup.nextSibling;
    if (next?.nodeType === Node.TEXT_NODE) {
      if (/^[^\s.,;:!?…»”")\]]/.test(next.textContent || "")) {
        next.textContent = ` ${next.textContent}`;
      }
      return;
    }

    if (next?.nodeType === Node.ELEMENT_NODE) {
      const text = next.textContent || "";
      if (/^[^\s.,;:!?…»”")\]]/.test(text)) {
        sup.parentNode?.insertBefore(doc.createTextNode(" "), next);
      }
    }
  });
};

export function buildPostContent(rawHtml = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  const readingTime = extractReadingTime(doc);
  const toc = enhanceHeadings(doc);

  injectPostContentStyles();
  enhanceBlockquotes(doc);
  enhanceFigures(doc);
  applyCitationTransforms(doc);
  transformCardLists(doc);
  transformInfoBoxes(doc);
  normalizeCitationSpacing(doc);

  return {
    html: doc.body.innerHTML,
    toc,
    readingTime,
  };
}
