export const slugify = (str = "") =>
  str
    .toLowerCase()
    .trim()
    .replace(/&amp;|&/g, "-and-")
    .replace(/[^\w\u0400-\u04FF\- ]+/g, "")
    .replace(/\s+/g, "-");

export const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const cleanSpaces = (s = "") =>
  String(s)
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/[\u00A0\u202F\u2009\u200A\u2007\u2060\u200B]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
