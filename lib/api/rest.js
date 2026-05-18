const API_URL = process.env.NEXT_PUBLIC_WP_API;

/* ────────────────────────────────────────────────────────────── */
/* Basic helpers                                                 */
/* ────────────────────────────────────────────────────────────── */

const CACHE = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes
const isBrowser = typeof window !== "undefined";

/** Fetch → JSON with good error text */
async function fetchJson(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}\n${errorText}`);
  }
  return res.json();
}

/** Fetch → { data, totalPages } (reads WP pagination header) */
async function fetchJsonWithPages(url, { signal } = {}) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP fetch failed: ${res.status} ${res.statusText}\n${text}`);
  }
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  return { data: await res.json(), totalPages };
}

/** Browser-only cache for plain JSON */
async function cachedFetchJson(url, { signal } = {}) {
  if (!isBrowser) return fetchJson(url, { signal });

  const hit = CACHE.get(url);
  if (hit && Date.now() - hit.stored < TTL) return hit.data;

  const data = await fetchJson(url, { signal });
  CACHE.set(url, { data, stored: Date.now() });

  for (const [k, v] of CACHE) {
    if (Date.now() - v.stored >= TTL) CACHE.delete(k);
  }
  return data;
}

/**
 * Browser-only cache for paginated JSON.
 * Caches { data, totalPages } keyed by URL.
 * Bypasses cache when an AbortSignal is already aborted (safety).
 */
async function cachedFetchJsonWithPages(url, { signal } = {}) {
  if (!isBrowser) return fetchJsonWithPages(url, { signal });

  const hit = CACHE.get(url);
  if (hit && Date.now() - hit.stored < TTL) return hit.data;

  const result = await fetchJsonWithPages(url, { signal });
  CACHE.set(url, { data: result, stored: Date.now() });

  for (const [k, v] of CACHE) {
    if (Date.now() - v.stored >= TTL) CACHE.delete(k);
  }
  return result;
}

/* Small util to compose URLs with params */
function urlWithParams(base, params = {}) {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }
  return u.toString();
}

/* ────────────────────────────────────────────────────────────── */
/* Single-post / meta helpers                                    */
/* ────────────────────────────────────────────────────────────── */

export async function getPostBySlug(slug) {
  const normalizedSlug = decodeSlug(slug);
  const slugVariants = [...new Set([normalizedSlug, slug].filter(Boolean))];

  for (const variant of slugVariants) {
    const url = urlWithParams(`${API_URL}/posts`, {
      slug: variant,
      _embed: 1,
      status: "publish",
    });
    const posts = await cachedFetchJson(url);
    if (posts[0]) return posts[0];
  }

  return null;
}

function decodeSlug(slug = "") {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** Fetch *all* slugs (pages through the 100/item cap) */
export async function getAllSlugs() {
  const perPage = 100;

  const firstRes = await fetch(
    urlWithParams(`${API_URL}/posts`, {
      _fields: "slug",
      status: "publish",
      per_page: perPage,
      page: 1,
      orderby: "date",
      order: "desc",
    })
  );
  if (!firstRes.ok) throw new Error(await firstRes.text());

  const firstData = await firstRes.json();
  const totalPages = Number(firstRes.headers.get("X-WP-TotalPages") || 1);
  if (totalPages <= 1) return firstData.map((p) => p.slug);

  const requests = [];
  for (let page = 2; page <= totalPages; page++) {
    requests.push(
      fetch(
        urlWithParams(`${API_URL}/posts`, {
          _fields: "slug",
          status: "publish",
          per_page: perPage,
          page,
          orderby: "date",
          order: "desc",
        })
      ).then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        return r.json();
      })
    );
  }
  const rest = (await Promise.all(requests)).flat();
  return [...firstData, ...rest].map((p) => p.slug);
}

export async function getAllCategories() {
  const url = urlWithParams(`${API_URL}/categories`, {
    per_page: 100,
    _fields: "id,slug,name,count",
  });
  return cachedFetchJson(url);
}

/* ────────────────────────────────────────────────────────────── */
/* Paginated posts (lists & grids)                               */
/* ────────────────────────────────────────────────────────────── */

export async function getPosts(perPage = 10, { page = 1, signal } = {}) {
  const url = urlWithParams(`${API_URL}/posts`, {
    _embed: 1,
    status: "publish",
    orderby: "date",
    order: "desc",
    per_page: perPage,
    page,
  });
  const { data } = await cachedFetchJsonWithPages(url, { signal });
  return data;
}

export async function getPostsMeta(perPage = 10, { page = 1, signal } = {}) {
  const url = urlWithParams(`${API_URL}/posts`, {
    _embed: 1,
    status: "publish",
    orderby: "date",
    order: "desc",
    per_page: perPage,
    page,
  });
  return cachedFetchJsonWithPages(url, { signal });
}

export async function getPostsByCategories(
  ids = [],
  perPage = 10,
  { page = 1, signal } = {}
) {
  if (!ids.length) return getPosts(perPage, { page, signal });

  const url = urlWithParams(`${API_URL}/posts`, {
    _embed: 1,
    status: "publish",
    orderby: "date",
    order: "desc",
    per_page: perPage,
    page,
    categories: ids.join(","),
  });

  const { data } = await cachedFetchJsonWithPages(url, { signal });
  return data;
}

export async function getPostsByCategoriesMeta(
  ids = [],
  perPage = 10,
  { page = 1, signal } = {}
) {
  if (!ids.length) return getPostsMeta(perPage, { page, signal });

  const url = urlWithParams(`${API_URL}/posts`, {
    _embed: 1,
    status: "publish",
    orderby: "date",
    order: "desc",
    per_page: perPage,
    page,
    categories: ids.join(","),
  });

  return cachedFetchJsonWithPages(url, { signal });
}

export async function getPostsByAuthorMeta(authorId, perPage = 3, opts = {}) {
  const { signal, ...rest } = opts;
  const url = urlWithParams(`${API_URL}/posts`, {
    author: authorId,
    per_page: perPage,
    _embed: 1,
    status: "publish",
    orderby: "date",
    order: "desc",
    ...rest,
  });

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(res.statusText);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") || 1);
  return { data: await res.json(), totalPages };
}
