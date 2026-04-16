import clsx from "clsx";

export const cn = (...inputs) => clsx(inputs);

export const heroImageBlurDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%233B5560'/%3E%3Cstop offset='0.55' stop-color='%2394B4C1'/%3E%3Cstop offset='1' stop-color='%231E2A32'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='16' height='9' fill='url(%23g)'/%3E%3C/svg%3E";

export const heroHeightStyle = {
  height: "var(--hero-h, calc(100vh - var(--header-h, 4rem)))",
  backgroundColor: "#3B5560",
};
export const heroMinHeightStyle = {
  minHeight: "var(--hero-h, calc(100vh - var(--header-h, 4rem)))",
  backgroundColor: "#3B5560",
};

export const layoutStyles = {
  page: "container mx-auto px-6 lg:px-10",
  pageCompact: "container mx-auto px-4",
  proseNarrow: "max-w-3xl mx-auto",
  proseWide: "container max-w-4xl mx-auto px-6",
  pageY: "py-12 lg:py-16",
};

export const heroStyles = {
  root: "relative isolate w-full overflow-hidden bg-viator-deep",
  title:
    "text-center text-4xl font-extrabold tracking-wider uppercase md:text-6xl drop-shadow text-white",
  subtitle:
    "text-lg sm:text-xl lg:text-2xl text-center bg-black/70 p-2 text-white",
};

export const typeStyles = {
  sectionHeading:
    "text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-viator-ink",
  relatedHeading:
    "text-3xl md:text-4xl font-bold text-center uppercase tracking-wider",
  bodySerif: "text-[19px] lg:text-[22px] leading-relaxed",
};

export const buttonStyles = {
  primary:
    "bg-viator-sun border-2 border-black text-black uppercase font-bold tracking-wide px-10 py-3 rounded-full hover:bg-slate-100 active:scale-95 transition disabled:opacity-60",
  loadMore:
    "bg-viator-clay px-6 py-3 text-xl font-semibold text-white rounded-full hover:bg-viator-ink active:scale-95 transition-colors",
  categoryTrigger:
    "flex items-center gap-1 px-3 py-2 rounded bg-viator-sky/75 text-base uppercase",
  categoryPill:
    "px-3 py-1 rounded-full bg-viator-cream text-black uppercase",
};

export const imageLinkStyles = {
  root: "inline-flex flex-col items-center group",
  frame:
    "relative w-58 h-22 md:w-64 lg:w-70 rounded-md overflow-hidden shadow-md ring-1 ring-black/5 group-hover:scale-[1.02] group-hover:shadow-lg transition",
  image: "object-cover object-center h-[100%] bg-white p-2 rounded-md",
  label: "mt-2 text-sm md:text-base text-slate-700",
};

export const accentStyles = {
  shortRule: "h-1 w-20 bg-viator-sky mt-4",
};
