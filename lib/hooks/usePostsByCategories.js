// lib/hooks/usePostsByCategories.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  getPostsMeta,
  getPostsByCategoriesMeta,
} from '@/lib/api/rest';

/**
 * Module-level cache — survives client-side navigation.
 * Only written after a successful fetch, never with empty data.
 * Key: queryKey  →  { posts, page, hasMore }
 */
const STATE_CACHE = new Map();

export default function usePostsByCategories(selectedIds = [], perPage = 10) {
  const queryKey = useMemo(
    () => [...selectedIds].sort((a, b) => a - b).join(','),
    [selectedIds],
  );

  // Seed from cache on first render — gives scroll-restoration a stable layout
  const cached = STATE_CACHE.get(queryKey);

  const [posts,   setPosts]   = useState(cached?.posts   ?? []);
  const [page,    setPage]    = useState(cached?.page    ?? 1);
  const [loading, setLoading] = useState(!cached);
  const [error,   setError]   = useState('');
  const [hasMore, setHasMore] = useState(cached?.hasMore ?? true);

  const abort = useRef(null);

  /* Reset when filter changes */
  useEffect(() => {
    const hit = STATE_CACHE.get(queryKey);
    if (hit) {
      setPosts(hit.posts);
      setPage(hit.page);
      setHasMore(hit.hasMore);
      setLoading(false);
      setError('');
    } else {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
    }
  }, [queryKey]);

  /* Fetch — skipped when cache already covers this page */
  useEffect(() => {
    const hit = STATE_CACHE.get(queryKey);
    if (hit && hit.page >= page) return;
    if (!hasMore && page > 1) return;

    setLoading(true);
    setError('');
    abort.current?.abort();
    abort.current = new AbortController();

    const fetcher =
      queryKey === ''
        ? getPostsMeta(perPage, { page, signal: abort.current.signal })
        : getPostsByCategoriesMeta(queryKey.split(',').map(Number), perPage, {
            page,
            signal: abort.current.signal,
          });

    fetcher
      .then(({ data, totalPages }) => {
        setPosts(prev => {
          const next = page === 1 ? data : [...prev, ...data];
          // Write to cache only after a successful fetch
          STATE_CACHE.set(queryKey, { posts: next, page, hasMore: page < totalPages });
          return next;
        });
        setHasMore(page < totalPages);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError('Помилка завантаження.');
      })
      .finally(() => setLoading(false));

    return () => abort.current?.abort();
  }, [queryKey, page, perPage, hasMore]);

  const loadNextPage = useCallback(
    () => hasMore && !loading && setPage(p => p + 1),
    [hasMore, loading],
  );

  return { posts, loading, error, loadNextPage, hasMore };
}