import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { act, createElement, StrictMode } from "react";
import { parseHTML } from "linkedom";

test("Strict Mode cleanup and rapid search changes ignore stale responses without abort errors", async (t) => {
  const { window, document } = parseHTML("<html><body><div id='root'></div></body></html>");
  const previousGlobals = new Map();
  for (const [key, value] of Object.entries({ window, document, IS_REACT_ACT_ENVIRONMENT: true })) {
    previousGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const oldApi = process.env.NEXT_PUBLIC_WP_API;
  process.env.NEXT_PUBLIC_WP_API = "https://example.test/wp-json/wp/v2";
  t.after(() => {
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    if (oldApi === undefined) delete process.env.NEXT_PUBLIC_WP_API;
    else process.env.NEXT_PUBLIC_WP_API = oldApi;
  });

  const requests = [];
  const newPost = { id: 5000, categories: [4], title: { rendered: "Новий допис" }, excerpt: { rendered: "" } };
  t.mock.method(globalThis, "fetch", (input, options) => {
    const url = new URL(input);
    // Effect cleanup must not pass a signal that can trigger a fetch abort.
    assert.equal(options?.signal, undefined);
    if (url.searchParams.has("_fields")) {
      return Promise.resolve(new Response(JSON.stringify([newPost]), { headers: { "X-WP-TotalPages": "1" } }));
    }
    return new Promise((resolve, reject) => requests.push({ url, resolve, reject }));
  });

  // Resolve Next's import aliases for Node; execute the actual hook unchanged.
  const source = (await readFile(new URL("../lib/hooks/usePostsByCategories.js", import.meta.url), "utf8"))
    .replace("from 'react'", `from '${import.meta.resolve("react")}'`)
    .replace("from '@/lib/api/rest'", `from '${new URL("../lib/api/rest.js", import.meta.url)}'`)
    .replace("from '@/lib/postSearch'", `from '${new URL("../lib/postSearch.js", import.meta.url)}'`);
  const { default: usePostsByCategories } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  let latest;
  function Probe({ query = "", ids = [4] }) {
    latest = usePostsByCategories(ids, 10, [], query);
    return createElement("div", null, latest.posts.map((post) => post.id).join(","));
  }
  const render = (props) => act(async () => root.render(createElement(StrictMode, null, createElement(Probe, props))));

  await render({});
  assert.equal(requests.length, 2); // Strict Mode setup → cleanup → setup.
  const oldRequests = [...requests];
  await render({ query: "новий" });
  const searchRequest = requests.find(({ url }) => url.searchParams.get("include") === "5000");
  assert.ok(searchRequest);
  await act(async () => searchRequest.resolve(new Response(JSON.stringify([newPost]))));
  assert.deepEqual(latest.posts.map((post) => post.id), [5000]);
  assert.equal(latest.loading, false);

  await act(async () => {
    oldRequests[0].resolve(new Response(JSON.stringify([{ id: 1 }])));
    oldRequests[1].reject(new Error("Old request failed"));
  });
  assert.deepEqual(latest.posts.map((post) => post.id), [5000]);
  assert.equal(latest.error, "");

  await render({ ids: [9] });
  const pending = requests.at(-1);
  await act(async () => root.unmount());
  await act(async () => pending.reject(new Error("Response after unmount")));
});
