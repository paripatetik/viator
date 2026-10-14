import assert from "node:assert/strict";
import test from "node:test";
import { filterPostsForSearch } from "../lib/postSearch.js";

const post = (id, title, excerpt, categories = [4]) => ({
  id, categories, title: { rendered: title }, excerpt: { rendered: excerpt },
});

test("search matches either title or rendered excerpt, ignoring case and markup", () => {
  const posts = [
    post(1, "Свідомість &amp; мозок", "Інший текст"),
    post(2, "Питання", "<p>Про <em>СВІДОМІСТЬ</em> та пам’ять.</p>"),
    { ...post(3, "Питання", "Інший текст"), content: { rendered: "Свідомість" } },
  ];
  assert.deepEqual(filterPostsForSearch(posts, "  свідомість  ").map((p) => p.id), [1, 2]);
  assert.deepEqual(filterPostsForSearch(posts, "свідомість & мозок").map((p) => p.id), [1]);
  assert.deepEqual(filterPostsForSearch(posts, "ПАМ'ЯТЬ").map((p) => p.id), [2]);
  assert.deepEqual(filterPostsForSearch(posts, "про   свідомість").map((p) => p.id), [2]);
});

test("search intersects selected categories, supports partial words and empty queries", () => {
  const posts = [post(1, "Філософія", "", [4]), post(2, "Філософія", "", [8, 9])];
  assert.deepEqual(filterPostsForSearch(posts, "філос", [9]).map((p) => p.id), [2]);
  assert.deepEqual(filterPostsForSearch(posts, "філос", [4, 9]).map((p) => p.id), [1, 2]);
  assert.deepEqual(filterPostsForSearch(posts, "   ", [4]).map((p) => p.id), [1]);
  assert.deepEqual(filterPostsForSearch(posts, "немає"), []);
  assert.deepEqual(filterPostsForSearch([{ id: 3 }], "текст"), []);
});

test("API search covers every index page and paginates matching cards", async (t) => {
  const oldApi = process.env.NEXT_PUBLIC_WP_API;
  process.env.NEXT_PUBLIC_WP_API = "https://example.test/wp-json/wp/v2";
  t.after(() => {
    if (oldApi === undefined) delete process.env.NEXT_PUBLIC_WP_API;
    else process.env.NEXT_PUBLIC_WP_API = oldApi;
  });
  const { getSearchPostsMeta } = await import("../lib/api/rest.js");
  const firstPage = Array.from({ length: 100 }, (_, i) => post(i + 1, "Інша тема", ""));
  const secondPage = [
    post(101, "Свідомість", ""),
    post(102, "Питання", "<p>Свідомість та мозок</p>"),
    post(103, "Свідомість", "", [9]),
  ];
  const requests = [];
  let failIndex = false;
  t.mock.method(globalThis, "fetch", async (input) => {
    const url = new URL(input);
    requests.push(url);
    assert.equal(url.searchParams.get("status"), "publish");
    if (url.searchParams.has("_fields")) {
      assert.equal(url.searchParams.get("_fields"), "id,title,excerpt,categories");
      const page = Number(url.searchParams.get("page"));
      if (failIndex && page === 2) return new Response("Unavailable", { status: 503 });
      return new Response(JSON.stringify(page === 1 ? firstPage : secondPage), {
        headers: { "X-WP-TotalPages": "2" },
      });
    }
    assert.equal(url.searchParams.get("orderby"), "include");
    assert.equal(url.searchParams.get("_embed"), "1");
    const ids = url.searchParams.get("include").split(",").map(Number);
    return new Response(JSON.stringify(secondPage.filter((p) => ids.includes(p.id))));
  });

  const first = await getSearchPostsMeta("свідомість", [4], 1);
  assert.deepEqual(first.data.map((p) => p.id), [101]);
  assert.equal(first.totalPages, 2);
  const second = await getSearchPostsMeta("свідомість", [4], 1, { page: 2 });
  assert.deepEqual(second.data.map((p) => p.id), [102]);
  const allCategories = await getSearchPostsMeta("свідомість", [], 10);
  assert.deepEqual(allCategories.data.map((p) => p.id), [101, 102, 103]);

  requests.length = 0;
  assert.deepEqual(await getSearchPostsMeta("немає"), { data: [], totalPages: 0 });
  assert.equal(requests.length, 2); // No request for full cards without matches.

  const controller = new AbortController();
  controller.abort();
  requests.length = 0;
  await assert.rejects(getSearchPostsMeta("свідомість", [], 10, { signal: controller.signal }), { name: "AbortError" });
  assert.equal(requests.length, 0);

  failIndex = true;
  await assert.rejects(getSearchPostsMeta("свідомість"), /503/);
});
