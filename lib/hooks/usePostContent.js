// lib/hooks/usePostContent.js
import { useEffect, useState } from "react";
import { playfair } from "@/lib/fonts";

/* util: slug-ify Ukrainian + Latin headings → id */
const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/&amp;|&/g, "-and-")
    .replace(/[^\w\u0400-\u04FF\- ]+/g, "")
    .replace(/\s+/g, "-");

/* ── shared utils ─────────────────────────────────────── */
const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cleanSpaces = (s = "") =>
  String(s)
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/[\u00A0\u202F\u2009\u200A\u2007\u2060\u200B]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ── Tooltip meta extraction (no brackets) ─────────────── */

const extractYear = (refText = "") => {
  const t = cleanSpaces(refText);
  const m = t.match(/\(([^)]*?\b(19\d{2}|20\d{2})([a-z])?\b[^)]*?)\)/i);
  if (m?.[2]) return `${m[2]}${m[3] || ""}`;

  const m2 = t.match(/\b(19\d{2}|20\d{2})([a-z])?\b/i);
  return m2 ? `${m2[1]}${m2[2] || ""}` : "";
};
const extractAuthorShort = (refText = "") => {
  const t = cleanSpaces(refText);

  // 1) найкраще: все ДО "(" року — це автори в APA
  const beforeParen = t.includes("(") ? t.split("(")[0].trim() : "";

  // 2) fallback: до першого ". " (крапка + пробіл), не просто "."
  const beforeDotSpace = t.split(". ")[0].trim();

  const authorsBlock = beforeParen || beforeDotSpace || t;

  const normalizeSurname = (s = "") =>
    String(s)
      .trim()
      // прибрати кон'юнкції, які інколи прилипають до прізвища
      .replace(/^(?:&|and|і)\s+/i, "")
      .trim();

  // ловимо прізвища з "Surname, A."
  const surnameMatches = [
    ...authorsBlock.matchAll(/([^,\d][^,]*?),\s*[A-ZА-ЯЇІЄҐ]/g),
  ];

  let surnames = surnameMatches
    .map((mm) => normalizeSurname(mm[1]))
    .filter(Boolean);

  // якщо не APA-коми — пробуємо простіше (корпоративний/один автор)
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

  // 1) APA-ish: Author (2025). ARTICLE TITLE. Journal...
  if (year) {
    const yrEsc = year.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\(${yrEsc}\\)\\.\\s*([^\\.]+)\\.`, "i");
    const m = t.match(re);
    if (m?.[1]) return m[1].trim();
  }

  // 2) No year: Author(s) with initials → Title.
  // Find boundary ". " where next token is NOT an initial like "W."
  const initialRe = /^[A-ZА-ЯЇІЄҐ]\.\s*/; // "T. " / "W. "
  let start = 0;
  let cut = -1;

  while (true) {
    const pos = t.indexOf(". ", start);
    if (pos === -1) break;

    const after = t.slice(pos + 2).trimStart();

    // якщо після ". " знову ініціал — ми ще в блоці авторів, пропускаємо
    if (initialRe.test(after)) {
      start = pos + 2;
      continue;
    }

    cut = pos + 2;
    break;
  }

  if (cut !== -1) {
    const rest = t.slice(cut).trim();
    // title = до наступної крапки
    const end = rest.indexOf(".");
    if (end !== -1) return rest.slice(0, end).trim();
    return rest.trim();
  }

  return "";
};

// зберігаємо префікс (p., pp., c., с.), якщо він був
const normalizeLocator = (locRaw = "") => {
  let loc = cleanSpaces(locRaw);
  if (!loc) return "";

  loc = loc.replace(/^[,;:.\s]+/, "");

  // digits only -> ставимо p. як нейтральний дефолт
  if (/^\d+([–—-]\d+)?$/.test(loc)) return `p. ${loc}`;

  // якщо починається з pp./p./c./с. — залишаємо як є (тільки уніфікуємо пробіл)
  const m = loc.match(/^(pp?|p|c|с)\.?\s*(.+)$/i);
  if (m?.[1] && m?.[2]) {
    const prefix = m[1].toLowerCase(); // p / pp / c / с
    return `${prefix}. ${m[2].trim()}`;
  }

  // якщо є цифри, але без префікса — теж p.
  if (/\d/.test(loc)) return `p. ${loc}`;

  return "";
};

const buildTooltipText = (refMeta, locatorRaw = "") => {
  const author = refMeta?.author || "";
  const title = refMeta?.title || "";
  const year = refMeta?.year || "";
  const page = normalizeLocator(locatorRaw);

  // без дужок: Author · Title · 2025 · p. 28–42
  const parts = [];
  if (author) parts.push(author);
  if (title) parts.push(title);
  if (year) parts.push(year);
  if (page) parts.push(page);

  return parts.join(" · ");
};

export function usePostContent(rawHtml = "") {
  const [html, setHtml] = useState("");
  const [toc, setToc] = useState([]); // [{ id, text }]
  const [readingTime, setReadingTime] = useState("");

  useEffect(() => {
    if (!rawHtml) return;

    // ── One-time global handler (floating back button + header-offset scroll) ──
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
            btn.setAttribute("aria-label", "Повернутися назад");
            btn.style.cssText = [
              "position:fixed",
              "bottom:16px",
              "right:16px",
              "z-index:99999",
              "width:40px",
              "height:40px",
              "border:none",
              "border-radius:9999px",
              "background:var(--color-viator-sky)",
              "color:#000",
              "font-weight:700",
              "font-size:20px",
              "line-height:40px",
              "text-align:center",
              "box-shadow:0 6px 18px rgba(0,0,0,.25)",
              "cursor:pointer",
            ].join(";");
            document.body.appendChild(btn);
          }

          btn.onclick = () => {
            window.scrollTo({ top: prevY, behavior: "smooth" });
            btn.remove();
          };

          const target = document.getElementById(`ref-${idx}`);
          const cssVar = getComputedStyle(document.documentElement).getPropertyValue(
            "--header-offset"
          );
          const headerOffset = parseFloat(cssVar) || 0;

          if (target) {
            const y =
              target.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        } catch {}
        return false;
      };
    }

    // ── One-time tooltip engine for citations (fixed, multiline, never clipped) ──
    if (typeof window !== "undefined" && !window.__viatorCiteTooltipInit) {
      window.__viatorCiteTooltipInit = true;

      const ensureTipEl = () => {
        let el = document.getElementById("viator-cite-tooltip");
        if (!el) {
          el = document.createElement("div");
          el.id = "viator-cite-tooltip";
          el.setAttribute("role", "tooltip");
          document.body.appendChild(el);
        }
        return el;
      };

      const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

      const hide = () => {
        const tip = ensureTipEl();
        tip.style.display = "none";
      };

      const showForSup = (sup) => {
        const tip = ensureTipEl();
        const html = sup?.getAttribute?.("data-tip") || "";
        if (!html) return hide();

        tip.innerHTML = html;

        // show offscreen to measure
        tip.style.display = "block";
        tip.style.visibility = "hidden";
        tip.style.left = "0px";
        tip.style.top = "0px";
        tip.style.transform = "translate(-50%, -100%)";

        const r = sup.getBoundingClientRect();
        let x = r.left + r.width / 2;
        let yTop = r.top - 10;

        tip.style.left = `${x}px`;
        tip.style.top = `${yTop}px`;
        tip.style.visibility = "visible";

        const tr = tip.getBoundingClientRect();
        const pad = 12;
        const half = tr.width / 2;

        x = clamp(x, half + pad, window.innerWidth - half - pad);

        // if clipped at top → place below
        const placeBelow = tr.top < pad;
        if (placeBelow) {
          const yBottom = r.bottom + 10;
          tip.style.transform = "translate(-50%, 0)";
          tip.style.left = `${x}px`;
          tip.style.top = `${yBottom}px`;
        } else {
          tip.style.transform = "translate(-50%, -100%)";
          tip.style.left = `${x}px`;
          tip.style.top = `${yTop}px`;
        }
      };

      const isBadge = (node) => node?.closest?.("a.viator-cite-badge");
      const supFromBadge = (badge) => badge?.closest?.("sup.viator-cite");
      const isTooltip = (node) =>
        node && node.closest && node.closest("#viator-cite-tooltip");

      document.addEventListener("mouseover", (e) => {
        const badge = isBadge(e.target);
        if (!badge) return;
        const sup = supFromBadge(badge);
        if (sup) showForSup(sup);
      });

      document.addEventListener("mouseout", (e) => {
        const badge = isBadge(e.target);
        if (!badge) return;
        if (isTooltip(e.relatedTarget)) return; // allow moving into tooltip
        hide();
      });

      document.addEventListener("focusin", (e) => {
        const badge = isBadge(e.target);
        if (!badge) return;
        const sup = supFromBadge(badge);
        if (sup) showForSup(sup);
      });

      document.addEventListener("focusout", (e) => {
        const badge = isBadge(e.target);
        if (!badge) return;
        hide();
      });

      document.addEventListener(
        "mouseleave",
        (e) => {
          if (!e.target || e.target.id !== "viator-cite-tooltip") return;
          if (isBadge(e.relatedTarget)) return;
          hide();
        },
        true
      );

      window.addEventListener("scroll", hide, { passive: true });
      window.addEventListener("resize", hide);
    }


// ── One-time lightbox initialization with zoom ──
// ── One-time lightbox initialization: gallery + caption pane + zoom ──
if (typeof window !== "undefined" && !window.__viatorLightboxInit) {
  window.__viatorLightboxInit = true;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const getCaption = (figure) => {
    const cap = figure?.querySelector("figcaption");
    const txt = cap?.textContent ? cap.textContent.trim() : "";
    return txt;
  };

  const collectGallery = () => {
    const figures = Array.from(document.querySelectorAll("figure.viator-figure"));
    const items = figures
      .map((fig) => {
        const img = fig.querySelector("img");
        if (!img) return null;

        // prefer currentSrc if available
        const src = img.currentSrc || img.getAttribute("src") || "";
        if (!src) return null;

        return {
          figure: fig,
          img,
          src,
          alt: img.getAttribute("alt") || "",
          caption: getCaption(fig),
        };
      })
      .filter(Boolean);

    return items;
  };

  const createLightbox = () => {
    let root = document.getElementById("viator-lightbox");
    if (root) return root;

    root = document.createElement("div");
    root.id = "viator-lightbox";
    root.className = "viator-lightbox";
    root.innerHTML = `
      <div class="viator-lb-backdrop" data-action="close"></div>

      <div class="viator-lb-shell" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="viator-lb-close" data-action="close" aria-label="Close">×</button>

        <div class="viator-lb-main">
          <button class="viator-lb-nav viator-lb-prev" data-action="prev" aria-label="Previous">‹</button>

          <div class="viator-lb-stage">
            <div class="viator-lb-stage-inner">
              <img class="viator-lb-img" src="" alt="" draggable="false" />
            </div>
          </div>

          <button class="viator-lb-nav viator-lb-next" data-action="next" aria-label="Next">›</button>
        </div>

        <aside class="viator-lb-side">
          <div class="viator-lb-meta">
            <div class="viator-lb-count" aria-live="polite"></div>
            <div class="viator-lb-caption"></div>
          </div>

          <div class="viator-lb-zoom">
            <button class="viator-lb-zoombtn viator-lb-mobile-prev" data-action="prev" aria-label="Previous">‹</button>
            <button class="viator-lb-zoombtn" data-action="zoom-out" aria-label="Zoom out">−</button>
            <button class="viator-lb-zoombtn" data-action="zoom-in" aria-label="Zoom in">+</button>
            <button class="viator-lb-zoombtn" data-action="zoom-reset" aria-label="Reset zoom">Reset</button>
            <button class="viator-lb-zoombtn viator-lb-mobile-next" data-action="next" aria-label="Next">›</button>
          </div>
        </aside>
      </div>
    `;

    document.body.appendChild(root);
    return root;
  };

  // ---- state (lives in this one-time closure) ----
  let items = [];
  let idx = 0;

  // zoom/pan state
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragStartX = 0;
  let dragStartY = 0;

  const openAt = (nextItems, nextIdx) => {
    items = nextItems || [];
    if (!items.length) return;

    idx = clamp(nextIdx ?? 0, 0, items.length - 1);

    const lb = createLightbox();
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";

    // reset zoom each time you open
    scale = 1;
    posX = 0;
    posY = 0;

    render();
  };

  const close = () => {
    const lb = document.getElementById("viator-lightbox");
    if (!lb) return;
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    isDragging = false;
    // reset zoom
    scale = 1;
    posX = 0;
    posY = 0;
    applyTransform();
  };

  const applyTransform = () => {
    const lb = document.getElementById("viator-lightbox");
    const img = lb?.querySelector(".viator-lb-img");
    if (!img) return;
    img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  };

  const setIdx = (next) => {
    if (!items.length) return;
    idx = (next + items.length) % items.length; // wrap-around
    // reset zoom on image change
    scale = 1;
    posX = 0;
    posY = 0;
    render();
  };

  const render = () => {
    const lb = document.getElementById("viator-lightbox");
    if (!lb) return;

    const imgEl = lb.querySelector(".viator-lb-img");
    const capEl = lb.querySelector(".viator-lb-caption");
    const countEl = lb.querySelector(".viator-lb-count");

    const cur = items[idx];
    if (!cur) return;

    imgEl.src = cur.src;
    imgEl.alt = cur.alt || "";

    countEl.textContent = `${idx + 1} / ${items.length}`;
    capEl.textContent = cur.caption || "";

    applyTransform();
  };

  // ---- event handling ----

  // Delegated open on content images
  document.addEventListener("click", (e) => {
    const img = e.target.closest("figure.viator-figure img");
    if (!img) return;

    const gallery = collectGallery();
    if (!gallery.length) return;

    const clickedIdx = gallery.findIndex((it) => it.img === img);
    openAt(gallery, clickedIdx >= 0 ? clickedIdx : 0);
  });

  // Lightbox button/backdrop actions
  document.addEventListener("click", (e) => {
    const lb = document.getElementById("viator-lightbox");
    if (!lb || !lb.classList.contains("is-open")) return;

    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    if (!action) return;

    e.preventDefault();
    e.stopPropagation();

    if (action === "close") close();
    if (action === "prev") setIdx(idx - 1);
    if (action === "next") setIdx(idx + 1);

    if (action === "zoom-in") {
      scale = clamp(scale + 0.5, 1, 6);
      applyTransform();
    }
    if (action === "zoom-out") {
      scale = clamp(scale - 0.5, 1, 6);
      if (scale === 1) {
        posX = 0;
        posY = 0;
      }
      applyTransform();
    }
    if (action === "zoom-reset") {
      scale = 1;
      posX = 0;
      posY = 0;
      applyTransform();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("viator-lightbox");
    if (!lb || !lb.classList.contains("is-open")) return;

    // don’t hijack typing
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") setIdx(idx - 1);
    if (e.key === "ArrowRight") setIdx(idx + 1);
  });

  // Zoom/pan (mouse)
  document.addEventListener("mousedown", (e) => {
    const lb = document.getElementById("viator-lightbox");
    if (!lb || !lb.classList.contains("is-open")) return;

    const imgEl = e.target.closest(".viator-lb-img");
    if (!imgEl) return;

    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dragStartX = posX;
    dragStartY = posY;

    imgEl.style.cursor = scale > 1 ? "grabbing" : "grab";
    imgEl.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    // pan only when zoomed
    if (scale > 1) {
      posX = dragStartX + (e.clientX - startX);
      posY = dragStartY + (e.clientY - startY);
      applyTransform();
    }
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;

    const lb = document.getElementById("viator-lightbox");
    const imgEl = lb?.querySelector(".viator-lb-img");
    if (imgEl) {
      imgEl.style.cursor = "grab";
      imgEl.style.transition = "transform 0.12s ease-out";
    }
  });

  // Mouse wheel zoom (over stage)
  document.addEventListener(
    "wheel",
    (e) => {
      const lb = document.getElementById("viator-lightbox");
      if (!lb || !lb.classList.contains("is-open")) return;

      const stage = e.target.closest(".viator-lb-stage");
      if (!stage) return;

      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      const nextScale = clamp(scale + delta, 1, 6);

      // zoom around center (simple, stable)
      scale = nextScale;
      if (scale === 1) {
        posX = 0;
        posY = 0;
      }
      applyTransform();
    },
    { passive: false }
  );

  // Touch: swipe left/right to navigate (simple)
// ── Touch: pan (when zoomed) + swipe (when not) + pinch zoom ──
let tMode = "none"; // "none" | "swipe" | "pan" | "pinch"
let tStartX = 0;
let tStartY = 0;
let tLastX = 0;
let tLastY = 0;

let pinchStartDist = 0;
let pinchStartScale = 1;
let pinchStartPosX = 0;
let pinchStartPosY = 0;
let pinchCenterStart = { x: 0, y: 0 };
let lastTapAt = 0;
let lastTapX = 0;
let lastTapY = 0;

const dist2 = (a, b) => {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const center2 = (a, b) => ({
  x: (a.clientX + b.clientX) / 2,
  y: (a.clientY + b.clientY) / 2,
});

const isOpen = () => {
  const lb = document.getElementById("viator-lightbox");
  return lb && lb.classList.contains("is-open");
};

const isStageTarget = (target) => {
  // тільки область картинки/сцени, не aside і не кнопки
  return !!target.closest(".viator-lb-stage");
};

document.addEventListener(
  "touchstart",
  (e) => {
    if (!isOpen()) return;
    if (!isStageTarget(e.target)) return;

    if (e.touches.length === 1) {
      const t = e.touches[0];
      tStartX = t.clientX;
      tStartY = t.clientY;
      tLastX = t.clientX;
      tLastY = t.clientY;

      const now = Date.now();
      const isDoubleTap =
        now - lastTapAt < 280 &&
        Math.abs(t.clientX - lastTapX) < 32 &&
        Math.abs(t.clientY - lastTapY) < 32;

      if (isDoubleTap) {
        e.preventDefault();
        if (scale > 1) {
          scale = 1;
          posX = 0;
          posY = 0;
        } else {
          scale = 2.4;
          const lb = document.getElementById("viator-lightbox");
          const stage = lb?.querySelector(".viator-lb-stage");
          const rect = stage?.getBoundingClientRect();
          if (rect) {
            posX = -(t.clientX - (rect.left + rect.width / 2)) * (scale - 1);
            posY = -(t.clientY - (rect.top + rect.height / 2)) * (scale - 1);
          }
        }
        applyTransform();
        lastTapAt = 0;
        tMode = "none";
        return;
      }

      lastTapAt = now;
      lastTapX = t.clientX;
      lastTapY = t.clientY;

      // На scale=1 поводимось як телефонна галерея: вся картинка видима, рух вбік = свайп.
      tMode = scale > 1 ? "pan" : "swipe";
    } else if (e.touches.length === 2) {
      const a = e.touches[0];
      const b = e.touches[1];

      tMode = "pinch";
      pinchStartDist = dist2(a, b);
      pinchStartScale = scale;

      pinchStartPosX = posX;
      pinchStartPosY = posY;

      pinchCenterStart = center2(a, b);
    } else {
      tMode = "none";
    }
  },
  { passive: false }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!isOpen()) return;
    if (!isStageTarget(e.target)) return;

    // важливо: щоб не скролило сторінку під час жестів по сцені
    if (tMode === "pan" || tMode === "pinch" || tMode === "swipe") {
      e.preventDefault();
    }

    if (tMode === "pan" && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - tLastX;
      const dy = t.clientY - tLastY;

      posX += dx;
      posY += dy;

      tLastX = t.clientX;
      tLastY = t.clientY;

      applyTransform();
      return;
    }

    if (tMode === "swipe" && e.touches.length === 1) {
      // нічого не робимо під час руху; рішення на touchend
      return;
    }

    if (tMode === "pinch" && e.touches.length === 2) {
      const a = e.touches[0];
      const b = e.touches[1];

      const d = dist2(a, b);
      const c = center2(a, b);

      const nextScale = clamp(pinchStartScale * (d / pinchStartDist), 1, 6);
      const scaleChange = nextScale / pinchStartScale;

      const lb = document.getElementById("viator-lightbox");
      const stage = lb?.querySelector(".viator-lb-stage");
      const rect = stage?.getBoundingClientRect();
      if (rect) {
        const cxRel = c.x - (rect.left + rect.width / 2);
        const cyRel = c.y - (rect.top + rect.height / 2);

        posX = pinchStartPosX * scaleChange - cxRel * (scaleChange - 1);
        posY = pinchStartPosY * scaleChange - cyRel * (scaleChange - 1);
      }

      scale = nextScale;

      // додатково дозволяємо “таскати” двома пальцями (зміщення центру)
      const centerDx = c.x - pinchCenterStart.x;
      const centerDy = c.y - pinchCenterStart.y;
      posX += centerDx;
      posY += centerDy;

      if (scale === 1) {
        posX = 0;
        posY = 0;
      }

      applyTransform();
    }
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (!isOpen()) return;

    // якщо свайп — вирішуємо навігацію
    if (tMode === "swipe") {
      const changed = e.changedTouches?.[0];
      if (changed) {
        const dx = changed.clientX - tStartX;
        const dy = changed.clientY - tStartY;

        if (Math.abs(dy) <= Math.abs(dx) && Math.abs(dx) >= 50) {
          if (dx > 0) setIdx(idx - 1);
          else setIdx(idx + 1);
        }
      }
    }

    // якщо закінчили pinch і лишився 1 палець — переходимо в pan або swipe залежно від scale
    if (tMode === "pinch" && e.touches.length === 1) {
      tMode = scale > 1 ? "pan" : "swipe";
      const t = e.touches[0];
      tLastX = t.clientX;
      tLastY = t.clientY;
      return;
    }

    // завершили всі дотики
    if (e.touches.length === 0) {
      tMode = "none";
    }
  },
  { passive: true }
);
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

    // ── CSS injection/update (avoid duplicates, keep HMR fresh) ──
    const STYLE_ID = "viator-postcontent-style";
    if (typeof document !== "undefined") {
      let style = document.getElementById(STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.appendChild(style);
      }

      style.textContent = `
        h2.viator-ribbon {
          position: relative;
          display: block;
          margin: 72px auto 14px;
          color: #1E2A32;
          font-size: 1.75rem;
          font-weight: 600;
          line-height: 1.24;
          padding: 0;
          max-width: 780px;
          text-align: center;
        }
        h2.viator-ribbon::after {
          content: "";
          display: block;
          width: 4.5rem;
          height: 1px;
          margin: 0.75rem auto 0;
          background: rgba(65, 100, 114, 0.58);
        }
        @media (max-width: 1024px) {
          h2.viator-ribbon {
            font-size: 1.7rem;
            margin-top: 62px;
          }
        }
        @media (max-width: 768px) {
          h2.viator-ribbon {
            font-size: 1.62rem;
            margin-top: 52px;
          }
        }

        article.viator-post-article h3,
        article.viator-post-article h4 {
          margin-top: 3.2rem;
          margin-bottom: 0.75rem;
          color: #1E2A32;
          line-height: 1.22;
        }

      figure.viator-figure {
  margin: 42px auto;
  display: block;
  width: fit-content;
  max-width: min(100%, 760px);
  border-radius: 14px;
  border: 1px solid rgba(148, 180, 193, 0.62);
  overflow: hidden;
  background: #F1F5F4;
  box-shadow: 0 16px 38px rgba(30, 42, 50, 0.09);
}
figure.viator-figure:hover {
  box-shadow: 0 18px 44px rgba(30, 42, 50, 0.12);
}
figure.viator-figure[data-viator-img-width] {
  width: min(100%, var(--viator-img-width), 760px);
}
figure.viator-figure img {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  border-bottom: 1px solid rgba(148, 180, 193, 0.42);
  cursor: pointer;
}
figure.viator-figure figcaption.viator-caption {
  display: block;
  box-sizing: border-box;
  width: 100%;
  max-height: 0;
  overflow: hidden;
  padding: 0 18px;
  text-align: left;
  font-size: 0.95rem;
  line-height: 1.45;
  background: rgba(234, 241, 243, 0.96);
  margin: 0;
  color: #3B5560;
  border-top: 0 solid rgba(148, 180, 193, 0.36);
  opacity: 0;
  transform: translateY(-0.35rem);
  transition: max-height 0.28s ease, padding 0.28s ease, border-width 0.28s ease, opacity 0.2s ease, transform 0.28s ease;
  pointer-events: none;
}
figure.viator-figure:hover figcaption.viator-caption,
figure.viator-figure:focus-within figcaption.viator-caption {
  max-height: 12rem;
  padding: 12px 18px 14px;
  border-top-width: 1px;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

@media (hover: none) {
  figure.viator-figure figcaption.viator-caption {
    max-height: none;
    padding: 12px 18px 14px;
    opacity: 1;
    transform: none;
    border-top: 1px solid rgba(148, 180, 193, 0.36);
    pointer-events: auto;
  }
}

       .viator-lightbox {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 99999;
}
.viator-lightbox.is-open {
  display: block;
}

.viator-lb-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
}

.viator-lb-shell {
  position: absolute;
  inset: 18px;
  display: grid;
  grid-template-columns: 1fr 380px;
  background: rgba(10, 10, 10, 0.35);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.viator-lb-close {
  position: absolute;
  top: 10px;
  right: 14px;
  z-index: 5;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  color: #fff;
  font-size: 30px;
  cursor: pointer;
}

.viator-lb-main {
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  align-items: stretch;
  min-width: 0;
}

.viator-lb-nav {
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 56px;
  cursor: pointer;
  opacity: 0.8;
}
.viator-lb-nav:hover { opacity: 1; }

.viator-lb-stage {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  position: relative;
}
.viator-lb-stage-inner {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.viator-lb-img {
  max-width: 92%;
  max-height: 92%;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.55);
  cursor: grab;
  user-select: none;
  transition: transform 0.12s ease-out;
}

.viator-lb-side {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 14px;
  padding: 18px 18px 16px;
  background: rgba(20, 20, 20, 0.72);
  border-left: 1px solid rgba(255,255,255,0.12);
  color: #fff;
}

.viator-lb-count {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 10px;
}

.viator-lb-caption {
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow: auto;
  max-height: 100%;
}

.viator-lb-zoom {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}
.viator-lb-mobile-prev,
.viator-lb-mobile-next {
  display: none;
}
.viator-lb-zoombtn {
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.10);
  color: #fff;
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  cursor: pointer;
}
.viator-lb-zoombtn:hover {
  background: rgba(255,255,255,0.16);
}

.viator-lb-stage { touch-action: none; }
.viator-lb-img { touch-action: none; }
.viator-lb-nav,
.viator-lb-zoombtn,
.viator-lb-close { touch-action: manipulation; } 

/* Mobile: stack caption under image */


@media (max-width: 900px) {
  .viator-lb-shell {
    inset: 0;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    border: 0;
    border-radius: 0;
  }
  .viator-lb-side {
    border-left: 0;
    border-top: 1px solid rgba(255,255,255,0.12);
    max-height: 30svh;
    padding: 10px 12px 12px;
  }
  .viator-lb-main {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    min-height: 0;
  }
  .viator-lb-stage {
    padding: 0 10px;
  }
  .viator-lb-stage-inner {
    overflow: hidden;
  }
  .viator-lb-img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .viator-lb-caption {
    max-height: 5.5rem;
    font-size: 14px;
    line-height: 1.4;
  }
  .viator-lb-zoom {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    order: -1;
    margin-bottom: 10px;
  }
  .viator-lb-mobile-prev,
  .viator-lb-mobile-next {
    display: inline-flex;
  }
  .viator-lb-zoombtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-width: 40px;
    height: 38px;
    padding: 0;
    font-size: 16px;
  }
  .viator-lb-mobile-prev,
  .viator-lb-mobile-next {
    font-size: 22px;
    line-height: 1;
  }
  .viator-lb-zoombtn[data-action="zoom-reset"] {
    display: none;
  }
  .viator-lb-nav {
    display: none;
  }
  .viator-lb-close {
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
  }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

figure.viator-figure img {
  cursor: pointer;
}



        /* ── Blockquote styling ── */

        blockquote.viator-quote {
          position: relative;
          margin: 42px auto;
          width: 100%;
          max-width: 100%;
          padding: 32px 38px 32px 38px;
          background:
            linear-gradient(rgba(234, 241, 243, 0.86), rgba(234, 241, 243, 0.86)),
            rgba(247, 246, 241, 0.92);
          color: #1E2A32;
          border: 0;
          border-left: 4px solid #416472;
          border-top: 1px solid rgba(148, 180, 193, 0.42);
          border-bottom: 1px solid rgba(148, 180, 193, 0.42);
          box-shadow: 0 14px 34px rgba(30, 42, 50, 0.055);
          font-size: 1.14rem;
          line-height: 1.78;
          font-style: italic;
          overflow: hidden;
        }
        blockquote.viator-quote::after {
          content: none;
        }
        blockquote.viator-quote::before {
          content: "“";
          position: absolute;
          top: 14px;
          right: 12px;
          color: rgba(65, 100, 114, 0.18);
          font: 600 4rem/1 Playfair Display, serif;
          pointer-events: none;
        }
        blockquote.viator-quote p:first-of-type {
          text-indent: 0;
        }

        .viator-section-dropcap::first-letter {
          initial-letter: 2.3;
          margin-right: 0.12em;
          color: #1E2A32;
          font-family: Playfair Display, serif;
          font-style: normal;
          font-weight: 700;
          line-height: 0.86;
        }

        @supports not (initial-letter: 3) {
          .viator-section-dropcap::first-letter {
            float: left;
            margin: 0.08em 0.12em 0 0;
            font-size: 2.45em;
            line-height: 0.86;
          }
        }
        blockquote.viator-quote p { margin: 0; }
        blockquote.viator-quote p + p { margin-top: 0.8rem; }

        blockquote.viator-quote cite.viator-quote-cite {
          display: block;
          margin-top: 14px;
          font-size: 0.92rem;
          font-style: normal;
          text-align: right;
          color: #3B5560;
        }

        @media (max-width: 768px) {
          blockquote.viator-quote {
            margin: 34px auto;
            padding: 24px 24px 24px 22px;
            font-size: 1.04rem;
            line-height: 1.72;
          }
          blockquote.viator-quote::before {
            top: 12px;
            right: 4px;
            font-size: 3rem;
          }
        }

        blockquote.viator-quote p::before,
        blockquote.viator-quote p::after,
        blockquote.viator-quote q::before,
        blockquote.viator-quote q::after {
          content: none !important;
        }

        /* ── CITATIONS (badge + spacing) ── */
        sup.viator-cite{
          vertical-align: super;
          font-size: 0;
          line-height: 0;
          margin-left: 0.22em;
          margin-right: 0.18rem;
        }
        blockquote.viator-quote sup.viator-cite{ margin-left: 0.26em; }

        a.viator-cite-badge{
          display: inline-grid;
          place-items: center;
          height: 14px;
          min-width: 14px;
          padding: 0 3px;
          box-sizing: border-box;
          border-radius: 3px;
          background: var(--color-viator-sky);
          color: #000;
          font-size: 10px;
          font-weight: 700;
          line-height: 1;
          text-align: center;
          text-decoration: none;
          font-style: normal !important;
          font-variant-numeric: tabular-nums lining-nums;
          font-feature-settings: "tnum" 1, "lnum" 1;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
        }

        /* ── Global fixed tooltip (multiline, never clipped) ── */
        #viator-cite-tooltip{
          position: fixed;
          z-index: 2147483647;
          display: none;
          max-width: min(360px, calc(100vw - 24px));
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          border: 1px solid rgba(0,0,0,.15);
          background: #fff;
          color: #111827;
          padding: 6px 8px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,.15);
          font-size: 12px;
          line-height: 1.25;
          pointer-events: auto;
          user-select: text;
        }

        .viator-info-box-body > :first-child {
          margin-top: 0 !important;
        }
        .viator-info-box-body > :last-child {
          margin-bottom: 0 !important;
        }
        .viator-info-box-body p {
          margin-top: 0 !important;
          margin-bottom: 0.55em !important;
        }
        .viator-info-box-body p:last-child {
          margin-bottom: 0 !important;
        }
      `;
    }

    // blockquote classing
    Array.from(doc.querySelectorAll("blockquote")).forEach((b) => {
      b.classList.add("viator-quote");
      b.classList.add(playfair.className);

      const cite = b.querySelector("cite");
      if (cite) cite.classList.add("viator-quote-cite");
    });

    // wrap imgs to figures
    Array.from(doc.querySelectorAll("img")).forEach((img) => {
      if (img.closest("figure")) return;

      const figure = doc.createElement("figure");
      figure.classList.add("viator-figure");

      const parent = img.parentNode;
      if (!parent) return;

      parent.insertBefore(figure, img);
      figure.appendChild(img);
    });

    // style figures with captions
    Array.from(doc.querySelectorAll("figure")).forEach((figure) => {
      if (!figure.querySelector("img")) return;

      figure.classList.add("viator-figure");

      let caption = figure.querySelector("figcaption");
      const img = figure.querySelector("img");
      // Keep the frame tied to the effective image width; long captions wrap below it.
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
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  });

    /* ── CITATIONS ────────────────────────────────────────── */

    const findRefsHeading = () => {
      const all = Array.from(doc.querySelectorAll("h2, h3, h4, h5, h6"));
      const needle = [
        "використані джерела",
        "джерела",
        "посилання",
        "key scientific references",
        "references",
        "bibliography",
      ];
      return all
        .slice()
        .reverse()
        .find((h) =>
          needle.some((n) =>
            (h.textContent || "").trim().toLowerCase().startsWith(n)
          )
        );
    };

    let heading = findRefsHeading();

    if (heading) {
      const pickList = () => {
        const sib = heading.nextElementSibling;
        if (sib && ["OL", "UL"].includes(sib.tagName)) return sib;
        const after =
          heading.parentElement?.querySelector(":scope > ol, :scope > ul") ||
          heading.parentElement?.querySelector(":scope ~ ol, :scope ~ ul");
        return after || null;
      };

      const listForRefs = pickList();
      const tempItems = listForRefs ? Array.from(listForRefs.children) : [];

      // build ref meta from each <li>
   const refs = tempItems.map((li, i) => {
  li.id = `ref-${i + 1}`;
  li.style.scrollMarginTop = "80px";

  const rawText = cleanSpaces(li.textContent || "");

  const year = extractYear(rawText);
  const author = extractAuthorShort(rawText);

  // 1) головне: пробуємо витягнути НАЗВУ ПРАЦІ з тексту (APA article title)
  const titleFromText = pickWorkTitleFromText(rawText, year);

  // 2) якщо WP реально виділив назву праці як <cite> — беремо її
  const citeTitle = li.querySelector?.("cite")?.textContent?.trim() || "";

  // 3) в крайньому випадку — якийсь italic (але це часто journal, тому тільки fallback)
  const italicFallback =
    li.querySelector?.("em, i")?.textContent?.trim() || "";

  const title = titleFromText || citeTitle || italicFallback || "";

  return { rawText, author, title, year };
});

      const citationHTML = (_match, num, loc = "", space = "", punct = "") => {
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

      // НЕ ЇМО пробіли перед “[” і після “]”, якщо після цитати йде слово.
      doc.body.innerHTML = doc.body.innerHTML.replace(
        /\[\s*(\d+)\s*(?:[,，;:]\s*([^\]]+?))?\s*](\s*)([.,;:!?…»”")\]])?/g,
        (_all, n, loc, space, punct) =>
          citationHTML("", n, loc || "", space || "", punct || "")
      );

      // re-find heading & list after replace
      heading = findRefsHeading();

      if (heading) {
        const listEl =
          (heading.nextElementSibling &&
            ["OL", "UL"].includes(heading.nextElementSibling.tagName) &&
            heading.nextElementSibling) ||
          heading.parentElement?.querySelector(":scope > ol, :scope > ul") ||
          heading.parentElement?.querySelector(":scope ~ ol, :scope ~ ul");

        if (listEl) {
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
        }
      }
    }

    /* ── /CITATIONS ───────────────────────────────────────── */

    /* ===== FLEX CARDS (trigger = list has at least one <li class="card-list">) ===== */
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
        while (next && next.nodeType === 3 && /^[\s:–—-]+$/.test(next.textContent)) {
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

    /* ===== INFO BOX: <p class="info-box"> → card with left accent ===== */
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

    /* push back */
    setHtml(doc.body.innerHTML);
    setToc(tocArr);
  }, [rawHtml]);

  return { html, toc, readingTime };
}
