import { htmlToPlainText } from "./text.js";

export function getReadingTimeMinutes(post) {
  const html = post.content?.rendered || "";
  // WordPress includes its configured reading time in the rendered content.
  // Read it without browser APIs so cards and articles also agree during SSR.
  const embeddedTime = html.match(
    /<span\b[^>]*\bclass\s*=\s*(["'])[^"']*\brt-time\b[^"']*\1[^>]*>([\s\S]*?)<\/span>/i
  );
  const wordpressMinutes = embeddedTime
    ? Number(htmlToPlainText(embeddedTime[2]))
    : NaN;

  if (Number.isFinite(wordpressMinutes) && wordpressMinutes > 0) {
    return Math.ceil(wordpressMinutes);
  }

  const storedMinutes = Number(post.reading_time);
  if (Number.isFinite(storedMinutes) && storedMinutes > 0) {
    return Math.ceil(storedMinutes);
  }

  const text = htmlToPlainText(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
  );
  const wordCount = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}
