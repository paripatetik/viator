const STYLE_ID = "viator-postcontent-style";

const POST_CONTENT_CSS = `
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
  figure.viator-figure {
    overflow: visible;
    box-shadow: none;
  }
  figure.viator-figure:hover {
    box-shadow: none;
  }
  figure.viator-figure img {
    border-radius: 14px 14px 0 0;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  figure.viator-figure figcaption.viator-caption {
    max-height: none;
    padding: 12px 18px 14px;
    opacity: 1;
    transform: none;
    transition: none;
    border-top: 1px solid rgba(148, 180, 193, 0.36);
    border-radius: 0 0 14px 14px;
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

export function injectPostContentStyles() {
  if (typeof document === "undefined") return;

  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = POST_CONTENT_CSS;
}
