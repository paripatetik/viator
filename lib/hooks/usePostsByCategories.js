import { useEffect, useState, useCallback } from 'react';
import { getPostsByCategoriesMeta, getSearchPostsMeta } from '@/lib/api/rest';
import { normalizeSearchQuery } from '@/lib/postSearch';

// Keep each category/search combination separate when navigating back to it.
const STATE_CACHE = new Map();

export default function usePostsByCategories(
  selectedIds = [],
  perPage = 10,
  initialPosts = [],
  searchQuery = '',
) {
  const categoryKey = [...selectedIds].sort((a, b) => a - b).join(',');
  const search = normalizeSearchQuery(searchQuery);
  const queryKey = JSON.stringify([categoryKey, search, perPage]);
  const [request, setRequest] = useState({ key: queryKey, page: 1 });
  const page = request.key === queryKey ? request.page : 1;
  const [result, setResult] = useState(() => {
    const cached = STATE_CACHE.get(queryKey);
    const seed = !categoryKey && !search ? initialPosts : [];
    return {
      key: queryKey,
      posts: cached?.posts ?? seed,
      page: cached?.page ?? 1,
      hasMore: cached?.hasMore ?? true,
      loading: !cached && !seed.length,
      error: '',
    };
  });

  useEffect(() => {
    const cached = STATE_CACHE.get(queryKey);
    if (cached && cached.page >= page) {
      setResult({ ...cached, key: queryKey, loading: false, error: '' });
      return;
    }

    // Ignore superseded responses without aborting fetch during effect cleanup.
    // Cleanup also runs during React Strict Mode's development remount.
    let active = true;
    setResult((prev) => ({ ...prev, loading: true, error: '' }));
    const ids = categoryKey ? categoryKey.split(',').map(Number) : [];
    const options = { page };
    const fetcher = search
      ? getSearchPostsMeta(search, ids, perPage, options)
      : getPostsByCategoriesMeta(ids, perPage, options);

    fetcher.then(({ data, totalPages }) => {
      if (!active) return;
      const next = {
        posts: page === 1 ? data : [...(cached?.posts ?? []), ...data],
        page,
        hasMore: page < totalPages,
      };
      STATE_CACHE.set(queryKey, next);
      setResult({ ...next, key: queryKey, loading: false, error: '' });
    }).catch(() => {
      if (active) {
        setResult((prev) => ({
          ...prev,
          key: queryKey,
          loading: false,
          error: 'Не вдалося завантажити дописи. Спробуйте ще раз.',
        }));
      }
    });

    return () => { active = false; };
  }, [queryKey, categoryKey, search, page, perPage]);

  const loading = result.key !== queryKey || result.loading;
  const loadNextPage = useCallback(() => {
    if (!loading && result.hasMore) {
      setRequest({ key: queryKey, page: result.page + 1 });
    }
  }, [loading, result.hasMore, result.page, queryKey]);

  return { posts: result.posts, loading, error: result.error, hasMore: result.hasMore, loadNextPage };
}
