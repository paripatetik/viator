import { useEffect, useState } from "react";
import { playfair } from "/lib/fonts";

/* util: slug-ify Ukrainian + Latin headings → id */
const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/&amp;|&/g, "-and-")
    .replace(/[^\w\u0400-\u04FF\- ]+/g, "")
    .replace(/\s+/g, "-");

export function usePostContent(rawHtml = "") {
  const [html, setHtml] = useState("");
  const [toc, setToc] = useState([]);      // [{ id, text }]
  const [readingTime, setReadingTime] = useState("");

  useEffect(() => {
    if (!rawHtml) return;

    // One-time global handler to navigate to refs and show a simple "↑" back arrow
    if (typeof window !== "undefined" && !window.__viatorGoToRef) {
      window.__viatorGoToRef = (idx) => {
        try {
          const prevY = window.scrollY || window.pageYOffset || 0;

          let btn = document.getElementById("viator-cite-back");
          if (!btn) {
            btn = document.createElement("button");
            btn.id = "viator-cite-back";
            btn.type = "button";
            btn.textContent = "↑";
            btn.setAttribute("aria-label", "Повернутися нагору");
            btn.style.cssText = [
              "position:fixed","bottom:16px","right:16px","z-index:9999",
              "width:40px","height:40px","border:none","border-radius:9999px",
              "background:#94B4C1","color:#000","font-weight:700",
              "font-size:20px","line-height:40px","text-align:center",
              "box-shadow:0 6px 18px rgba(0,0,0,.25)","cursor:pointer",
            ].join(";");
            document.body.appendChild(btn);
          }
          btn.onclick = () => {
            window.scrollTo({ top: prevY, behavior: "smooth" });
            btn.remove();
          };

          const target = document.getElementById(`ref-${idx}`);
          const cssVar = getComputedStyle(document.documentElement)
            .getPropertyValue("--header-offset");
          const headerOffset = parseFloat(cssVar) || 0;
          if (target) {
            const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        } catch {}
        return false;
      };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    /* reading-time (WP plugin) */
    const rt = doc.querySelector(".rt-reading-time");
    if (rt) {
      setReadingTime(rt.textContent.trim());
      rt.remove();
    }

    /* TOC: all <h2> */
const h2s = Array.from(doc.querySelectorAll("h2"));
const tocArr = h2s.map((h) => {
  const id = slugify(h.textContent);
  h.id = id;

  h.style.position = "relative";
  h.style.marginTop = "10px";
  h.style.display = "inline-block";
  h.style.textAlign = "left";
  h.style.fontWeight = "600";
  

  h.classList.add(playfair.className);
  h.classList.add("viator-ribbon");

  return { id, text: h.textContent };
});

// додаємо CSS для bookmark-заголовків
const style = document.createElement("style");
style.textContent = `
  h2.viator-ribbon {
    position: relative;
    display: inline-block;
    
    margin: 10px 0 15px;
    margin-left: -25px;
    
    background: #94B4C1;
    color: #000000;
    
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    font-family: ${playfair.className};
    font-weight: 600;
    line-height: 1.25;
    padding: 10px 25px 10px 30px;
    border-radius: 8px;
    
    /* Створюємо стрічку з вирізами з обох боків */
    clip-path: polygon(
      20px 0,
      0 50%,
      20px 100%,
      100% 100%,
      calc(100% - 20px) 50%,
      100% 0
    );
    
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    
    /* Бордер через фільтр */
    filter: drop-shadow(0 0 0 1px rgba(0,0,0,0.15));
    
    /* Плавна анімація */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  
  /* Ховер ефект */
  h2.viator-ribbon:hover {
    transform: translateX(12px);
    box-shadow: 0 5px 10px rgba(0,0,0,0.18);
  }

  /* ─── Фрейми для зображень ───────────────────────── */

    figure.viator-figure {
    margin: 32px 0;          /* без auto, щоб йшло на всю ширину контейнера */
    width: 100%;
    max-width: 100%;

    border-radius: 20px;
    border: 1px solid rgba(59, 85, 96, 0.35);
    overflow: hidden;

    background: #fdf4e4;
    box-shadow: 0 8px 22px rgba(0,0,0,0.08);
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }

  figure.viator-figure:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 34px rgba(0,0,0,0.16);
  }

  figure.viator-figure img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;

    /* елегантна рамка саме по фото */
    border-bottom: 1px solid rgba(59, 85, 96, 0.16);
  }

  figure.viator-figure figcaption.viator-caption {
    padding: 10px 18px 12px;
    text-align: center;

    font-size: 1rem;
    background: #F1F5F9; 
    border-top: none;
    margin: 0;
    color: black;
  }

  



    blockquote.viator-quote {
    position: relative;
    margin: 32px 0;
    width: 100%;
    max-width: 100%;

    
    padding: 40px 27px;

    background: #e2e8f0; /* спокійний теплий фон, в тон сайту */
    color: #1E2A32;
    border-radius: 24px;

    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.9) inset,
      0 8px 22px rgba(0, 0, 0, 0.10);

    font-size: 1.05rem;
    line-height: 1.6;
    font-style: italic;
    overflow: hidden;

    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  blockquote.viator-quote:hover {
    transform: translateY(-3px);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.9) inset,
      0 16px 32px rgba(0, 0, 0, 0.16);
  }

  blockquote.viator-quote::before,
  blockquote.viator-quote::after {
    position: absolute;
    font-size: 4rem;
    font-weight: 800;
    color: rgba(0, 0, 0, 0.16);
    line-height: 1;
    font: Playfair Display, serif;
    pointer-events: none;
  }

  blockquote.viator-quote::before {
    content: "“";
    top: 7px;
    left: 20px;
    
  }

  blockquote.viator-quote::after {
    content: "”";
    bottom: 6px;
    right: 22px;
  }

  blockquote.viator-quote p {
    margin: 0;
  }

  /* менше «внутрішніх» відступів між рядками контенту */
  blockquote.viator-quote p + p {
    margin-top: 1px;
  }

  blockquote.viator-quote cite.viator-quote-cite {
    display: block;
    margin-top: 10px;
    font-size: 0.9rem;
    font-style: normal;
    text-align: right;
    color: #3B5560;
  }

 

    blockquote.viator-quote p::before,
  blockquote.viator-quote p::after,
  blockquote.viator-quote q::before,
  blockquote.viator-quote q::after {
    content: none !important;
  }
  `;
document.head.appendChild(style);

 Array.from(doc.querySelectorAll("blockquote")).forEach((b) => {
      b.classList.add("viator-quote");
      b.classList.add(playfair.className); // той самий шрифт, що й у заголовків

      const cite = b.querySelector("cite");
      if (cite) {
        cite.classList.add("viator-quote-cite");
        
      }
    });

Array.from(doc.querySelectorAll("img")).forEach((img) => {
      if (img.closest("figure")) return; // вже всередині <figure> – пропускаємо

      const figure = doc.createElement("figure");
      figure.classList.add("viator-figure");

      const parent = img.parentNode;
      if (!parent) return;

      parent.insertBefore(figure, img);
      figure.appendChild(img);
    });

    // 2) Накладаємо стилі на всі <figure> з картинками
    Array.from(doc.querySelectorAll("figure")).forEach((figure) => {
      // пропускаємо фігури без зображень (якщо такі раптом будуть)
      if (!figure.querySelector("img")) return;

      figure.classList.add("viator-figure");

      const caption = figure.querySelector("figcaption");
      if (caption) {
        caption.classList.add("viator-caption");
        caption.innerHTML = caption.innerHTML.trim();
      }
    });



    /* ── CITATIONS ────────────────────────────────────────── */

    const apaInText = (refText = "") => {
      if (!refText) return "";
      const m = refText.match(/^\s*([^()]+?)\s*\(([^)]+)\)/);
      if (!m) return refText.trim();

      const authorsRaw = m[1].trim().replace(/\.$/, "");
      const yearMatch = m[2].match(/\b(\d{4}[a-z]?)\b/i);
      if (!yearMatch) return refText.trim();
      const year = yearMatch[1];

      const surnameMatches = [...authorsRaw.matchAll(/([^,\d][^,]*?),\s*[A-ZА-ЯЇІЄҐ]/g)];
      const surnames = surnameMatches.length
        ? surnameMatches.map((mm) => mm[1].trim())
        : [authorsRaw.split(",")[0].trim()].filter(Boolean);

      let authorText;
      if (surnames.length === 1) authorText = surnames[0];
      else if (surnames.length === 2) authorText = `${surnames[0]} & ${surnames[1]}`;
      else authorText = `${surnames[0]} et al.`;

      return `(${authorText}, ${year})`;
    };

    const findRefsHeading = () => {
      const all = Array.from(doc.querySelectorAll("h2, h3, h4"));
      const needle = [
        "джерела",
        "посилання",
        "key scientific references",
        "references",
        "bibliography",
      ];
      return all
        .slice()
        .reverse()
        .find((h) => needle.some((n) => h.textContent.trim().toLowerCase().startsWith(n)));
    };

    let heading = findRefsHeading();

    if (heading) {
      // collect refs before replace
      const pickList = () => {
        const sib = heading.nextElementSibling;
        if (sib && ["OL","UL"].includes(sib.tagName)) return sib;
        const after = heading.parentElement?.querySelector(":scope > ol, :scope > ul")
          || heading.parentElement?.querySelector(":scope ~ ol, :scope ~ ul");
        return after || null;
      };

      let listForRefs = pickList();
      const tempItems = listForRefs ? Array.from(listForRefs.children) : [];

      const refs = tempItems.map((li, i) => {
        li.id = `ref-${i + 1}`;
        li.style.scrollMarginTop = "80px";
        return li.textContent.trim();
      });

      const citationHTML = (_match, num, punct = "") => {
        const idx = +num;
        const ref = refs[idx - 1];
        if (!ref) return _match;
        const body = apaInText(ref).replace(/"/g, "&quot;");
        return `<sup id="cite-${idx}" class="relative align-super group"
                 style="font-size:0;margin-left:2px;margin-right:-2px;top:0px">
          <a href="#" onclick="return window.__viatorGoToRef(${idx})"
             class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm
                    bg-[#94B4C1] text-[10px] leading-none font-bold text-black no-underline">
            ${idx}
          </a>
          <span class="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-[13px] mb-0.5 z-50
                       hidden group-hover:block group-focus:block
                       whitespace-nowrap rounded border bg-white px-1 py-0.5
                       text-[15px] leading-tight text-gray-900 shadow
                       pointer-events-auto select-text">
            ${body}
          </span>
        </sup>${punct}`;
      };

      // replace [n] in whole body
      doc.body.innerHTML = doc.body.innerHTML.replace(
        /(?:\s|&nbsp;)*\[\s*(\d+)\s*]\s*([.,;:!?])?/g,
        (_all, n, punct) => citationHTML("", n, punct || "")
      );

      // re-find heading & list after replace
      heading = findRefsHeading();

      if (heading) {
        const listEl =
          (heading.nextElementSibling &&
            ["OL","UL"].includes(heading.nextElementSibling.tagName) &&
            heading.nextElementSibling) ||
          heading.parentElement?.querySelector(":scope > ol, :scope > ul") ||
          heading.parentElement?.querySelector(":scope ~ ol, :scope ~ ul");

        if (listEl) {
          const items = Array.from(listEl.children);

          // style list
          listEl.className = "space-y-4 my-6 pl-0";
          listEl.style.listStyle = "none";

          items.forEach((li, i) => {
            li.id = `ref-${i + 1}`;
            li.style.scrollMarginTop = "80px";

            const firstLink = li.querySelector("a[href]");
            const href = firstLink?.getAttribute("href") || null;

            const clone = li.cloneNode(true);
            clone.querySelectorAll("a[href]").forEach((a) => a.remove());
            let citationHTMLInner = clone.innerHTML.trim();

            // bold author
            citationHTMLInner = citationHTMLInner.replace(
              /^([^<(]+?)\s*\((\d{4}[a-z]?)\)/i,
              (_m, a, y) => `<strong>${a.trim()}</strong> (${y})`
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
                  <span class="inline-flex items-center justify-center text-pretty w-6 h-6 rounded-full
                               text-[12px] font-bold bg-slate-300 text-slate-800 select-none">
                    ${i + 1}
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
        }
      }
    }

    /* ===== FLEX CARDS from "bold+italic" or <span> title =====
/* ===== FLEX CARDS (trigger = list has at least one <li class="card-list">) ===== */
const allLists = Array.from(doc.querySelectorAll("ul, ol"));

allLists.forEach((ul) => {
  const lis = Array.from(ul.children);
  if (!lis.length) return;

  // Увімкнути картки, якщо у списку є ХОЧ ОДИН <li class="card-list">
  const hasCardFlag = lis.some((li) => li.classList?.contains("card-list"));
  if (!hasCardFlag) return;

  // Контейнер: 2 колонки на md+, однакова висота рядка
  ul.classList.add(
    "grid", "gap-2", "my-6", "pl-0", "list-none",
    "md:grid-cols-2"
  );

  const removeFollowingSep = (node) => {
    // прибрати роздільники ( :, —, -, пробіли ) та перший <br> одразу після title
    let next = node?.nextSibling;
    while (next && next.nodeType === 3 && /^[\s:–—-]+$/.test(next.textContent)) {
      const rm = next; next = next.nextSibling; rm.remove();
    }
    if (next && next.nodeType === 1 && next.nodeName === "BR") next.remove();
  };

  lis.forEach((li, idx) => {
    // ── ICON ─────────────────────────────────────────────────
    let svg = li.querySelector("svg");
    const hasIcon = !!svg;
    if (svg) {
      // трохи нормалізуємо іконку під наш стиль
      svg.setAttribute("width", svg.getAttribute("width") || "24");
      svg.setAttribute("height", svg.getAttribute("height") || "24");
      svg.classList.add("opacity-90");
    }
    const iconHTML = hasIcon ? svg.outerHTML : "";
    if (svg) svg.remove();

    const left = hasIcon
      ? `<div class="shrink-0 mt-0.5 text-[#3B5560]">${iconHTML}</div>`
      : `<div class="shrink-0">
           <div class="inline-flex text-base h-7 w-7 items-center justify-center rounded-lg
                       border border-[#94B4C1] bg-[#EAF1F4] text-[#1E2A32] font-bold">
             ${idx + 1}
           </div>
         </div>`;

    // ── TITLE (з <span>) ────────────────────────────────────
    const spanTitle = li.querySelector("span");
    const title = spanTitle ? spanTitle.textContent.trim() : "";
    if (spanTitle) {
      removeFollowingSep(spanTitle);
      spanTitle.remove(); // не дублюємо у тілі
    }

    // ── BODY ─────────────────────────────────────────────────
    const bodyHTML = li.innerHTML.trim();

    // ── CARD ─────────────────────────────────────────────────
    li.innerHTML = `
      <div class="h-full rounded-2xl ring-1 ring-slate-200 bg-white p-5
                  transition-[box-shadow,transform] hover:shadow-xl hover:-translate-y-0.5 flex flex-col">
        <div class="flex items-start gap-3">
          ${left}
          <div class="min-w-0">
            ${title ? `<div class="text-base font-semibold leading-6 text-slate-900">${title}</div>` : ""}
          </div>
        </div>
        <div class="mt-3 text-[18px] leading-relaxed text-slate-800">
          ${bodyHTML}
        </div>
      </div>
    `;
  });
});

/* ===== INFO BOX: <p class="info-box"> → card with left accent ===== */
/* ===== INFO BOX (rounded stripe, no inner hard line) ===== */
Array.from(doc.querySelectorAll("p.info-box")).forEach((p) => {
  const span = p.querySelector("span");
  let title = "";
  if (span) {
    title = span.textContent.trim();
    // прибираємо роздільники та перший <br> після заголовка
    let next = span.nextSibling;
    while (next && next.nodeType === 3 && /^[\s:–—-]+$/.test(next.textContent)) {
      const rm = next; next = next.nextSibling; rm.remove();
    }
    if (next && next.nodeType === 1 && next.nodeName === "BR") next.remove();
    span.remove();
  }

  const bodyHTML = p.innerHTML.trim();

  p.innerHTML = `
    <div role="note"
         class="relative rounded-2xl ring-1 ring-slate-200 bg-slate-50 px-5 py-4 sm:py-5 sm:px-6
                overflow-hidden transition-[box-shadow,transform] hover:shadow-xl hover:-translate-y-0.5">
      <!-- єдина ліва смуга з градієнтом: темніший край + основний колір -->
      <div class="pointer-events-none absolute inset-y-0 left-0 w-3"
           style="background:linear-gradient(to right,
                     rgba(59,85,96,.45) 0 2px,        /* темний край */
                     #94B4C1 2px 100%                 /* основний колір */
                   );"></div>

      ${
        title
          ? `<div class="text-lg sm:text-xl font-semibold text-slate-900">${title}</div>
              ${bodyHTML ? `<div class="mt-2 text-[16px] sm:text-[17px] leading-relaxed text-slate-800">${bodyHTML}</div>` : ""}`
          : `<div class="text-lg sm:text-xl font-extrabold text-slate-900">${bodyHTML}</div>`
      }
    </div>
  `;

  p.classList.remove("info-box");
  p.classList.add("m-0");
});


    /* push back */
    setHtml(doc.body.innerHTML);
    setToc(tocArr);
  }, [rawHtml]);

  return { html, toc, readingTime };
}
