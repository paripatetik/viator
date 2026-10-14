import { htmlToPlainText } from "./text.js";

export function normalizeSearchQuery(value = "") {
  return value
    .normalize("NFKC")
    .replace(/[’‘ʼ`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("uk-UA");
}

export function filterPostsForSearch(posts, query, categoryIds = []) {
  const needle = normalizeSearchQuery(query);
  return posts.filter((post) => {
    if (categoryIds.length && !post.categories?.some((id) => categoryIds.includes(id))) {
      return false;
    }
    return [post.title?.rendered, post.excerpt?.rendered].some((html) => (
      normalizeSearchQuery(htmlToPlainText(html || "")).includes(needle)
    ));
  });
}
