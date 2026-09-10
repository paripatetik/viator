let dismissTimer;
let scrollHandler;

export function clearArticleNavigation() {
  window.clearTimeout(dismissTimer);
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
  scrollHandler = undefined;
  document.getElementById("viator-cite-back")?.remove();
}

export function scrollToArticleTarget(target, { dismissOnScroll = true } = {}) {
  clearArticleNavigation();
  const previousY = window.scrollY;
  const button = document.createElement("button");
  button.id = "viator-cite-back";
  button.type = "button";
  button.textContent = "↑";
  button.className = "viator-cite-back";
  button.setAttribute("aria-label", "Повернутися назад");
  button.onclick = () => {
    window.scrollTo({ top: previousY, behavior: "smooth" });
    clearArticleNavigation();
  };
  document.body.appendChild(button);

  const offset = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue("--header-offset")) || 88;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - offset,
    behavior: "smooth",
  });

  if (dismissOnScroll) {
    dismissTimer = window.setTimeout(() => {
      const startY = window.scrollY;
      scrollHandler = () => {
        if (Math.abs(window.scrollY - startY) > 300) clearArticleNavigation();
      };
      window.addEventListener("scroll", scrollHandler, { passive: true });
    }, 800);
  }
}
