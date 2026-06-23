const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const initGoToRefHandler = () => {
  if (typeof window === "undefined" || window.__viatorGoToRef) return;

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
};

const initCitationTooltip = () => {
  if (typeof window === "undefined" || window.__viatorCiteTooltipInit) return;
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

  const hide = () => {
    const tip = ensureTipEl();
    tip.style.display = "none";
  };

  const showForSup = (sup) => {
    const tip = ensureTipEl();
    const html = sup?.getAttribute?.("data-tip") || "";
    if (!html) return hide();

    tip.innerHTML = html;
    tip.style.display = "block";
    tip.style.visibility = "hidden";
    tip.style.left = "0px";
    tip.style.top = "0px";
    tip.style.transform = "translate(-50%, -100%)";

    const r = sup.getBoundingClientRect();
    let x = r.left + r.width / 2;
    const yTop = r.top - 10;

    tip.style.left = `${x}px`;
    tip.style.top = `${yTop}px`;
    tip.style.visibility = "visible";

    const tr = tip.getBoundingClientRect();
    const pad = 12;
    const half = tr.width / 2;

    x = clamp(x, half + pad, window.innerWidth - half - pad);

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
    if (isTooltip(e.relatedTarget)) return;
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
};

const initLightbox = () => {
  if (typeof window === "undefined" || window.__viatorLightboxInit) return;
  window.__viatorLightboxInit = true;

  const getCaption = (figure) => {
    const cap = figure?.querySelector("figcaption");
    return cap?.textContent ? cap.textContent.trim() : "";
  };

  const collectGallery = () => {
    const figures = Array.from(document.querySelectorAll("figure.viator-figure"));

    return figures
      .map((fig) => {
        const img = fig.querySelector("img");
        if (!img) return null;

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

  let items = [];
  let idx = 0;
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragStartX = 0;
  let dragStartY = 0;

  const applyTransform = () => {
    const lb = document.getElementById("viator-lightbox");
    const img = lb?.querySelector(".viator-lb-img");
    if (!img) return;
    img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
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

  const openAt = (nextItems, nextIdx) => {
    items = nextItems || [];
    if (!items.length) return;

    idx = clamp(nextIdx ?? 0, 0, items.length - 1);

    const lb = createLightbox();
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";

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
    scale = 1;
    posX = 0;
    posY = 0;
    applyTransform();
  };

  const setIdx = (next) => {
    if (!items.length) return;
    idx = (next + items.length) % items.length;
    scale = 1;
    posX = 0;
    posY = 0;
    render();
  };

  document.addEventListener("click", (e) => {
    const img = e.target.closest("figure.viator-figure img");
    if (!img) return;

    const gallery = collectGallery();
    if (!gallery.length) return;

    const clickedIdx = gallery.findIndex((it) => it.img === img);
    openAt(gallery, clickedIdx >= 0 ? clickedIdx : 0);
  });

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

  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("viator-lightbox");
    if (!lb || !lb.classList.contains("is-open")) return;

    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") setIdx(idx - 1);
    if (e.key === "ArrowRight") setIdx(idx + 1);
  });

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

  document.addEventListener(
    "wheel",
    (e) => {
      const lb = document.getElementById("viator-lightbox");
      if (!lb || !lb.classList.contains("is-open")) return;

      const stage = e.target.closest(".viator-lb-stage");
      if (!stage) return;

      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      scale = clamp(scale + delta, 1, 6);
      if (scale === 1) {
        posX = 0;
        posY = 0;
      }
      applyTransform();
    },
    { passive: false }
  );

  let tMode = "none";
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

  const isStageTarget = (target) => !!target.closest(".viator-lb-stage");

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

      if (tMode === "swipe" && e.touches.length === 1) return;

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

      if (tMode === "pinch" && e.touches.length === 1) {
        tMode = scale > 1 ? "pan" : "swipe";
        const t = e.touches[0];
        tLastX = t.clientX;
        tLastY = t.clientY;
        return;
      }

      if (e.touches.length === 0) {
        tMode = "none";
      }
    },
    { passive: true }
  );
};

export function initPostContentDomHandlers() {
  initGoToRefHandler();
  initCitationTooltip();
  initLightbox();
}
