import assert from "node:assert/strict";
import test from "node:test";
import { DOMParser } from "linkedom";
import { buildPostContent } from "../lib/postContent/transform.js";

function parse(html) {
  return new DOMParser().parseFromString(
    `<html><head></head><body>${html}</body></html>`,
    "text/html"
  );
}

test("article content and unique TOC targets are ready without browser globals", () => {
  assert.equal(typeof window, "undefined");
  assert.equal(typeof document, "undefined");
  const { html, toc } = buildPostContent(`
    <span class="rt-reading-time"><span class="rt-time">8</span> хв</span>
    <h2 id="custom-anchor">Вступ</h2><p>Текст &amp; пояснення.</p>
    <h2>Однакова назва</h2><p>Перший розділ.</p>
    <h2>Однакова назва</h2><p>Другий розділ.</p>
  `);
  const doc = parse(html);
  assert.equal(toc.length, 3);
  assert.equal(new Set(toc.map(({ id }) => id)).size, 3);
  assert.equal(toc[0].id, "custom-anchor");
  for (const { id, text } of toc) {
    assert.equal(doc.getElementById(id)?.textContent, text);
  }
  assert.match(doc.body.textContent, /Текст & пояснення/);
  assert.match(doc.body.textContent, /Другий розділ/);
  assert.equal(doc.querySelector(".rt-reading-time"), null);
});

test("references have native links and unknown citation numbers keep their text", () => {
  const { html } = buildPostContent(`
    <h2>Твердження</h2><p>Відоме [1, 12]. Невідоме [9].</p>
    <h2>Джерела</h2><ol>
      <li>Автор, І. (2024). Назва праці. <a href="https://example.org/work">Читати</a></li>
    </ol>
  `);
  const doc = parse(html);
  const link = doc.querySelector("a.viator-cite-badge");
  assert.ok(link);
  assert.ok(doc.getElementById(link.getAttribute("href").slice(1)));
  assert.match(doc.body.textContent, /Невідоме \[9\]/);
  assert.match(doc.querySelector("sup").getAttribute("data-tip"), /2024.*p\. 12/);
  assert.equal(doc.querySelector("[onclick]"), null);
  assert.equal(doc.querySelector("#ref-1 a").getAttribute("href"), "https://example.org/work");
});

test("figures and info boxes produce valid block structure without losing surrounding text", () => {
  const { html } = buildPostContent(`
    <p>До зображення<img src="/example.jpg" alt="Підпис" width="320">Після зображення</p>
    <p class="info-box" id="note"><strong>Назва</strong>:<br>Пояснення.</p>
    <blockquote><p>Цитата.</p><cite>Автор цитати</cite></blockquote>
  `, "heading-font");
  const doc = parse(html);
  assert.equal(doc.querySelector("p figure, p div"), null);
  assert.match(doc.body.textContent, /До зображення/);
  assert.match(doc.body.textContent, /Після зображення/);
  assert.equal(doc.querySelector("figcaption").textContent, "Підпис");
  assert.equal(doc.querySelector("figure").style.getPropertyValue("--viator-img-width"), "320px");
  assert.match(doc.querySelector("#note [role=note]").textContent, /Назва[\s\S]*Пояснення/);
  assert.ok(doc.querySelector("blockquote.heading-font cite.viator-quote-cite"));
});

test("card lists retain titles, body copy and images during server processing", () => {
  const { html } = buildPostContent(`
    <ul><li class="card-list"><span>Назва картки</span>: Опис картки.</li></ul>
    <figure style="width:400px"><img src="/photo.jpg" alt="Фото" srcset="/photo.jpg 400w"><figcaption>Автор <a href="https://example.org">світлини</a></figcaption></figure>
  `);
  const doc = parse(html);
  assert.match(doc.querySelector("li").textContent, /Назва картки[\s\S]*Опис картки/);
  assert.equal(doc.querySelector("img").getAttribute("src"), "/photo.jpg");
  assert.equal(doc.querySelector("figcaption a").getAttribute("target"), "_blank");
  assert.equal(doc.querySelector("figure").style.getPropertyValue("--viator-img-width"), "400px");
});
